import asyncio
from playwright.async_api import async_playwright

async def run(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print(f"Navigating to {url}...")
        await page.goto(url)
        
        # In a real implementation, we'd use a more robust DOM-to-Markdown library
        # like `html2text` or a custom extraction logic. For the spike, we'll
        # just extract innerText which acts as a rudimentary text/markdown form.
        content = await page.evaluate("document.body.innerText")
        
        print("\n--- Extracted Content ---")
        print(content[:500] + "...\n(truncated)")
        
        await browser.close()

if __name__ == "__main__":
    import sys
    url = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"
    asyncio.run(run(url))
