#!/usr/bin/env python3
"""
=============================================================================
 Google Chat Cloned Webpages Offline Web Server
=============================================================================
Runs a lightweight local web server to browse the downloaded real Google Chat
webpages directly in your browser without needing any internet connection.
=============================================================================
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8085
DIRECTORY = Path(__file__).resolve().parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

def main():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 70)
        print(f"🚀 Offline Google Chat Cloned Webpages Server Running!")
        print(f"🔗 URL: http://localhost:{PORT}")
        print(f"📁 Serving Directory: {DIRECTORY}")
        print("=" * 70)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped.")

if __name__ == "__main__":
    main()
