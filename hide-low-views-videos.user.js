// ==UserScript==
// @name         YouTube Hide Low Views Videos
// @version      1.1.0
// @description  Hide YouTube homepage videos published with low views
// @author       umbertoragone
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://*.music.youtube.com/*
// @compatible   chrome
// @compatible   firefox
// @compatible   opera
// @compatible   safari
// @compatible   edge
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
  "use strict";

  const MIN_HOURS = 12;
  const MAX_VIEWS = 1000;

  const CONTAINER_SELECTOR =
    "ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-video-renderer, yt-lockup-view-model";

  function parseViews(text) {
    if (!text) return 0;
    text = text.toLowerCase().replace(/[^0-9.km]/g, "");
    if (text.endsWith("k")) return parseFloat(text) * 1e3;
    if (text.endsWith("m")) return parseFloat(text) * 1e6;
    const num = parseFloat(text);
    return isNaN(num) ? 0 : num;
  }

  function parseHoursAgo(text) {
    if (!text) return Infinity;
    text = text.toLowerCase();

    const num = parseFloat(text);
    if (text.includes("minute")) return num / 60;
    if (text.includes("hour")) return num;
    if (text.includes("day")) return num * 24;
    if (text.includes("week")) return num * 24 * 7;
    if (text.includes("month")) return num * 24 * 30;
    if (text.includes("year")) return num * 24 * 365;

    return Infinity;
  }

  function extractMetadata(item) {
    let viewsText = "";
    let timeText = "";

    // Try new layout first (yt-lockup-view-model)
    const newMetadata = item.querySelector("yt-content-metadata-view-model");
    if (newMetadata) {
      const rows = newMetadata.querySelectorAll(
        ".ytContentMetadataViewModelMetadataRow",
      );
      for (const row of rows) {
        const spans = row.querySelectorAll('span[role="text"]');
        for (const span of spans) {
          const text = span.textContent || "";
          // Skip channel name links (they contain <a> tags)
          if (span.querySelector("a")) continue;
          if (!viewsText && /^\d/.test(text)) {
            viewsText = text;
          } else if (
            !timeText &&
            /\b(minute|hour|day|week|month|year)s?\s+ago\b/.test(text)
          ) {
            timeText = text;
          }
        }
      }
    }

    // Fall back to old layout
    if (!viewsText || !timeText) {
      const metadata = item.querySelector(
        ".yt-content-metadata-view-model__metadata-row",
      );
      if (metadata) {
        const parts =
          metadata.parentElement?.querySelectorAll("span[role='text']");
        if (parts && parts.length >= 2) {
          viewsText = parts[0].textContent || "";
          timeText = parts[1].textContent || "";
        }
      }
    }

    // Additional fallback: search broadly for metadata rows
    if (!viewsText || !timeText) {
      const allRows = item.querySelectorAll(
        '[class*="metadata"] [role="text"], [class*="Metadata"] [role="text"]',
      );
      for (const el of allRows) {
        const text = el.textContent || "";
        if (!viewsText && /^\d[\d,.KM]*\s*views?$/i.test(text)) {
          viewsText = text;
        } else if (
          !timeText &&
          /\b(minute|hour|day|week|month|year)s?\s+ago\b/i.test(text)
        ) {
          timeText = text;
        }
      }
    }

    return { viewsText, timeText };
  }

  function hideLowViewOldVideos() {
    const items = document.querySelectorAll(CONTAINER_SELECTOR);
    for (const item of items) {
      // Skip already hidden items
      if (item.style.display === "none") continue;

      const { viewsText, timeText } = extractMetadata(item);

      if (!viewsText || !timeText) continue;

      const views = parseViews(viewsText);
      const hours = parseHoursAgo(timeText);

      if (views < MAX_VIEWS && hours >= MIN_HOURS) {
        item.style.display = "none";
      }
    }
  }

  const observer = new MutationObserver(hideLowViewOldVideos);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("yt-navigate-finish", hideLowViewOldVideos);
  window.addEventListener("scroll", hideLowViewOldVideos, { passive: true });

  console.log("[YouTube Hide Low Views Videos] Loaded");
  hideLowViewOldVideos();
})();
