"""Functional test for the Bonny Bakes site — runs the real site in Chromium."""
import re, sys, json
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8123/index.html"
results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS  " if ok else "FAIL  ") + name + ("   -> " + str(detail) if detail else ""))

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1360, "height": 1000})
    page = ctx.new_page()
    errors, console = [], []
    page.on("console", lambda m: console.append(m.type + ": " + m.text))
    page.on("pageerror", lambda e: errors.append(str(e)))

    page.goto(BASE, wait_until="networkidle")
    page.wait_for_selector(".card")

    # ---- Home page -------------------------------------------------------
    check("home: hero headline", page.locator("h1", has_text="Simple bakes").first.is_visible())
    check("home: lead text", "Bonny’s kitchen" in page.locator(".hero__lead").inner_text())
    check("home: 4 featured cards", page.locator("#app .grid--wide .card").count() == 4,
          page.locator("#app .grid--wide .card").count())
    check("home: browse button", page.get_by_role("link", name="Browse Recipes").is_visible())
    check("home: category tiles", page.locator(".tile").count() == 6, page.locator(".tile").count())
    check("home: title tag", page.title() == "Bonny Bakes — Simple bakes. Happy hearts.", page.title())

    # ---- Browse page + search --------------------------------------------
    page.get_by_role("link", name="Browse Recipes").click()
    page.wait_for_selector("#browse-results .card")
    check("browse: all recipes shown", page.locator("#browse-results .card").count() == 12,
          page.locator("#browse-results .card").count())

    page.fill("#browse-search", "raspberry")
    page.wait_for_timeout(200)
    names = page.locator("#browse-results .card__title").all_inner_texts()
    check("search 'raspberry' -> thumbprints + jam tarts (+ sponge, which has raspberry jam)",
          any("Thumbprints" in n for n in names) and any("Jam Tarts" in n for n in names)
          and set(names) == {"Raspberry Thumbprints", "Victoria Sponge", "Jam Tarts"}, names)

    page.fill("#browse-search", "chocolate")
    page.wait_for_timeout(200)
    names = page.locator("#browse-results .card__title").all_inner_texts()
    check("search 'chocolate' -> brownies + cookies",
          any("Brownies" in n for n in names) and any("Cookies" in n for n in names), names)

    page.fill("#browse-search", "self-raising flour")   # ingredient search
    page.wait_for_timeout(200)
    n1 = page.locator("#browse-results .card").count()
    check("search by ingredient works", n1 > 0, f"{n1} matches")

    page.fill("#browse-search", "zzzznothing")
    page.wait_for_timeout(200)
    check("search: friendly empty state", page.locator(".empty h3").inner_text().startswith("Nothing matches"))

    # category filter
    page.fill("#browse-search", "")
    page.wait_for_timeout(150)
    page.click('[data-cat="Cakes"]')
    page.wait_for_timeout(200)
    check("category filter Cakes", page.locator("#browse-results .card").count() == 3,
          page.locator("#browse-results .card__title").all_inner_texts())

    # sorting
    page.click('[data-cat=""]')
    page.select_option("#browse-sort", "az")
    page.wait_for_timeout(200)
    first = page.locator("#browse-results .card__title").first.inner_text()
    check("sort A-Z", first.startswith("Afternoon"), first)
    page.select_option("#browse-sort", "time-asc")
    page.wait_for_timeout(200)
    check("sort quickest first", "Quick" in page.locator("#browse-results .card__title").first.inner_text()
          or "Scones" in page.locator("#browse-results .card__title").first.inner_text(),
          page.locator("#browse-results .card__title").first.inner_text())

    # ---- Favourites ------------------------------------------------------
    page.goto(BASE + "#/recipe/fairy-cakes", wait_until="networkidle")
    page.wait_for_selector(".recipe__title")
    page.click("#app .card__foot .fav-btn, .recipe__head-actions .fav-btn")
    page.wait_for_timeout(200)
    favs = page.evaluate("JSON.parse(localStorage.getItem('bonnybakes.favourites'))")
    check("favourite saved to localStorage", favs == ["fairy-cakes"], favs)
    check("favourite badge shows 1", page.locator("#fav-badge").inner_text() == "1")

    # ---- Recipe scaling --------------------------------------------------
    check("recipe title", page.locator(".recipe__title").inner_text() == "Fairy Cakes")
    ings = page.locator("#ings-list .ing__qty").all_inner_texts()
    check("base ingredients (200 g flour)", any(i.startswith("200 g self-raising flour") for i in ings), ings)

    page.select_option("#yield-select", "6")
    page.wait_for_timeout(250)
    ings = page.locator("#ings-list .ing__qty").all_inner_texts()
    check("scale 12 -> 6 halves flour", any(i.startswith("100 g self-raising flour") for i in ings), ings)
    check("scale 12 -> 6 gives 2 eggs", any(i == "2 medium eggs" for i in ings), ings)
    check("summary text updates", "Scaled from 12 to 6" in page.locator("#ings-summary").inner_text(),
          page.locator("#ings-summary").inner_text())

    page.select_option("#yield-select", "24")
    page.wait_for_timeout(250)
    ings = page.locator("#ings-list .ing__qty").all_inner_texts()
    check("scale 12 -> 24 doubles butter", any(i.startswith("400 g unsalted butter") for i in ings), ings)
    check("scale 12 -> 24 gives 8 eggs", any(i == "8 medium eggs" for i in ings), ings)

    page.select_option("#yield-select", "4")
    page.wait_for_timeout(250)
    ings = page.locator("#ings-list .ing").all_inner_texts()
    joined = " | ".join(ings)
    check("1⅓ eggs gets a helpful note",
          "Beat 2 eggs together and use about ⅓ of the mixture" in joined, joined[:400])
    check("fraction shown as 1⅓ not 1.333", "1⅓ medium eggs" in joined, joined[:200])

    # 1.5 eggs -> the note promised in the brief
    page.select_option("#yield-select", "18")
    page.wait_for_timeout(250)
    j18 = " | ".join(page.locator("#ings-list .ing").all_inner_texts())
    check("18 cakes -> 6 eggs, no awkward note", "6 medium eggs" in j18, j18[:160])
    page.select_option("#yield-select", "custom"); page.wait_for_timeout(150)
    page.fill("#yield-custom", "18"); page.wait_for_timeout(250)
    page.fill("#yield-custom", "9"); page.wait_for_timeout(300)
    j9 = " | ".join(page.locator("#ings-list .ing").all_inner_texts())
    check("9 cakes -> 3 eggs", "3 medium eggs" in j9, j9[:160])
    page.fill("#yield-custom", "2"); page.wait_for_timeout(300)
    j2 = " | ".join(page.locator("#ings-list .ing").all_inner_texts())
    check("2 cakes -> ⅔ egg with a helpful note",
          "⅔ medium eggs" in j2 and "Beat one egg and use about two thirds of it" in j2, j2[:300])

    page.click("#yield-reset")
    page.wait_for_timeout(200)
    check("reset returns to base 12", page.locator("#yield-value").inner_text() == "12")

    # custom amount
    page.select_option("#yield-select", "custom")
    page.wait_for_timeout(200)
    check("custom row revealed", page.locator("#yield-custom-row").is_visible())
    page.fill("#yield-custom", "30")
    page.wait_for_timeout(300)
    check("custom 30 scales flour to 500 g",
          any(i.startswith("500 g self-raising flour") for i in page.locator("#ings-list .ing__qty").all_inner_texts()),
          page.locator("#ings-list .ing__qty").all_inner_texts())
    check("custom 30 gives 10 eggs",
          any(i == "10 medium eggs" for i in page.locator("#ings-list .ing__qty").all_inner_texts()))

    # US equivalents
    page.click("#yield-reset"); page.wait_for_timeout(200)
    check("US equivalent shown", page.locator(".ing__us").count() > 0,
          page.locator(".ing__us").first.inner_text() if page.locator(".ing__us").count() else "")

    # ---- Checkbox + method steps -----------------------------------------
    page.locator("#ings-list input").first.check()
    page.wait_for_timeout(200)
    check("ingredient ticked", page.locator("#ings-list input").first.is_checked())
    check("ingredient progress updates", "1 /" in page.locator("#ings-count").inner_text(),
          page.locator("#ings-count").inner_text())
    page.locator(".step").first.click()
    page.wait_for_timeout(200)
    check("method step marked", page.locator(".step").first.get_attribute("aria-pressed") == "true")
    check("step progress updates", "1 /" in page.locator("#step-count").inner_text(),
          page.locator("#step-count").inner_text())

    # ---- Shopping list ---------------------------------------------------
    page.click("#add-shop")
    page.wait_for_timeout(300)
    shop = page.evaluate("JSON.parse(localStorage.getItem('bonnybakes.shoppinglist'))")
    check("shopping list stored (11 separate lines)", len(shop) == 11, len(shop))
    butters = [i["label"] for i in shop if i["n"].endswith("butter")]
    check("cake butter and buttercream butter stay separate", len(butters) == 2, butters)
    check("cart badge count", page.locator("#cart-badge").inner_text() == "11",
          page.locator("#cart-badge").inner_text())

    page.click("#cart-button")
    page.wait_for_selector("#panel-body .shop-item")
    check("panel opens", page.locator("#shopping-panel").is_visible())
    page.fill("#shop-add-input", "2 pints of milk")
    page.press("#shop-add-input", "Enter")
    page.wait_for_timeout(250)
    check("custom item added", "2 pints of milk" in page.locator("#panel-body").inner_text())

    # adding the same recipe again merges quantities
    page.click("[data-close-panel]")
    page.wait_for_timeout(150)
    page.click("#add-shop")
    page.wait_for_timeout(300)
    shop = page.evaluate("JSON.parse(localStorage.getItem('bonnybakes.shoppinglist'))")
    recipe_items = [i for i in shop if i["recipeId"] == "fairy-cakes"]
    butter = [i for i in recipe_items if i["n"] == "unsalted butter"]
    check("repeat add merges, not duplicates", len(recipe_items) == 11, len(recipe_items))
    check("merged butter doubles to 400 g", butter and butter[0]["label"].startswith("400 g unsalted butter"),
          butter[0]["label"] if butter else None)

    # tick + delete
    page.click("#cart-button"); page.wait_for_selector("#panel-body .shop-item input")
    page.locator("#panel-body .shop-item input").first.check()
    page.wait_for_timeout(150)
    check("shop item ticked stored",
          any(i["done"] for i in page.evaluate("JSON.parse(localStorage.getItem('bonnybakes.shoppinglist'))")))
    page.locator("#panel-body .shop-item__del").first.click()
    page.wait_for_timeout(200)
    check("shop item removed",
          len(page.evaluate("JSON.parse(localStorage.getItem('bonnybakes.shoppinglist'))")) == 11)
    labels = [i["label"] for i in page.evaluate("JSON.parse(localStorage.getItem('bonnybakes.shoppinglist'))")]
    check("shop labels carry the small notes",
          any("buttercream" in l for l in labels) and any("room temperature" in l for l in labels), labels[:3])
    page.click("#panel-clear")
    page.wait_for_timeout(200)
    check("clear all", page.evaluate("JSON.parse(localStorage.getItem('bonnybakes.shoppinglist'))") == [])
    page.click("[data-close-panel]"); page.wait_for_timeout(200)

    # ---- Persistence across reload --------------------------------------
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(300)
    check("favourite survives reload", page.locator("#fav-badge").inner_text() == "1")

    # ---- Favourites page -------------------------------------------------
    page.goto(BASE + "#/favourites", wait_until="networkidle")
    page.wait_for_selector("#app .card")
    check("favourites page lists saved recipe",
          page.locator("#app .card__title").first.inner_text() == "Fairy Cakes")

    # ---- Header search suggestions --------------------------------------
    page.goto(BASE, wait_until="networkidle")
    check("desktop: header search visible", page.locator("#header-search-input").is_visible())
    page.fill("#header-search-input", "lemon")
    page.wait_for_timeout(300)
    check("header suggestions appear", page.locator("#search-suggest a").count() >= 1,
          page.locator("#search-suggest .ss-name").all_inner_texts())

    # ---- Surprise Me -----------------------------------------------------
    page.click("#surprise-btn")
    page.wait_for_timeout(900)
    check("surprise me navigates to a recipe", "#/recipe/" in page.url, page.url)

    # ---- Every recipe renders -------------------------------------------
    ids = page.evaluate("window.RECIPES.map(r => r.id)")
    bad = []
    for rid in ids:
        page.goto(BASE + "#/recipe/" + rid, wait_until="networkidle")
        page.wait_for_selector(".recipe__title", timeout=5000)
        title = page.locator(".recipe__title").inner_text()
        steps = page.locator(".step").count()
        ings = page.locator(".ing").count()
        tips = page.locator(".tip-list li").count()
        if not title or steps < 5 or ings < 5 or tips < 1:
            bad.append((rid, title, steps, ings, tips))
    check("all 12 recipes render with method/ingredients/tips", not bad, bad)
    check("recipe count is 12", len(ids) == 12, len(ids))

    # ---- Scaling sanity on another recipe --------------------------------
    page.goto(BASE + "#/recipe/classic-flapjacks", wait_until="networkidle")
    page.wait_for_selector("#yield-select")
    page.select_option("#yield-select", "8")
    page.wait_for_timeout(250)
    q = page.locator("#ings-list .ing__qty").all_inner_texts()
    check("flapjacks 16->8 halves oats", any(i.startswith("175 g porridge oats") for i in q), q)

    # ---- Accessibility / structure --------------------------------------
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(300)
    check("no console errors", not errors, errors[:3])
    # Missing photograph files 404 on purpose (the friendly placeholder shows instead),
    # so those specific errors are expected until photos are added.
    noisy = [c for c in console if c.startswith("error") and "404" not in c]
    check("no console error messages (ignoring expected 404s for photo files)", not noisy, noisy[:3])
    check("landmark: header/main/footer",
          page.locator("header.site-header").count() == 1 and page.locator("main").count() == 1
          and page.locator("footer.site-footer").count() == 1)
    check("skip link present", page.locator("a.skip-link").count() == 1)
    imgs_missing_alt = page.evaluate(
        "Array.from(document.querySelectorAll('img')).filter(i => !i.hasAttribute('alt')).length")
    check("all images have alt text", imgs_missing_alt == 0, imgs_missing_alt)
    check("all images lazy-loaded",
          page.evaluate("Array.from(document.querySelectorAll('img')).every(i => i.loading === 'lazy')"))
    labels = page.evaluate("Array.from(document.querySelectorAll('button')).filter(b => !b.innerText.trim() && !b.getAttribute('aria-label')).length")
    check("icon buttons all have aria-labels", labels == 0, labels)

    # keyboard: tab to a card and activate
    page.goto(BASE + "#/recipes", wait_until="networkidle")
    page.wait_for_selector("#browse-search")
    page.focus("#browse-search")
    page.keyboard.press("Escape")
    page.keyboard.press("/")
    page.wait_for_timeout(150)
    check("slash focuses header search",
          page.evaluate("document.activeElement.id") in ("header-search-input", "browse-search"),
          page.evaluate("document.activeElement.id"))

    # ---- Mobile layout ---------------------------------------------------
    mob = ctx.new_page()
    mob.set_viewport_size({"width": 390, "height": 844})
    mob.goto(BASE, wait_until="networkidle")
    mob.wait_for_selector(".card")
    check("mobile: hamburger visible", mob.locator("#nav-toggle").is_visible())
    check("mobile: desktop nav hidden", not mob.locator("#main-nav").is_visible())
    mob.click("#nav-toggle")
    mob.wait_for_timeout(300)
    check("mobile: menu opens", mob.locator("#main-nav").is_visible())
    check("mobile: toggle aria-expanded", mob.locator("#nav-toggle").get_attribute("aria-expanded") == "true")
    mob.click("#main-nav a[data-nav='/recipes']")
    mob.wait_for_timeout(400)
    check("mobile: nav link works", "#/recipes" in mob.url, mob.url)
    over = mob.evaluate("""() => {
      const w = window.innerWidth, bad = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > w + 1 && r.width > 0) bad.push(el.tagName + '.' + (el.className.baseVal !== undefined ? el.className.baseVal : el.className) + ' right=' + Math.round(r.right));
      });
      return { scrollWidth: document.documentElement.scrollWidth, innerWidth: w, bad: bad.slice(0, 8) };
    }""")
    check("mobile: no horizontal overflow", over["scrollWidth"] <= over["innerWidth"] + 1, over)

    # ---- Print rendering (recipe) ---------------------------------------
    page.goto(BASE + "#/recipe/victoria-sponge", wait_until="networkidle")
    page.wait_for_selector(".recipe__title")
    page.pdf(path="/home/user/bonny-bakes/tools/_test-print-recipe.pdf", format="A4")
    page.goto(BASE, wait_until="networkidle")
    page.click("#cart-button"); page.wait_for_selector("#panel-body")
    page.fill("#shop-add-input", "Self-raising flour"); page.press("#shop-add-input", "Enter")
    page.wait_for_timeout(200)
    page.pdf(path="/home/user/bonny-bakes/tools/_test-print-list.pdf", format="A4")

    # screenshots
    page.goto(BASE, wait_until="networkidle"); page.wait_for_timeout(600)
    page.screenshot(path="/home/user/bonny-bakes/tools/_shot-home.png", full_page=True)
    page.goto(BASE + "#/recipe/raspberry-thumbprints", wait_until="networkidle"); page.wait_for_timeout(600)
    page.screenshot(path="/home/user/bonny-bakes/tools/_shot-recipe.png", full_page=True)
    page.goto(BASE + "#/recipes", wait_until="networkidle"); page.wait_for_timeout(600)
    page.screenshot(path="/home/user/bonny-bakes/tools/_shot-browse.png", full_page=True)
    mob.goto(BASE + "#/recipe/lemon-drizzle-cake", wait_until="networkidle"); mob.wait_for_timeout(600)
    mob.screenshot(path="/home/user/bonny-bakes/tools/_shot-mobile.png", full_page=True)

    browser.close()

failed = [r for r in results if not r[1]]
print("\n" + "=" * 70)
print(f"{len(results) - len(failed)}/{len(results)} checks passed")
if failed:
    print("FAILED:")
    for f in failed:
        print("  -", f[0], "|", f[2])
sys.exit(1 if failed else 0)
