"""Renders assets/banner.png, assets/icon-512.png and assets/apple-touch-icon.png
   from the HTML sources using headless Chromium."""
from playwright.sync_api import sync_playwright
import pathlib

BASE = pathlib.Path("/home/user/bonny-bakes/assets")

with sync_playwright() as p:
    browser = p.chromium.launch()

    # ── Banner 1280x640 ──────────────────────────────────────────────────
    page = browser.new_context(viewport={"width": 1280, "height": 640}).new_page()
    page.goto((BASE / "banner-src.html").as_uri(), wait_until="networkidle")
    page.evaluate("document.fonts.ready.then(() => true)")
    page.wait_for_timeout(1200)
    page.screenshot(path=str(BASE / "banner.png"), clip={"x": 0, "y": 0, "width": 1280, "height": 640})
    print("banner ok")

    # ── Icon 512 (rounded, transparent corners) ──────────────────────────
    ctx = browser.new_context(viewport={"width": 512, "height": 512})
    page = ctx.new_page()
    page.goto((BASE / "icon-src.html").as_uri(), wait_until="load")
    page.wait_for_timeout(300)
    page.screenshot(path=str(BASE / "icon-512.png"), omit_background=True)
    print("icon-512 ok")

    # ── Apple touch icon 180 (opaque, full square) ───────────────────────
    page.evaluate("document.body.style.borderRadius = '0'; document.body.style.zoom = 180/512;")
    page.set_viewport_size({"width": 180, "height": 180})
    page.wait_for_timeout(200)
    page.screenshot(path=str(BASE / "apple-touch-icon.png"))
    print("apple-touch ok")

    browser.close()
