// Content script for DOM scraping and meta data extraction
// This is kept minimal for MVP as background.js handles the main scraping

// Listen for messages from background script if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelection") {
    const selection = window.getSelection();
    sendResponse({
      text: selection ? selection.toString() : "",
      range: selection && selection.rangeCount > 0 ? {
        startOffset: selection.getRangeAt(0).startOffset,
        endOffset: selection.getRangeAt(0).endOffset
      } : null
    });
  }
});
