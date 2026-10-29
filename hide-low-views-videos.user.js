// ==UserScript==
// @name         YouTube Hide Low Views Videos
// @version      1.1.4
// @description  Hide YouTube homepage and player sidebar videos published with low views
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
  const HIDDEN_ATTR = "data-hide-low-views-videos-hidden";

  function isSupportedPage() {
    return window.location.pathname === "/" || window.location.pathname === "/watch";
  }

  function parseViews(text) {
    if (!text) return 0;
    text = text.toLowerCase().replace(/,/g, "");

    const match = text.match(/(\d+(?:\.\d+)?)\s*(k|m|b|thousand|million|billion)?/);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const unit = match[2] || "";
    if (unit === "k" || unit === "thousand") return num * 1e3;
    if (unit === "m" || unit === "million") return num * 1e6;
    if (unit === "b" || unit === "billion") return num * 1e9;
    return isNaN(num) ? 0 : num;
  }

  function parseHoursAgo(text) {
    if (!text) return Infinity;
    text = text.toLowerCase();

    const shortMatch = text.match(/(\d+(?:\.\d+)?)\s*(mo|m|h|d|w|y)\b/);
    if (shortMatch) {
      const num = parseFloat(shortMatch[1]);
      const unit = shortMatch[2];
      if (unit === "m") return num / 60;
      if (unit === "h") return num;
      if (unit === "d") return num * 24;
      if (unit === "w") return num * 24 * 7;
      if (unit === "mo") return num * 24 * 30;
      if (unit === "y") return num * 24 * 365;
    }

    const num = parseFloat(text.match(/\d+(?:\.\d+)?/)?.[0]);
    if (text.includes("minute")) return num / 60;
    if (text.includes("hour")) return num;
    if (text.includes("day")) return num * 24;
    if (text.includes("week")) return num * 24 * 7;
    if (text.includes("month")) return num * 24 * 30;
    if (text.includes("year")) return num * 24 * 365;

    return Infinity;
  }

  function isTimeText(text) {
    return /(?:\b(minute|hour|day|week|month|year)s?\s+ago\b|\b\d+(?:\.\d+)?\s*(?:mo|[mhdwy])\s+ago\b)/i.test(
      text,
    );
  }

  function isViewsText(text) {
    return (
      /\bviews?\b/i.test(text) ||
      /^\s*\d[\d,.]*\s*(k|m|b|thousand|million|billion)?\s*$/i.test(text)
    );
  }

  function getMetadataText(el) {
    return el.getAttribute("aria-label") || el.textContent || "";
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
          const text = getMetadataText(span);
          // Skip channel name links (they contain <a> tags)
          if (span.querySelector("a")) continue;
          if (!viewsText && isViewsText(text) && !isTimeText(text)) {
            viewsText = text;
          } else if (!timeText && isTimeText(text)) {
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
          viewsText = getMetadataText(parts[0]);
          timeText = getMetadataText(parts[1]);
        }
      }
    }

    // Additional fallback: search broadly for metadata rows
    if (!viewsText || !timeText) {
      const allRows = item.querySelectorAll(
        '[class*="metadata"] [role="text"], [class*="Metadata"] [role="text"]',
      );
      for (const el of allRows) {
        const text = getMetadataText(el);
        if (!viewsText && isViewsText(text) && !isTimeText(text)) {
          viewsText = text;
        } else if (!timeText && isTimeText(text)) {
          timeText = text;
        }
      }
    }

    return { viewsText, timeText };
  }

  function restoreHiddenVideos() {
    const hiddenItems = document.querySelectorAll(`[${HIDDEN_ATTR}="true"]`);
    for (const item of hiddenItems) {
      item.style.removeProperty("display");
      item.removeAttribute(HIDDEN_ATTR);
    }
  }

  function hideLowViewOldVideos() {
    if (!isSupportedPage()) {
      restoreHiddenVideos();
      return;
    }

    const items = document.querySelectorAll(CONTAINER_SELECTOR);
    for (const item of items) {
      // Skip items hidden by other YouTube/UI code.
      if (item.style.display === "none" && !item.hasAttribute(HIDDEN_ATTR)) continue;

      const { viewsText, timeText } = extractMetadata(item);

      if (!viewsText || !timeText) continue;

      const views = parseViews(viewsText);
      const hours = parseHoursAgo(timeText);

      if (views < MAX_VIEWS && hours >= MIN_HOURS) {
        item.setAttribute(HIDDEN_ATTR, "true");
        item.style.display = "none";
      } else if (item.hasAttribute(HIDDEN_ATTR)) {
        item.style.removeProperty("display");
        item.removeAttribute(HIDDEN_ATTR);
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
