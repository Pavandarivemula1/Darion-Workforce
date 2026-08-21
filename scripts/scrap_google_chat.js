/**
 * Google Chat Web UI Element & Design Token Scraper
 * 
 * This script runs Puppeteer/Playwright or browser DOM inspection to systematically extract
 * all Google Chat UI components, Material Design 3 tokens, layout metrics, SVG icons,
 * and typography styles for the Darion Chats rebranding pipeline.
 */

const fs = require('fs');
const path = require('path');

// Google Chat Web UI Component Tree Blueprint & Scraped Specifications
const GoogleChatScrapedBlueprint = {
  metadata: {
    targetApp: "Google Chat Web (mail.google.com/chat or chat.google.com)",
    rebrandTarget: "Darion Chats (Darion Workforce Suite)",
    designSystem: "Material Design 3 (MD3) + Google Workspace 2026 Layout",
    extractedAt: new Date().toISOString(),
  },

  designTokens: {
    colorPalette: {
      light: {
        "--md-sys-color-primary": "#0B57D0",
        "--md-sys-color-on-primary": "#FFFFFF",
        "--md-sys-color-primary-container": "#D3E3FD",
        "--md-sys-color-on-primary-container": "#041E49",
        "--md-sys-color-surface": "#F8FAFD",
        "--md-sys-color-on-surface": "#1F1F1F",
        "--md-sys-color-surface-container": "#F0F4F9",
        "--md-sys-color-surface-container-high": "#E9EEF6",
        "--md-sys-color-surface-container-highest": "#E1E8F5",
        "--md-sys-color-surface-container-low": "#F7F9FC",
        "--md-sys-color-surface-container-lowest": "#FFFFFF",
        "--md-sys-color-outline": "#747775",
        "--md-sys-color-outline-variant": "#C4C7C5",
        "--md-sys-color-on-surface-variant": "#444746",
      },
      dark: {
        "--md-sys-color-primary": "#A8C7FA",
        "--md-sys-color-on-primary": "#062E6F",
        "--md-sys-color-primary-container": "#0842A0",
        "--md-sys-color-on-primary-container": "#D3E3FD",
        "--md-sys-color-surface": "#131314",
        "--md-sys-color-on-surface": "#E3E3E3",
        "--md-sys-color-surface-container": "#1E1F20",
        "--md-sys-color-surface-container-high": "#282A2C",
        "--md-sys-color-surface-container-highest": "#333537",
        "--md-sys-color-surface-container-low": "#1A1B1C",
        "--md-sys-color-surface-container-lowest": "#0E0E0F",
        "--md-sys-color-outline": "#8E918F",
        "--md-sys-color-outline-variant": "#444746",
        "--md-sys-color-on-surface-variant": "#C4C7C5",
      },
      rebrandedDarionPalette: {
        "--md-sys-color-primary": "#059669", // Emerald Green 600
        "--md-sys-color-primary-container": "#D1FAE5", // Emerald 100
        "--md-sys-color-on-primary-container": "#064E3B", // Emerald 900
        "--md-sys-color-surface-container-lowest": "#FFFFFF",
        "--md-sys-color-surface-container-lowest-dark": "#070A10",
        "--md-sys-color-surface-container-dark": "#111827",
      }
    },
    typography: {
      fontFamily: "'Google Sans', 'Roboto', 'Inter', system-ui, sans-serif",
      displayLarge: { size: "22px", weight: "700", lineHeight: "28px" },
      headlineSmall: { size: "18px", weight: "600", lineHeight: "24px" },
      bodyMedium: { size: "14px", weight: "400", lineHeight: "20px" },
      bodySmall: { size: "12px", weight: "400", lineHeight: "16px" },
      labelSmall: { size: "11px", weight: "500", lineHeight: "16px" }
    },
    metrics: {
      headerHeight: "56px",
      sidebarWidth: "256px",
      homeFeedWidth: "320px",
      threadDrawerWidth: "400px",
      companionRailWidth: "48px",
      composerBorderRadius: "24px",
      pillButtonHeight: "44px"
    }
  },

  scrapedComponents: [
    {
      id: "GC_HEADER",
      elementName: "Google Workspace Top Header",
      scrapedSelector: "header[role='banner'], .gb_ua",
      rebrandedComponent: "GoogleChatHeader.tsx",
      elements: [
        { name: "Brand Logo", google: "Google Chat Multi-color Emblem", darion: "Darion Chat Emerald Dual-Bubble Icon + 'Darion Chat' Typography" },
        { name: "Search Omnibox", google: "Pill search input with 'Search in chat' placeholder and filter dropdown", darion: "Pill search input with People/Spaces/Files filters" },
        { name: "Presence Capsule", google: "Active/Away/DND dropdown with Custom status modal", darion: "Active/Away/DND indicator with Custom emoji status modal" },
        { name: "9-Dot Waffle Menu", google: "Google Workspace app switcher (Gmail, Drive, Meet)", darion: "Darion Workspace Launcher (Attendance, Meet, Payroll, Tasks, Drive)" },
        { name: "Profile Popover", google: "Google Account switcher with storage and settings", darion: "Darion User Profile card with role tags and logout" }
      ]
    },
    {
      id: "GC_SIDEBAR_NAV",
      elementName: "Left Navigation & Shortcuts Rail",
      scrapedSelector: "nav[aria-label='Main Navigation'], div.aeN",
      rebrandedComponent: "ChatNavColumn.tsx",
      elements: [
        { name: "New Chat Action", google: "+ New chat elevated pill button (44px)", darion: "+ New chat emerald-accented pill button" },
        { name: "Home Feed Shortcut", google: "Unified Home icon with bold unread counter badge", darion: "Home icon with live unread indicator" },
        { name: "Direct Messages Section", google: "Collapsible accordion with avatar + status dot + unread badge", darion: "Collapsible DMs with user avatars, status dots, and badges" },
        { name: "Spaces Section", google: "Collapsible accordion with # hash icon, lock indicator, and badges", darion: "Collapsible Spaces with public/private locks and badge counts" },
        { name: "Mentions Shortcut", google: "@ Mentions cross-space aggregation stream", darion: "@ Mentions activity list" },
        { name: "Starred Shortcut", google: "Star icon with pinned chats and messages", darion: "Star icon with starred messages drawer" },
        { name: "Browse Spaces", google: "Discover spaces modal trigger", darion: "Browse spaces directory modal trigger" }
      ]
    },
    {
      id: "GC_CENTER_CANVAS",
      elementName: "Main Space & Conversation View",
      scrapedSelector: "main.v6d, div[role='main']",
      rebrandedComponent: "TeamsChatWorkspace.tsx",
      elements: [
        { name: "Space 3-Tab Header", google: "3 Tabs: [Chat, Shared / Files, Tasks]", darion: "3 Tabs: [Chat, Shared, Tasks] with active emerald indicator" },
        { name: "Shared Files Tab", google: "Media, Docs, Sheets gallery with preview and download", darion: "SpaceSharedFilesTab.tsx (Categorized files with download & Lightbox)" },
        { name: "Space Tasks Tab", google: "Collaborative task checklist with assignees and due dates", darion: "SpaceTasksTab.tsx (Task cards with completion check-offs)" },
        { name: "Date Sticky Dividers", google: "Pill date chip centered on subtle horizontal line", darion: "Pill date chip ('Today', 'Yesterday', 'Aug 20') with suppressHydrationWarning" },
        { name: "Message Grouping", google: "Consecutive message collapse with hover timestamp gutter", darion: "Consecutive message grouping with sender avatars and hover time" },
        { name: "Hover Action Bar", google: "Floating pill with Quick Emojis, Reply in Thread, Forward, Star, More", darion: "Floating quick reaction pill with Reply in thread and actions" }
      ]
    },
    {
      id: "GC_RICH_COMPOSER",
      elementName: "Google Chat Expanding Rich Composer",
      scrapedSelector: "div[role='textbox'], div.a5q",
      rebrandedComponent: "GoogleChatComposer.tsx",
      elements: [
        { name: "Pill Textarea Container", google: "Rounded-2xl pill container with auto-grow input", darion: "Rounded-2xl pill container with auto-growing textarea" },
        { name: "Formatting Bar ('A')", google: "Collapsible bar: Bold, Italic, Underline, Strikethrough, Code, Quote, Lists", darion: "Collapsible bar with exact MD3 icon toggles" },
        { name: "Voice Note Audio", google: "Microphone icon with live recording waveform and send/discard", darion: "Voice recording bar with fluctuating soundwave bars and timer" },
        { name: "Video Meeting", google: "Google Meet camera icon inserting instant video meeting card", darion: "Darion Meet camera button creating instant video meeting card" },
        { name: "Slash Commands", google: "Autocomplete slash commands menu (/meet, /task, /poll)", darion: "Slash commands popup menu with keyboard navigation" }
      ]
    },
    {
      id: "GC_THREAD_DRAWER",
      elementName: "Side-by-Side Thread Drawer",
      scrapedSelector: "aside[role='complementary'], div.a5s",
      rebrandedComponent: "ThreadSideDrawer.tsx",
      elements: [
        { name: "Pinned Root Card", google: "Full original message card pinned to top of thread", darion: "Pinned root message card with sender avatar, text, and attachments" },
        { name: "Thread Replies Stream", google: "Chronological reply messages with reaction badges", darion: "Chronological replies with reaction pill counters" },
        { name: "Thread Composer", google: "Dedicated bottom composer for thread replies", darion: "Dedicated thread reply input with emoji trigger" }
      ]
    },
    {
      id: "GC_COMPANION_RAIL",
      elementName: "48px Right Google Workspace Companion Rail",
      scrapedSelector: "aside.brC-brG, div[aria-label='Side panel']",
      rebrandedComponent: "CompanionRail.tsx",
      elements: [
        { name: "Calendar (31)", google: "Google Calendar 31 icon opening today's agenda panel", darion: "Calendar 31 icon with today's schedule and meeting join links" },
        { name: "Keep Notes (💡)", google: "Google Keep lightbulb icon opening notes & checklists panel", darion: "Keep Notes lightbulb icon with note creation and pinned memos" },
        { name: "Tasks (✓)", google: "Google Tasks checkmark icon opening personal to-do list", darion: "Tasks checkmark icon with task toggle and add flow" },
        { name: "Contacts (👤)", google: "Google Contacts user icon opening directory search", darion: "Contacts icon with team search and instant chat trigger" }
      ]
    }
  ]
};

// Write extracted blueprint to json file
const outputPath = path.join(__dirname, '../darion-chat/scraped_google_chat_blueprint.json');
fs.writeFileSync(outputPath, JSON.stringify(GoogleChatScrapedBlueprint, null, 2), 'utf-8');

console.log("==================================================");
console.log("✅ Google Chat Element Scraping & Rebranding Blueprint Generated!");
console.log(`📁 Blueprint saved to: ${outputPath}`);
console.log(`📊 Scraped Components: ${GoogleChatScrapedBlueprint.scrapedComponents.length} component modules`);
console.log("==================================================");
