import httpx
from bs4 import BeautifulSoup

async def fetch_markdown(url: str) -> str:
    """Fetch a URL using httpx and extract the inner text using BeautifulSoup."""
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            # We add a generic user agent so we don't get instantly blocked
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
            response.raise_for_status()
            
            # Parse HTML and extract text
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Remove scripts and styles
            for script in soup(["script", "style", "noscript"]):
                script.extract()
                
            text = soup.get_text(separator=" ", strip=True)
            return text
    except Exception as e:
        print(f"Fetch error for {url}: {e}")
        return ""
