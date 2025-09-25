chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cut-card",
    title: "Cut card",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "cut-card") return;
  
  // Ask content script for selection + meta
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const sel = window.getSelection();
      const text = sel ? sel.toString() : "";
      const m = (name, prop) =>
        document.querySelector(`meta[name="${name}"]`)?.content ||
        document.querySelector(`meta[property="${prop}"]`)?.content || "";

      // Try JSON-LD
      let jsonld = {};
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const obj = JSON.parse(s.textContent);
          const art = Array.isArray(obj) ? obj.find(o => o['@type']?.includes?.("Article") || o['@type']==="Article") : obj;
          if (art?.datePublished || art?.author || art?.headline) { jsonld = art; break; }
        } catch {}
      }

      const title = jsonld.headline || m("og:title","og:title") || document.title;
      const site = m("og:site_name","og:site_name") || location.hostname;
      const author = (jsonld.author && (jsonld.author.name || jsonld.author)) || m("author","article:author") || "";
      const datePublished = jsonld.datePublished || m("article:published_time","article:published_time") || "";

      return {
        text,
        meta: { title, site, author, datePublished, url: location.href }
      };
    }
  });

  chrome.storage.session.set({ draftCardPayload: result });
  chrome.action.openPopup();
});
