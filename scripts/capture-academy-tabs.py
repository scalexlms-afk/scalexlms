from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = Path.home() / "Desktop" / "ScaleX Academy Tabs"
EMAIL = "student@scalex.dev"
PASSWORD = "ScaleXTest123!"

TABS = [
    ("01-Dashboard", "/dashboard"),
    ("02-Continue-Learning", "/continue-learning"),
    ("03-Roadmap", "/roadmap"),
    ("04-Tasks", "/tasks"),
    ("05-Achievements", "/achievements"),
]

OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        device_scale_factor=2,
        color_scheme="dark",
    )
    page = context.new_page()

    page.goto(f"{BASE}/login", wait_until="networkidle")
    page.evaluate(
        """() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }"""
    )
    page.reload(wait_until="networkidle")

    page.get_by_label("Email").fill(EMAIL)
    page.get_by_label("Password").fill(PASSWORD)
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_url(lambda url: "/login" not in url, timeout=30000)

    for name, path in TABS:
        page.goto(f"{BASE}{path}", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.evaluate(
            """() => {
          document.querySelectorAll('nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog]').forEach((el) => {
            el.style.display = 'none';
          });
        }"""
        )
        file = OUT / f"{name}.png"
        page.screenshot(path=str(file), full_page=True)
        print("saved", file)

    browser.close()
    print("DONE", OUT)
