import sys
import asyncio
from playwright.sync_api import sync_playwright

def fetch_markdown(url: str) -> str:
    """Fetch a URL using Playwright and extract the inner text."""
    # Playwright REQUIRES the ProactorEventLoop to spawn subprocesses on Windows.
    # We must temporarily override the global policy (which we set to Selector in scout_tasks.py) 
    # before Playwright spins up its own internal loop in this background thread.
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy()) # type: ignore

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # wait_until="domcontentloaded" is faster, but "networkidle" ensures SPAs load
            # Changed to domcontentloaded to prevent timeout on heavily active pages
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
            
            # Extract plain text content
            text = page.evaluate("document.body.innerText")
            return text
        except Exception as e:
            print(f"Browser error for {url}: {e}")
            return ""
        finally:
            browser.close()
