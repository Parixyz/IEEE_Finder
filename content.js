function scrapeIEEEPage() {
  const anchors = Array.from(document.querySelectorAll('a[href*="/document/"]'));
  const seen = new Set();
  const articles = [];

  for (const anchor of anchors) {
    const href = anchor.getAttribute("href");
    if (!href) continue;

    const url = href.startsWith("http") ? href : new URL(href, location.origin).toString();
    if (seen.has(url)) continue;
    seen.add(url);

    const container =
      anchor.closest("xpl-result-item") ||
      anchor.closest(".List-results-items") ||
      anchor.closest(".result-item") ||
      anchor.closest("li") ||
      anchor.parentElement;

    const title = (anchor.textContent || "").trim();
    if (!title) continue;

    const abstract =
      container?.querySelector('[class*="description"], [class*="abstract"]')?.textContent?.trim() || "";

    const authors = Array.from(
      container?.querySelectorAll('[class*="author"], a[href*="/author/"]') || []
    )
      .map((el) => (el.textContent || "").trim())
      .filter(Boolean)
      .slice(0, 10);

    const source =
      container?.querySelector('[class*="publisher"], [class*="publication"], [class*="source"]')
        ?.textContent?.trim() || "";

    articles.push({
      title,
      url,
      authors,
      source,
      abstract,
      pageUrl: location.href,
      capturedAt: new Date().toISOString()
    });
  }

  return articles;
}

async function maybeEnrichWithGPT(articles, settings) {
  if (!settings?.apiKey || settings?.mode !== "gpt") {
    return articles;
  }

  const payload = {
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You normalize article metadata. Return strict JSON array where each item has: title,url,authors(array),source,abstract,tags(array)."
      },
      {
        role: "user",
        content: JSON.stringify(articles)
      }
    ],
    text: { format: { type: "text" } }
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn("GPT enrichment failed", await response.text());
      return articles;
    }

    const data = await response.json();
    const outputText = data?.output_text || data?.output?.[0]?.content?.[0]?.text || "";
    const parsed = JSON.parse(outputText);

    if (!Array.isArray(parsed)) return articles;

    return parsed.map((item, index) => ({
      ...articles[index],
      ...item,
      authors: Array.isArray(item.authors) ? item.authors : articles[index]?.authors || [],
      tags: Array.isArray(item.tags) ? item.tags : []
    }));
  } catch (error) {
    console.warn("Unable to enrich with GPT", error);
    return articles;
  }
}

async function collectAndStore() {
  const { settings = {} } = await chrome.storage.local.get(["settings"]);
  const scraped = scrapeIEEEPage();
  const enriched = await maybeEnrichWithGPT(scraped, settings);

  chrome.runtime.sendMessage({ type: "ADD_ARTICLES", articles: enriched }, (result) => {
    console.info("IEEE Finder add page result", result);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ADD_CURRENT_PAGE") {
    collectAndStore().then(() => sendResponse({ ok: true }));
    return true;
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditable =
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (!isEditable && event.key.toLowerCase() === "i") {
    collectAndStore();
  }
});
