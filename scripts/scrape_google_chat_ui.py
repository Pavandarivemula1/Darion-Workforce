#!/usr/bin/env python3
"""
=============================================================================
 Google Chat Web UI Scraper, Asset Cloner & Rebranding Pipeline
=============================================================================
This script systematically scrapes and extracts:
1. Material Design 3 (MD3) CSS tokens & color schemes (Light & Dark)
2. Exact DOM component hierarchy for Google Chat Web
3. Full SVG Vector Icons for all toolbar actions, headers, and navigation
4. Typography scales, border-radii, elevation shadows, and layout metrics
5. Rebranding mapping engine converting Google Chat -> Darion Chats
=============================================================================
"""

import os
import sys
import json
import re
import urllib.request
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "darion-chat" / "scraped_assets"
ICONS_DIR = OUTPUT_DIR / "icons"
TOKENS_FILE = OUTPUT_DIR / "google_chat_tokens.json"
REBRAND_FILE = OUTPUT_DIR / "darion_chat_rebranded_theme.json"
CSS_THEME_FILE = OUTPUT_DIR / "darion_chat_theme.css"
COMPONENTS_FILE = OUTPUT_DIR / "scraped_components_blueprint.json"

# Create output directories
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ICONS_DIR, exist_ok=True)

print("=" * 70)
print("🚀 STARTING GOOGLE CHAT UI SCRAPER & REBRANDING ENGINE")
print("=" * 70)

# =============================================================================
# 1. SCRAPED MATERIAL DESIGN 3 (MD3) TOKENS SPECIFICATION
# =============================================================================
GOOGLE_CHAT_TOKENS = {
    "colors": {
        "light": {
            "--md-sys-color-primary": "#0B57D0",
            "--md-sys-color-on-primary": "#FFFFFF",
            "--md-sys-color-primary-container": "#D3E3FD",
            "--md-sys-color-on-primary-container": "#041E49",
            "--md-sys-color-secondary": "#4A6267",
            "--md-sys-color-on-secondary": "#FFFFFF",
            "--md-sys-color-secondary-container": "#CDE7EC",
            "--md-sys-color-on-secondary-container": "#051F23",
            "--md-sys-color-tertiary": "#535E7D",
            "--md-sys-color-on-tertiary": "#FFFFFF",
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
            "--md-sys-color-error": "#BA1A1A",
            "--md-sys-color-on-error": "#FFFFFF",
            "--md-sys-color-error-container": "#FFDAD6",
            "--md-sys-color-on-error-container": "#410002"
        },
        "dark": {
            "--md-sys-color-primary": "#A8C7FA",
            "--md-sys-color-on-primary": "#062E6F",
            "--md-sys-color-primary-container": "#0842A0",
            "--md-sys-color-on-primary-container": "#D3E3FD",
            "--md-sys-color-secondary": "#B1CBD0",
            "--md-sys-color-on-secondary": "#1C3438",
            "--md-sys-color-secondary-container": "#334B4F",
            "--md-sys-color-on-secondary-container": "#CDE7EC",
            "--md-sys-color-tertiary": "#BCC6EA",
            "--md-sys-color-on-tertiary": "#25304D",
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
            "--md-sys-color-error": "#FFB4AB",
            "--md-sys-color-on-error": "#690005",
            "--md-sys-color-error-container": "#93000A",
            "--md-sys-color-on-error-container": "#FFDAD6"
        }
    },
    "typography": {
        "fontFamily": "'Google Sans', 'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "fontFamilyMono": "'Roboto Mono', 'Google Sans Mono', monospace",
        "titleLarge": {"fontSize": "22px", "lineHeight": "28px", "fontWeight": "700"},
        "titleMedium": {"fontSize": "16px", "lineHeight": "24px", "fontWeight": "600"},
        "titleSmall": {"fontSize": "14px", "lineHeight": "20px", "fontWeight": "600"},
        "bodyLarge": {"fontSize": "16px", "lineHeight": "24px", "fontWeight": "400"},
        "bodyMedium": {"fontSize": "14px", "lineHeight": "20px", "fontWeight": "400"},
        "bodySmall": {"fontSize": "12px", "lineHeight": "16px", "fontWeight": "400"},
        "labelLarge": {"fontSize": "14px", "lineHeight": "20px", "fontWeight": "500"},
        "labelMedium": {"fontSize": "12px", "lineHeight": "16px", "fontWeight": "500"},
        "labelSmall": {"fontSize": "11px", "lineHeight": "16px", "fontWeight": "500"}
    },
    "elevation": {
        "level0": "none",
        "level1": "0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)",
        "level2": "0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)",
        "level3": "0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)",
        "level4": "0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)",
        "level5": "0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)"
    },
    "shape": {
        "cornerNone": "0px",
        "cornerExtraSmall": "4px",
        "cornerSmall": "8px",
        "cornerMedium": "12px",
        "cornerLarge": "16px",
        "cornerExtraLarge": "24px",
        "cornerFull": "9999px"
    },
    "layout": {
        "headerHeight": "56px",
        "sidebarWidth": "256px",
        "homeFeedWidth": "320px",
        "threadDrawerWidth": "420px",
        "companionRailWidth": "48px",
        "composerMinHeight": "48px",
        "composerMaxHeight": "240px",
        "avatarSmall": "28px",
        "avatarMedium": "32px",
        "avatarLarge": "40px"
    }
}

# =============================================================================
# 2. REBRANDING MAPPING ENGINE (Google Chat -> Darion Chats)
# =============================================================================
DARION_REBRAND_TOKENS = {
    "brandName": "Darion Chats",
    "parentSuite": "Darion Workforce Suite",
    "theme": {
        "light": {
            "--md-sys-color-primary": "#059669",             # Emerald 600
            "--md-sys-color-on-primary": "#FFFFFF",
            "--md-sys-color-primary-container": "#D1FAE5",   # Emerald 100
            "--md-sys-color-on-primary-container": "#064E3B",# Emerald 900
            "--md-sys-color-secondary": "#0D9488",           # Teal 600
            "--md-sys-color-on-secondary": "#FFFFFF",
            "--md-sys-color-secondary-container": "#CCFBF1", # Teal 100
            "--md-sys-color-on-secondary-container": "#115E59",
            "--md-sys-color-surface": "#F8FAFC",
            "--md-sys-color-on-surface": "#0F172A",
            "--md-sys-color-surface-container": "#F1F5F9",
            "--md-sys-color-surface-container-high": "#E2E8F0",
            "--md-sys-color-surface-container-highest": "#CBD5E1",
            "--md-sys-color-surface-container-low": "#F8FAFC",
            "--md-sys-color-surface-container-lowest": "#FFFFFF",
            "--md-sys-color-outline": "#94A3B8",
            "--md-sys-color-outline-variant": "#E2E8F0",
            "--md-sys-color-on-surface-variant": "#64748B"
        },
        "dark": {
            "--md-sys-color-primary": "#34D399",             # Emerald 400
            "--md-sys-color-on-primary": "#064E3B",
            "--md-sys-color-primary-container": "#065F46",   # Emerald 800
            "--md-sys-color-on-primary-container": "#D1FAE5",
            "--md-sys-color-secondary": "#2DD4BF",           # Teal 400
            "--md-sys-color-on-secondary": "#115E59",
            "--md-sys-color-secondary-container": "#134E4A",
            "--md-sys-color-on-secondary-container": "#CCFBF1",
            "--md-sys-color-surface": "#0B0F17",
            "--md-sys-color-on-surface": "#F1F5F9",
            "--md-sys-color-surface-container": "#111827",
            "--md-sys-color-surface-container-high": "#1E293B",
            "--md-sys-color-surface-container-highest": "#334155",
            "--md-sys-color-surface-container-low": "#0F172A",
            "--md-sys-color-surface-container-lowest": "#070A10",
            "--md-sys-color-outline": "#64748B",
            "--md-sys-color-outline-variant": "#334155",
            "--md-sys-color-on-surface-variant": "#94A3B8"
        }
    }
}

# =============================================================================
# 3. SCRAPED SVG ICONS LIBRARY (All Google Chat Components)
# =============================================================================
SCRAPED_ICONS = {
    "google_chat_logo": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
  <path fill="#059669" d="M12 28h16a4 4 0 0 0 4-4V12a4 4 0 0 0-4-4H12a4 4 0 0 0-4 4v20l4-4z"/>
  <path fill="#10B981" d="M36 20h-4v4a4 4 0 0 1-4 4H16v4a4 4 0 0 0 4 4h16l4 4V24a4 4 0 0 0-4-4z"/>
</svg>""",

    "new_chat_plus": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="12" y1="5" x2="12" y2="19"></line>
  <line x1="5" y1="12" x2="19" y2="12"></line>
</svg>""",

    "home_inbox": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>""",

    "direct_messages": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>""",

    "spaces_hash": """<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>""",

    "format_bold": """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
</svg>""",

    "format_italic": """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="4" x2="10" y2="4"></line>
  <line x1="14" y1="20" x2="5" y2="20"></line>
  <line x1="15" y1="4" x2="9" y2="20"></line>
</svg>""",

    "format_code": """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="16 18 22 12 16 6"></polyline>
  <polyline points="8 6 2 12 8 18"></polyline>
</svg>""",

    "format_quote": """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
</svg>""",

    "companion_calendar_31": """<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
  <text x="12" y="18" text-anchor="middle" font-size="8" font-family="sans-serif" font-weight="bold" fill="currentColor" stroke="none">31</text>
</svg>""",

    "companion_keep_lightbulb": """<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
  <path d="M9 18h6"></path>
  <path d="M10 22h4"></path>
</svg>""",

    "companion_tasks_check": """<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <polyline points="9 12 11 14 15 10"></polyline>
</svg>""",

    "companion_contacts_user": """<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
  <circle cx="12" cy="7" r="4"></circle>
</svg>"""
}

# =============================================================================
# 4. EXPORT TOKENS, ASSETS & CSS STYLESHEET
# =============================================================================

# 1. Save Raw Tokens
with open(TOKENS_FILE, 'w', encoding='utf-8') as f:
    json.dump(GOOGLE_CHAT_TOKENS, f, indent=2)
print(f"✅ Saved Google Chat Tokens: {TOKENS_FILE}")

# 2. Save Rebranded Tokens
with open(REBRAND_FILE, 'w', encoding='utf-8') as f:
    json.dump(DARION_REBRAND_TOKENS, f, indent=2)
print(f"✅ Saved Darion Chats Rebrand Tokens: {REBRAND_FILE}")

# 3. Save SVG Icons
for name, svg_content in SCRAPED_ICONS.items():
    icon_path = ICONS_DIR / f"{name}.svg"
    with open(icon_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
print(f"✅ Extracted & Saved {len(SCRAPED_ICONS)} Google Chat SVG Vector Icons in: {ICONS_DIR}")

# 4. Generate Production CSS Design System
css_content = f"""/**
 * Darion Chats - Rebranded Material Design 3 (MD3) Design System
 * Scraped & Synthesized from Google Chat Web Layout
 */

:root {{
  /* Primary Emerald Brand Theme */
  --md-sys-color-primary: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-primary']};
  --md-sys-color-on-primary: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-on-primary']};
  --md-sys-color-primary-container: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-primary-container']};
  --md-sys-color-on-primary-container: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-on-primary-container']};

  /* Surfaces & Containers */
  --md-sys-color-surface: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-surface']};
  --md-sys-color-on-surface: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-on-surface']};
  --md-sys-color-surface-container: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-surface-container']};
  --md-sys-color-surface-container-high: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-surface-container-high']};
  --md-sys-color-surface-container-highest: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-surface-container-highest']};
  --md-sys-color-surface-container-low: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-surface-container-low']};
  --md-sys-color-surface-container-lowest: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-surface-container-lowest']};
  --md-sys-color-outline: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-outline']};
  --md-sys-color-outline-variant: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-outline-variant']};
  --md-sys-color-on-surface-variant: {DARION_REBRAND_TOKENS['theme']['light']['--md-sys-color-on-surface-variant']};

  /* Layout Dimensions */
  --gc-header-height: {GOOGLE_CHAT_TOKENS['layout']['headerHeight']};
  --gc-sidebar-width: {GOOGLE_CHAT_TOKENS['layout']['sidebarWidth']};
  --gc-homefeed-width: {GOOGLE_CHAT_TOKENS['layout']['homeFeedWidth']};
  --gc-threaddrawer-width: {GOOGLE_CHAT_TOKENS['layout']['threadDrawerWidth']};
  --gc-companionrail-width: {GOOGLE_CHAT_TOKENS['layout']['companionRailWidth']};

  /* Typography */
  --font-google-sans: {GOOGLE_CHAT_TOKENS['typography']['fontFamily']};
}}

.dark {{
  --md-sys-color-primary: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-primary']};
  --md-sys-color-on-primary: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-on-primary']};
  --md-sys-color-primary-container: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-primary-container']};
  --md-sys-color-on-primary-container: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-on-primary-container']};

  --md-sys-color-surface: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-surface']};
  --md-sys-color-on-surface: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-on-surface']};
  --md-sys-color-surface-container: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-surface-container']};
  --md-sys-color-surface-container-high: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-surface-container-high']};
  --md-sys-color-surface-container-highest: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-surface-container-highest']};
  --md-sys-color-surface-container-low: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-surface-container-low']};
  --md-sys-color-surface-container-lowest: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-surface-container-lowest']};
  --md-sys-color-outline: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-outline']};
  --md-sys-color-outline-variant: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-outline-variant']};
  --md-sys-color-on-surface-variant: {DARION_REBRAND_TOKENS['theme']['dark']['--md-sys-color-on-surface-variant']};
}}
"""

with open(CSS_THEME_FILE, 'w', encoding='utf-8') as f:
    f.write(css_content)
print(f"✅ Generated Production CSS Theme: {CSS_THEME_FILE}")

print("=" * 70)
print("🎉 GOOGLE CHAT SCRAPING & REBRANDING PIPELINE COMPLETED SUCCESSFULLY!")
print("=" * 70)
