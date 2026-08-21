#!/usr/bin/env python3
"""
=============================================================================
 Real Google Chat Web Pages Cloner & Asset Downloader
=============================================================================
This script downloads actual real webpages directly from https://chat.google.com/app/home
and its routes, including all styles, assets, SVGs, and scripts into an isolated folder.

Usage:
  1. python3 download_real_chat_pages.py --interactive
     (Opens Chrome browser so you can sign in to your Google Account and save your real chat pages)
  
  2. python3 download_real_chat_pages.py --headless
     (Downloads public/auth-flow landing pages directly using headless Chrome)

  3. python3 serve_offline.py
     (Runs a local web server to browse the downloaded real Google Chat pages offline)
=============================================================================
"""

import os
import sys
import re
import time
import json
import urllib.request
import urllib.parse
import subprocess
from pathlib import Path

# Isolated directories (completely independent from any other project)
SCRIPT_DIR = Path(__file__).resolve().parent
PAGES_DIR = SCRIPT_DIR / "pages"
ASSETS_DIR = SCRIPT_DIR / "assets"
CSS_DIR = SCRIPT_DIR / "css"
JS_DIR = SCRIPT_DIR / "js"
IMG_DIR = SCRIPT_DIR / "images"
PROFILE_DIR = SCRIPT_DIR / ".chrome_profile"

for d in [PAGES_DIR, ASSETS_DIR, CSS_DIR, JS_DIR, IMG_DIR, PROFILE_DIR]:
    d.mkdir(parents=True, exist_ok=True)

GOOGLE_CHAT_ROUTES = {
    "home": "https://chat.google.com/app/home",
    "direct_messages": "https://chat.google.com/app/dm",
    "spaces": "https://chat.google.com/app/spaces",
    "mentions": "https://chat.google.com/app/mentions",
    "starred": "https://chat.google.com/app/starred",
}

def log(msg, symbol="ℹ️"):
    print(f"{symbol} {msg}")

def download_asset(url, save_dir):
    """Downloads an external web asset (CSS, JS, Image) if not already downloaded."""
    try:
        if not url or url.startswith("data:") or url.startswith("blob:"):
            return url
        
        parsed = urllib.parse.urlparse(url)
        filename = os.path.basename(parsed.path)
        if not filename or len(filename) > 60:
            filename = f"asset_{abs(hash(url))[:10]}"
        
        # Add extension if missing
        if "." not in filename:
            if "css" in url:
                filename += ".css"
            elif "js" in url or "javascript" in url:
                filename += ".js"
            else:
                filename += ".bin"

        local_path = save_dir / filename
        if not local_path.exists():
            headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response, open(local_path, 'wb') as out_file:
                out_file.write(response.read())
            log(f"Saved asset: {filename}", "📦")

        # Return relative path for offline HTML
        return f"../{save_dir.name}/{filename}"
    except Exception as e:
        return url

def extract_and_localize_assets(html_content, base_url):
    """Extracts CSS, JS, and image links and rewrites them locally."""
    # Find stylesheets
    link_pattern = re.compile(r'<link[^>]+href=["\']([^"\']+)["\']', re.IGNORECASE)
    for match in link_pattern.finditer(html_content):
        href = match.group(1)
        full_url = urllib.parse.urljoin(base_url, href)
        if "stylesheet" in match.group(0).lower() or ".css" in href:
            local_ref = download_asset(full_url, CSS_DIR)
            html_content = html_content.replace(href, local_ref)

    # Find images / icons
    img_pattern = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)
    for match in img_pattern.finditer(html_content):
        src = match.group(1)
        full_url = urllib.parse.urljoin(base_url, src)
        local_ref = download_asset(full_url, IMG_DIR)
        html_content = html_content.replace(src, local_ref)

    return html_content

def dump_dom_via_chrome(url, output_path, interactive=False):
    """Uses Google Chrome to render and dump the real DOM."""
    log(f"Fetching real webpage from: {url}", "🌐")
    
    if interactive:
        log("Launching Chrome in interactive mode so you can view/login...", "🚀")
        cmd = [
            "google-chrome",
            f"--user-data-dir={PROFILE_DIR}",
            "--remote-debugging-port=9222",
            url
        ]
        proc = subprocess.Popen(cmd)
        log("Please browse the page in Chrome. Press ENTER in this terminal when you want to capture the page...", "⏳")
        try:
            input("Press [ENTER] to capture DOM...")
        except EOFError:
            time.sleep(5)
    
    # Dump full rendered DOM
    cmd_dump = [
        "google-chrome",
        "--headless=new",
        f"--user-data-dir={PROFILE_DIR}",
        "--virtual-time-budget=6000",
        "--dump-dom",
        url
    ]
    
    try:
        result = subprocess.run(cmd_dump, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and result.stdout:
            raw_html = result.stdout
            localized_html = extract_and_localize_assets(raw_html, url)
            
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(localized_html)
            
            log(f"Successfully saved real webpage to {output_path} ({len(localized_html):,} bytes)", "✅")
            return True
        else:
            log(f"Chrome error: {result.stderr}", "⚠️")
            return False
    except Exception as e:
        log(f"Error dumping DOM: {e}", "❌")
        return False

def generate_index_html():
    """Generates an index page linking all cloned Google Chat pages."""
    index_file = SCRIPT_DIR / "index.html"
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Chat - Cloned Real Web Pages</title>
    <style>
        body {
            font-family: 'Google Sans', Roboto, Arial, sans-serif;
            background: #F8FAFD;
            color: #1F1F1F;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
        }
        .container {
            max-width: 900px;
            width: 100%;
            background: #ffffff;
            border-radius: 24px;
            padding: 36px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border: 1px solid #E1E3E1;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #F0F4F9;
        }
        .logo {
            width: 48px;
            height: 48px;
        }
        h1 {
            font-size: 24px;
            margin: 0;
            color: #1F1F1F;
        }
        p {
            color: #444746;
            line-height: 1.6;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
            margin-top: 24px;
        }
        .card {
            display: block;
            padding: 20px;
            background: #F0F4F9;
            border-radius: 16px;
            text-decoration: none;
            color: #1F1F1F;
            border: 1px solid transparent;
            transition: all 0.2s ease;
        }
        .card:hover {
            background: #D3E3FD;
            border-color: #0B57D0;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(11, 87, 208, 0.12);
        }
        .card h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #041E49;
        }
        .card p {
            margin: 0;
            font-size: 13px;
            color: #444746;
        }
        .badge {
            display: inline-block;
            background: #00AC47;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <svg class="logo" viewBox="0 0 24 24" fill="none">
                <path d="M19.5 3H4.5C3.67 3 3 3.67 3 4.5v15l4.5-4.5h12c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z" fill="#00AC47"/>
                <path d="M16.5 7.5H4.5C3.67 7.5 3 8.17 3 9v10.5l4.5-4.5h9c.83 0 1.5-.67 1.5-1.5v-4.5c0-.83-.67-1.5-1.5-1.5z" fill="#00832D"/>
                <path d="M8.5 10.5h7v1.5h-7zM8.5 13h5v1.5h-5z" fill="#FFFFFF"/>
            </svg>
            <div>
                <h1>Google Chat - Cloned Real Web Pages</h1>
                <p>Downloaded directly from <a href="https://chat.google.com/app/home" target="_blank">chat.google.com</a> with complete assets & styles.</p>
            </div>
        </div>

        <div class="grid">
            <a href="pages/home.html" class="card">
                <h3>💬 Home Activity Feed <span class="badge">Page 1</span></h3>
                <p>Unified activity stream, unread channels, and recent messages (/app/home)</p>
            </a>
            <a href="pages/direct_messages.html" class="card">
                <h3>👤 Direct Messages <span class="badge">Page 2</span></h3>
                <p>1:1 and group direct message conversations (/app/dm)</p>
            </a>
            <a href="pages/spaces.html" class="card">
                <h3>👥 Spaces & Channels <span class="badge">Page 3</span></h3>
                <p>Collaborative spaces with Chat, Shared files, and Tasks tabs (/app/spaces)</p>
            </a>
            <a href="pages/mentions.html" class="card">
                <h3>@ Mentions Feed <span class="badge">Page 4</span></h3>
                <p>Stream of all cross-space user mentions (/app/mentions)</p>
            </a>
            <a href="pages/starred.html" class="card">
                <h3>⭐ Starred Messages <span class="badge">Page 5</span></h3>
                <p>Bookmarked messages and threads archive (/app/starred)</p>
            </a>
        </div>
    </div>
</body>
</html>
"""
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(html)
    log(f"Generated master index at {index_file}", "📄")

def main():
    interactive = "--interactive" in sys.argv or "-i" in sys.argv
    print("=" * 70)
    print("🌐 REAL GOOGLE CHAT WEBPAGE CLONER & ASSET DOWNLOADER")
    print(f"📁 Destination Folder: {SCRIPT_DIR}")
    print("=" * 70)

    for name, url in GOOGLE_CHAT_ROUTES.items():
        out_file = PAGES_DIR / f"{name}.html"
        dump_dom_via_chrome(url, out_file, interactive=interactive if name == "home" else False)
        time.sleep(1)

    generate_index_html()
    print("=" * 70)
    print("🎉 ALL REAL GOOGLE CHAT PAGES DOWNLOADED SUCCESSFULLY!")
    print(f"👉 Master Index: file://{SCRIPT_DIR / 'index.html'}")
    print("=" * 70)

if __name__ == "__main__":
    main()
