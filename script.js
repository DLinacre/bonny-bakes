/* ============================================================================
 *  BONNY BAKES — script.js
 *  -------------------------------------------------------------------------
 *  Everything the site *does* lives here. You should not need to edit this file
 *  to add recipes — recipes live in recipes.js. This file reads that data and
 *  builds the pages, the quantity calculator, the favourites, the shopping list,
 *  the search, the printing and the sharing.
 *
 *  Contents
 *    1.  Little helpers
 *    2.  Number & measurement formatting  ← the quantity maths
 *    3.  Saved data (favourites, shopping list) in the browser
 *    4.  Recipe scaling
 *    5.  Shared pieces (recipe cards, icons, media)
 *    6.  Pages: home, browse, recipe, favourites, about
 *    7.  Recipe page behaviour (checkboxes, steps, shopping list)
 *    8.  Header: nav, search + suggestions, panels, toasts
 *    9.  Routing
 *   10.  Start up
 * ============================================================================ */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════
     1. LITTLE HELPERS
     ═════════════════════════════════════════════════════════════════════ */

  const RECIPES = Array.isArray(window.RECIPES) ? window.RECIPES : [];
  const EXTRA_CATS = Array.isArray(window.BONNY_CATEGORIES) ? window.BONNY_CATEGORIES : [];

  if (!RECIPES.length) {
    // Something has gone wrong with recipes.js — say so clearly rather than
    // showing a blank page.
    document.addEventListener('DOMContentLoaded', () => {
      const app = document.getElementById('app');
      if (app) app.innerHTML =
        '<div class="wrap section"><div class="empty"><h1>Oh dear</h1>' +
        '<p>No recipes were found. Please check that <b>recipes.js</b> is in the same folder as <b>index.html</b> and refresh the page.</p></div></div>';
    });
    return;
  }

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const findRecipe = (id) => RECIPES.find((r) => r.id === id);

  const index = RECIPES.reduce((acc, r, i) => { acc[r.id] = i; return acc; }, {});

  /** Total time, worked out so it is never wrong. */
  const totalTime = (r) => (r.timings.prep || 0) + (r.timings.cook || 0);

  const mins = (m) => {
    m = Math.round(m);
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60), mm = m % 60;
    return mm ? h + ' hr ' + mm + ' min' : h + ' hr' + (h > 1 ? 's' : '');
  };

  const ovenText = (o) => {
    if (!o) return '—';
    const parts = [];
    if (o.fan != null) parts.push(o.fan + '°C fan');
    if (o.conventional != null) parts.push(o.conventional + '°C');
    if (o.gas != null) parts.push('gas ' + o.gas);
    return parts.join(' / ');
  };

  const difficultyClass = (d) => {
    const k = String(d || '').toLowerCase();
    if (k.indexOf('project') > -1 || k.indexOf('hard') > -1) return 'difficulty difficulty--project';
    if (k.indexOf('medium') > -1 || k.indexOf('bit') > -1) return 'difficulty difficulty--medium';
    return 'difficulty';
  };

  const icon = (name, cls) => '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';

  /** Announce something to screen readers. */
  const announce = (msg) => {
    const live = document.getElementById('live-region');
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 60);
  };

  const toast = (msg, kind) => {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast--' + kind : '');
    el.innerHTML = icon('sparkle') + '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      setTimeout(() => el.remove(), 320);
    }, 3200);
  };

  /** Highlight search words inside an already-escaped string. */
  function highlight(text, words) {
    let out = esc(text);
    if (!words || !words.length) return out;
    words.forEach((w) => {
      if (!w || w.length < 2) return;
      const safe = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try { out = out.replace(new RegExp('(' + safe + ')', 'gi'), '<span class="highlight">$1</span>'); } catch (e) { /* ignore */ }
    });
    return out;
  }


  /* ═══════════════════════════════════════════════════════════════════════
     2. NUMBER & MEASUREMENT FORMATTING
        The heart of the quantity calculator.
     ═════════════════════════════════════════════════════════════════════ */

  const FRACTIONS = [
    [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'],
    [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞']
  ];

  /** 1.5 → "1½", 0.25 → "¼", 3 → "3". Never shows an ugly 1.333333. */
  function nice(n) {
    if (n === 0) return '0';
    const whole = Math.floor(n + 1e-9);
    const frac = n - whole;
    if (frac < 0.01) return String(whole);
    let best = null, bestDiff = Infinity;
    FRACTIONS.forEach(([v, g]) => {
      const d = Math.abs(frac - v);
      if (d < bestDiff) { bestDiff = d; best = g; }
    });
    if (bestDiff > 0.08) {
      const rounded = Math.round(n * 10) / 10;
      return rounded % 1 === 0 ? String(rounded) : String(rounded).replace(/^0\./, '.');
    }
    return (whole > 0 ? String(whole) : '') + best;
  }

  /** Snap a number to a friendly cooking increment. */
  function snap(v, step) {
    if (v <= 0) return 0;
    return Math.round(v / step) * step;
  }

  /* Counted things (eggs, apples, lemons) snap to amounts a cook can actually
     manage: whole, half, quarter, or a third. */
  const COUNT_SNAPS = [0, 0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1];

  function snapCounted(v) {
    if (v <= 0) return 0;
    const whole = Math.floor(v);
    const frac = v - whole;
    if (frac < 0.03) return whole;
    let best = COUNT_SNAPS[0], bestDiff = Infinity;
    COUNT_SNAPS.forEach((s) => {
      const d = Math.abs(frac - s);
      if (d < bestDiff) { bestDiff = d; best = s; }
    });
    return whole + (best >= 1 ? 1 : best);
  }

  /** Round a scaled amount to something you can actually measure. */
  function roundAmount(value, unit, customStep) {
    if (value <= 0) return 0;
    if (customStep) return snap(value, customStep);
    const u = String(unit || '').toLowerCase();
    if (u === 'g' || u === 'kg') {
      if (value < 10) return snap(value, 0.5);
      if (value < 100) return snap(value, 1);
      return snap(value, 5);
    }
    if (u === 'ml' || u === 'l') {
      if (value < 20) return snap(value, 1);
      if (value < 100) return snap(value, 5);
      return snap(value, 10);
    }
    if (u === 'tsp' || u === 'tbsp') return snap(value, 0.125); // eighths
    return snapCounted(value); // counted things: eggs, apples, lemons…
  }

  /* ── Optional US / imperial equivalents ─────────────────────────────────── */
  const CUPS = [
    [2, '2 cups'], [1.75, '1¾ cups'], [1.5, '1½ cups'], [1.25, '1¼ cups'], [1, '1 cup'],
    [0.75, '¾ cup'], [0.66, '⅔ cup'], [0.5, '½ cup'], [0.33, '⅓ cup'], [0.25, '¼ cup']
  ];
  function usFor(q, unit) {
    const u = String(unit || '').toLowerCase();
    if (u === 'g' || u === 'kg') {
      const grams = u === 'kg' ? q * 1000 : q;
      if (grams >= 460) return nice(Math.round((grams / 453.6) * 10) / 10) + ' lb';
      const oz = grams / 28.35;
      return (oz >= 10 ? nice(Math.round(oz)) : nice(Math.round(oz * 2) / 2)) + ' oz';
    }
    if (u === 'ml' || u === 'l') {
      const ml = u === 'l' ? q * 1000 : q;
      const fl = ml / 29.57;
      return (fl >= 10 ? nice(Math.round(fl)) : nice(Math.round(fl * 2) / 2)) + ' fl oz';
    }
    if (u === 'tsp') {
      if (q >= 3) {
        const tbsp = q / 3;
        for (const [v, label] of CUPS) if (Math.abs(tbsp - v) <= 0.06) return label;
        return nice(tbsp) + ' tbsp';
      }
      return nice(q) + ' tsp';
    }
    if (u === 'tbsp') {
      for (const [v, label] of CUPS) if (Math.abs(q - v) <= 0.06) return label;
      return nice(q) + ' tbsp';
    }
    return '';
  }

  /* ── Awkward amounts get a friendly explanation ─────────────────────────── */
  const EGG_FRACTIONS = [
    [0.25, '¼', 'one quarter'], [1 / 3, '⅓', 'a third'], [0.5, '½', 'half'],
    [2 / 3, '⅔', 'two thirds'], [0.75, '¾', 'three quarters']
  ];

  function eggHelp(amount) {
    if (amount % 1 === 0) return '';
    const whole = Math.floor(amount);
    const frac = amount - whole;
    const hit = EGG_FRACTIONS.reduce((best, f) =>
      Math.abs(frac - f[0]) < Math.abs(frac - best[0]) ? f : best, EGG_FRACTIONS[0]);

    // Just the fraction on its own — half an egg, a third of an egg…
    if (whole === 0) {
      if (Math.abs(frac - 0.5) < 0.02) return 'Beat one egg and use half of it.';
      return 'Beat one egg and use about ' + hit[2] + ' of it.';
    }
    // A whole number plus a fraction — beat a couple and measure out
    if (Math.abs(frac - 0.5) < 0.02) return 'Beat ' + whole + ' eggs, then beat one more and stir in half of it.';
    const eggs = whole + 1;
    return 'Beat ' + eggs + ' eggs together and use about ' + hit[1] + ' of the mixture (roughly ' +
      nice(amount * 3) + ' tablespoons).';
  }

  function countedHelp(name, amount) {
    const n = String(name || '').toLowerCase();

    if (/egg/.test(n)) return eggHelp(amount);

    if (/banana/.test(n)) {
      if (amount % 1 === 0) return '';
      if (Math.abs(amount - 0.5) < 0.01) return 'Half a banana — mash one and use half.';
      return 'Round to the nearest whole banana; this bake is forgiving.';
    }
    if (/lemon|orange|lime/.test(n)) {
      if (amount % 1 === 0) return '';
      return 'Use half of one, or a whole one if it is small.';
    }
    if (/apple/.test(n) && amount % 1 !== 0) return 'Round up or down to whole apples — go by weight if you have scales.';
    if (amount % 1 !== 0) return 'Round to the nearest whole one.';
    return '';
  }


  /* ═══════════════════════════════════════════════════════════════════════
     3. SAVED DATA (favourites + shopping list) — kept in this browser only
     ═════════════════════════════════════════════════════════════════════ */

  const KEYS = { favs: 'bonnybakes.favourites', shop: 'bonnybakes.shoppinglist' };

  const store = {
    read(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed == null ? fallback : parsed;
      } catch (e) { return fallback; }
    },
    write(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    }
  };

  let favourites = store.read(KEYS.favs, []);
  if (!Array.isArray(favourites)) favourites = [];

  const isFav = (id) => favourites.indexOf(id) > -1;

  function toggleFav(id) {
    const at = favourites.indexOf(id);
    if (at > -1) favourites.splice(at, 1); else favourites.push(id);
    const ok = store.write(KEYS.favs, favourites);
    if (!ok) toast('This browser is blocking saved favourites, so they will not be remembered.', 'rasp');
    paintFavCounts();
    return at === -1;
  }

  function paintFavCounts() {
    const n = favourites.length;
    const badge = document.getElementById('fav-badge');
    const navCount = document.getElementById('nav-fav-count');
    if (badge) { badge.textContent = String(n); badge.hidden = n === 0; }
    if (navCount) { navCount.textContent = String(n); navCount.hidden = n === 0; }
    // Keep any visible heart buttons in step
    $$('[data-fav-id]').forEach((btn) => {
      const on = isFav(btn.getAttribute('data-fav-id'));
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + btn.getAttribute('data-fav-name') + (on ? ' from' : ' to') + ' favourites');
      btn.innerHTML = icon(on ? 'heart-fill' : 'heart');
    });
  }

  /* Shopping list -------------------------------------------------------- */
  let shop = store.read(KEYS.shop, []);
  if (!Array.isArray(shop)) shop = [];

  const saveShop = () => { store.write(KEYS.shop, shop); paintShopCount(); };

  /**
   * Two lines count as the same shopping item only if the ingredient AND its
   * note match — so "butter, softened" and "butter, for the buttercream" stay
   * separate (you need to know that when you are in the shop), while adding the
   * same recipe twice correctly doubles the amounts.
   */
  const shopKey = (name, unit, note) =>
    slug(name) + '|' + String(unit || '').toLowerCase() + '|' + slug(note || '');

  function paintShopCount() {
    const n = shop.length;
    const badge = document.getElementById('cart-badge');
    if (badge) { badge.textContent = String(n); badge.hidden = n === 0; }
    const btn = document.getElementById('cart-button');
    if (btn) btn.setAttribute('aria-label', n ? 'Open shopping list, ' + n + ' items' : 'Open shopping list');
  }

  /** Shopping-list label, including the small note when there is one. */
  const shopLabel = (ing) => ing.text + (ing.note ? ' — ' + ing.note : '');

  /**
   * Add every ingredient of a recipe to the shopping list.
   * If the same item is already on the list from the same recipe, the amounts
   * are added together (200g + 200g → 400g) instead of duplicating the line.
   */
  function addRecipeToShop(recipe, yield_) {
    let added = 0, merged = 0;
    scaledIngredients(recipe, yield_).forEach((ing) => {
      const key = shopKey(ing.n, ing.u, ing.note);
      const recipeId = recipe.id;
      const existing = shop.find((it) => it.recipeId === recipeId && it.key === key);
      if (existing) {
        existing.q = roundAmount((existing.q || 0) + (ing.q || 0), ing.u);
        // Re-write the label from the new total, not from the single batch
        const mergedIng = Object.assign({}, ing, {
          q: existing.q,
          text: (existing.q === 0 ? 'a small pinch of ' : nice(existing.q) + (ing.u ? ' ' + ing.u : '') + ' ') + ing.n
        });
        existing.label = shopLabel(mergedIng);
        merged++;
      } else {
        shop.push({
          id: 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          recipeId: recipeId,
          recipeName: recipe.name,
          key: key,
          n: ing.n,
          u: ing.u,
          note: ing.note,
          q: ing.q,
          label: shopLabel(ing),
          done: false
        });
        added++;
      }
    });
    saveShop();
    if (merged && !added) toast('Added to your list — matching ingredients were combined.', 'leaf');
    else toast(recipe.name + ' added to your shopping list.', 'leaf');
  }


  /* ═══════════════════════════════════════════════════════════════════════
     4. RECIPE SCALING
     ═════════════════════════════════════════════════════════════════════ */

  /** The numbers offered in the "how many" drop-down, always including the base. */
  function yieldOptions(recipe) {
    const base = recipe.servings.base;
    const list = (recipe.servings.yields || []).slice();
    if (list.indexOf(base) === -1) list.push(base);
    list.push(base * 2);
    const clean = [];
    list.forEach((v) => {
      const n = Math.round(Number(v));
      if (n > 0 && clean.indexOf(n) === -1) clean.push(n);
    });
    return clean.sort((a, b) => a - b);
  }

  const clampYield = (recipe, v) => Math.max(1, Math.min(999, Math.round(v || 1)));

  /** Step size for the + / − buttons: only used when it divides evenly. */
  function stepSize(recipe) {
    const base = recipe.servings.base;
    const step = base <= 2 ? 1 : base <= 10 ? 1 : base <= 20 ? 2 : 5;
    return base % step === 0 ? step : 0; // 0 = disable the stepper
  }

  /** Work out every ingredient for a given yield. Returns ready-to-print bits. */
  function scaledIngredients(recipe, yield_) {
    const base = recipe.servings.base;
    const ratio = (yield_ || base) / base;
    return recipe.ingredients.map((ing) => {
      const fixed = ing.fixed === true || ing.scale === false;
      const raw = fixed ? ing.q : ing.q * ratio;
      const q = fixed ? ing.q : roundAmount(raw, ing.u, ing.step);
      const unit = ing.u || '';
      let text = '';

      if (q === 0 && !fixed) {
        text = 'a small pinch of ' + ing.n;
      } else {
        const qText = nice(q);
        text = qText + (unit ? ' ' + unit : '') + ' ' + ing.n;
      }

      const us = ing.us && !fixed
        ? usFor(q, unit)
        : (ing.us && fixed && ratio !== 1 ? '' : (ing.us || ''));

      return {
        q: q,
        u: unit,
        n: ing.n,
        note: ing.note || '',
        text: text.replace(/\s+/g, ' ').trim(),
        us: us,
        help: (!fixed && !unit) ? countedHelp(ing.n, q) : ''
      };
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════
     5. SHARED PIECES
     ═════════════════════════════════════════════════════════════════════ */

  function mediaFrame(img, extraClass) {
    const file = (img && img.file) || '';
    const alt = esc((img && img.alt) || 'Photograph of the finished bake');
    const name = esc((img && img.name) || '');
    return '' +
      '<div class="media-frame ' + (extraClass || '') + '" data-media>' +
        (file
          ? '<img src="' + esc(file) + '" alt="' + alt + '" loading="lazy" decoding="async" width="800" height="600">'
          : '') +
        '<div class="media-frame__fallback" aria-hidden="true">' +
          icon('whisk') +
          '<span>' + name + '</span>' +
          '<small>Add your photo to ' + esc(file || 'images/') + '</small>' +
        '</div>' +
      '</div>';
  }

  /** If a photo file is missing, swap in the friendly placeholder. */
  function wireMediaFallbacks(root) {
    $$('img', root).forEach((img) => {
      img.addEventListener('error', () => {
        const frame = img.closest('[data-media]');
        if (frame) frame.classList.add('is-missing');
      });
    });
  }

  function favButton(recipe, cls) {
    const on = isFav(recipe.id);
    return '' +
      '<button type="button" class="fav-btn ' + (cls || '') + '" data-fav-id="' + recipe.id + '"' +
      ' data-fav-name="' + esc(recipe.name) + '" aria-pressed="' + (on ? 'true' : 'false') + '"' +
      ' aria-label="' + (on ? 'Remove ' : 'Save ') + esc(recipe.name) + (on ? ' from' : ' to') + ' favourites">' +
        icon(on ? 'heart-fill' : 'heart') +
      '</button>';
  }

  function recipeCard(recipe, words) {
    const img = Object.assign({ name: recipe.name }, recipe.image || {});
    const diff = recipe.difficulty || 'Easy';
    return '' +
    '<article class="card">' +
      '<a class="media-frame-link" href="#/recipe/' + recipe.id + '" tabindex="-1" aria-hidden="true">' +
        mediaFrame(img) +
      '</a>' +
      '<div class="card__body">' +
        '<div class="card__top">' +
          '<span class="card__cat">' + esc(recipe.category) + '</span>' +
        '</div>' +
        '<h3 class="card__title"><a href="#/recipe/' + recipe.id + '">' + highlight(recipe.name, words) + '</a></h3>' +
        '<p class="card__desc">' + highlight(recipe.description, words) + '</p>' +
        '<div class="card__meta">' +
          '<span class="' + difficultyClass(diff) + '">' + esc(diff) + '</span>' +
          '<span class="meta">' + icon('timer') + mins(totalTime(recipe)) + ' total</span>' +
          '<span class="meta">' + icon('clock') + 'Prep ' + mins(recipe.timings.prep) + '</span>' +
          '<span class="meta">' + icon('oven') + 'Bake ' + mins(recipe.timings.cook) + '</span>' +
        '</div>' +
        '<div class="card__foot">' +
          '<a class="btn btn--sm" href="#/recipe/' + recipe.id + '">View Recipe ' + icon('arrow-right') + '</a>' +
          favButton(recipe) +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function cardGrid(list, words, cls) {
    if (!list.length) return '';
    return '<div class="grid ' + (cls || 'grid--cards') + '">' +
      list.map((r) => recipeCard(r, words)).join('') + '</div>';
  }

  function emptyState(title, body, actionHtml, iconName) {
    return '<div class="empty">' + icon(iconName || 'whisk') +
      '<h3>' + esc(title) + '</h3><p>' + body + '</p>' + (actionHtml || '') + '</div>';
  }


  /* ═══════════════════════════════════════════════════════════════════════
     6. PAGES
     ═════════════════════════════════════════════════════════════════════ */

  const CATEGORIES = (function () {
    const seen = [];
    EXTRA_CATS.forEach((c) => seen.push(c));
    RECIPES.forEach((r) => { if (seen.indexOf(r.category) === -1) seen.push(r.category); });
    return seen;
  })();

  const countIn = (cat) => RECIPES.filter((r) => r.category === cat).length;

  const featured = () => {
    const flagged = RECIPES.filter((r) => r.featured);
    return (flagged.length ? flagged : RECIPES).slice(0, 4);
  };

  /* ── Home ─────────────────────────────────────────────────────────────── */
  function viewHome() {
    const heroImg = { file: 'images/hero.jpg', alt: 'A welcoming kitchen table with a Victoria sponge, a tray of biscuits and a pot of tea.', name: 'Bonny Bakes' };
    const cats = CATEGORIES.map((c) =>
      '<a class="tile" href="#/recipes?cat=' + encodeURIComponent(c) + '">' +
        '<span class="tile__icon">' + icon('sparkle') + '</span>' +
        '<span><span class="tile__name">' + esc(c) + '</span><br>' +
        '<span class="tile__count">' + countIn(c) + (countIn(c) === 1 ? ' recipe' : ' recipes') + '</span></span>' +
      '</a>'
    ).join('');

    return '' +
    '<section class="hero">' +
      '<div class="wrap hero__inner">' +
        '<div class="hero__copy">' +
          '<span class="hero__kicker"><span class="dot"></span> Welcome to Bonny&rsquo;s kitchen</span>' +
          '<h1>Simple bakes. <em>Happy hearts.</em></h1>' +
          '<p class="hero__lead">Lovely homemade recipes from Bonny&rsquo;s kitchen &mdash; written out properly, with the little hints that make them work every time.</p>' +
          '<div class="hero__cta">' +
            '<a class="btn" href="#/recipes">Browse Recipes ' + icon('arrow-right') + '</a>' +
            '<button type="button" class="btn btn--secondary" id="surprise-btn">' + icon('sparkle') + ' Surprise Me</button>' +
          '</div>' +
          '<div class="hero__facts">' +
            '<span class="hero__fact">' + icon('list') + RECIPES.length + ' tried-and-tested recipes</span>' +
            '<span class="hero__fact">' + icon('scale') + ' Scale any recipe up or down</span>' +
            '<span class="hero__fact">' + icon('heart') + ' Save your favourites</span>' +
          '</div>' +
        '</div>' +
        '<div class="hero__media">' +
          '<span class="hero__blob" aria-hidden="true"></span>' +
          mediaFrame(heroImg) +
          '<div class="hero__badge">' + icon('whisk') +
            '<span><b>Recipe of the moment</b><span id="surprise-name">' + esc(featured()[0].name) + '</span></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section wrap">' +
      '<div class="section-head">' +
        '<div><span class="eyebrow">' + icon('sparkle') + ' Fresh from the oven</span>' +
        '<h2>Bonny&rsquo;s favourites</h2>' +
        '<p>A few of the bakes that get made again and again. Tap the heart to keep one for later.</p></div>' +
        '<span class="spacer"></span>' +
        '<a class="btn btn--ghost btn--sm" href="#/recipes">See all ' + RECIPES.length + ' recipes</a>' +
      '</div>' +
      cardGrid(featured(), [], 'grid--wide') +
    '</section>' +

    '<section class="section section--tight wrap">' +
      '<div class="section-head"><div><span class="eyebrow">' + icon('list') + ' Pick a tin</span><h2>What are you baking today?</h2></div></div>' +
      '<div class="grid grid--tiles">' + cats + '</div>' +
    '</section>' +

    '<section class="section section--tight wrap">' +
      '<div class="strip">' +
        '<div class="strip__item">' + icon('scale') + '<h3>Make as many as you need</h3>' +
          '<p>Every recipe recalculates its ingredients the moment you change the number &mdash; 4 fairy cakes or 24, it does the sums for you.</p></div>' +
        '<div class="strip__item">' + icon('list') + '<h3>Build a shopping list</h3>' +
          '<p>Send the ingredients of one recipe, or several, straight to a list you can tick off in the shops.</p></div>' +
        '<div class="strip__item">' + icon('print') + '<h3>Print a tidy card</h3>' +
          '<p>No adverts, no life story &mdash; just the ingredients, the method and the oven temperature on one clean page.</p></div>' +
      '</div>' +
    '</section>';
  }

  /* ── Browse / all recipes ─────────────────────────────────────────────── */
  let browse = { q: '', cat: '', sort: 'featured', favs: false };

  function sortList(list, how) {
    const copy = list.slice();
    switch (how) {
      case 'time-asc': copy.sort((a, b) => totalTime(a) - totalTime(b)); break;
      case 'time-desc': copy.sort((a, b) => totalTime(b) - totalTime(a)); break;
      case 'az': copy.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'za': copy.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'easy': {
        const rank = (r) => { const d = String(r.difficulty).toLowerCase(); return d.indexOf('project') > -1 ? 2 : d.indexOf('medium') > -1 ? 1 : 0; };
        copy.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
        break;
      }
      default: copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (index[a.id] - index[b.id]));
    }
    return copy;
  }

  /** Search across name, description, ingredients, category and tags. */
  function matches(recipe, words) {
    if (!words.length) return true;
    const hay = [
      recipe.name, recipe.description, recipe.category,
      (recipe.tags || []).join(' '),
      recipe.ingredients.map((i) => i.n + ' ' + (i.note || '')).join(' ')
    ].join(' ').toLowerCase();
    return words.every((w) => hay.indexOf(w) > -1);
  }

  function viewBrowse() {
    const words = browse.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const cats = CATEGORIES.map((c) =>
      '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (browse.cat === c) + '">' +
      esc(c) + ' <span class="count">' + countIn(c) + '</span></button>'
    ).join('');

    const sorts = [
      ['featured', 'Bonny&rsquo;s picks first'],
      ['az', 'Name A&ndash;Z'],
      ['za', 'Name Z&ndash;A'],
      ['time-asc', 'Quickest first'],
      ['time-desc', 'Longest first'],
      ['easy', 'Easiest first']
    ].map(([v, label]) => '<option value="' + v + '"' + (browse.sort === v ? ' selected' : '') + '>' + label + '</option>').join('');

    return '' +
    '<div class="wrap">' +
      '<header class="page-head">' +
        '<h1>All the recipes</h1>' +
        '<p>' + RECIPES.length + ' reliable bakes, sorted into the tins they belong in. Search for an ingredient, a cake or a mood &mdash; it all works.</p>' +
      '</header>' +

      '<div class="browse-bar no-print">' +
        '<div class="browse-bar__row">' +
          '<div class="field grow">' + icon('search') +
            '<label class="sr-only" for="browse-search">Search recipes</label>' +
            '<input id="browse-search" type="search" placeholder="Search by name, ingredient or category&hellip;" value="' + esc(browse.q) + '" autocomplete="off">' +
            (browse.q ? '<button type="button" class="clear-x" id="browse-clear" aria-label="Clear search">' + icon('close') + '</button>' : '') +
          '</div>' +
          '<div class="select-wrap field">' +
            '<label class="sr-only" for="browse-sort">Sort recipes</label>' +
            '<select id="browse-sort">' + sorts + '</select>' +
          '</div>' +
          '<button type="button" class="chip" id="browse-favs" aria-pressed="' + browse.favs + '">' + icon('heart') + ' My favourites only</button>' +
        '</div>' +
        '<div class="browse-bar__row browse-bar__row--filters" role="group" aria-label="Filter by category">' +
          '<button type="button" class="chip" data-cat="" aria-pressed="' + (browse.cat === '') + '">All</button>' + cats +
        '</div>' +
      '</div>' +

      '<div class="results-bar" id="results-bar"></div>' +
      '<div id="browse-results"></div>' +
    '</div>';
  }

  function filteredRecipes() {
    const words = browse.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = RECIPES.filter((r) => matches(r, words));
    if (browse.cat) list = list.filter((r) => r.category === browse.cat);
    if (browse.favs) list = list.filter((r) => isFav(r.id));
    return sortList(list, browse.sort);
  }

  function paintBrowseResults() {
    const results = document.getElementById('browse-results');
    const bar = document.getElementById('results-bar');
    if (!results) return;
    const words = browse.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = filteredRecipes();

    if (bar) {
      const bits = [];
      bits.push('<span><strong>' + list.length + '</strong> ' + (list.length === 1 ? 'recipe' : 'recipes') + '</span>');
      if (browse.q) bits.push('<span class="tag">searching &ldquo;' + esc(browse.q) + '&rdquo;</span>');
      if (browse.cat) bits.push('<span class="tag">' + esc(browse.cat) + '</span>');
      if (browse.favs) bits.push('<span class="tag">favourites only</span>');
      bar.innerHTML = bits.join('');
      announce(list.length + ' recipes found');
    }

    if (list.length) {
      results.innerHTML = cardGrid(list, words);
    } else if (browse.favs && !favourites.length) {
      results.innerHTML = emptyState(
        'No favourites saved yet',
        'Tap the heart on any recipe and it will wait for you here &mdash; no account, no signing in, it is just remembered in this browser.',
        '<a class="btn" href="#/recipes">Browse the recipes</a>', 'heart');
    } else {
      results.innerHTML = emptyState(
        'Nothing matches that just yet',
        'Try a different word &mdash; perhaps &ldquo;chocolate&rdquo;, &ldquo;lemon&rdquo; or &ldquo;quick&rdquo; &mdash; or clear the filters and have a look at everything.',
        '<button type="button" class="btn" id="reset-filters">Show all recipes</button>', 'search');
    }
    wireMediaFallbacks(results);
  }

  /* ── Favourites ───────────────────────────────────────────────────────── */
  function viewFavourites() {
    const list = favourites.map(findRecipe).filter(Boolean);
    const body = list.length
      ? cardGrid(list, [], 'grid--wide')
      : emptyState('Your favourite shelf is empty',
          'Tap the heart on any recipe &mdash; here or on the recipes page &mdash; and it will be kept safe in this browser for next time.',
          '<a class="btn" href="#/recipes">Find something lovely</a>', 'heart');

    return '' +
    '<div class="wrap">' +
      '<header class="page-head">' +
        '<h1>My Favourites</h1>' +
        '<p>The bakes you have popped a heart on. They stay here even when you close the browser.</p>' +
      '</header>' +
      '<section class="section section--tight" style="padding-inline:0">' + body + '</section>' +
    '</div>';
  }

  /* ── About ────────────────────────────────────────────────────────────── */
  function viewAbout() {
    const photo = { file: 'images/about-bonny.jpg', alt: 'A cosy kitchen table laid out with a cooling rack of cakes, a jug of tea and a well-used recipe notebook.', name: 'Bonny' };
    return '' +
    '<div class="wrap">' +
      '<header class="page-head"><h1>About Bonny</h1>' +
      '<p>The person, the kitchen and the reason this little website exists.</p></header>' +

      '<section class="section section--tight">' +
        '<div class="about-grid">' +
          '<div class="about-photo">' + mediaFrame(photo) + '</div>' +
          '<div class="about-body">' +
            '<p class="lede">Hello! I&rsquo;m Bonny, and this is where I keep the recipes that my family actually asks for twice.</p>' +
            '<p>None of them are fancy. They are the sort of bakes that come out of an ordinary oven in an ordinary kitchen, using butter, sugar, flour and whatever fruit is looking a bit sad in the bowl. Some were written on the back of an envelope years ago; all of them have been made enough times that I know exactly where they can go wrong.</p>' +
            '<blockquote class="about-quote">If you can weigh it, stir it and put it in the oven, you can bake it.</blockquote>' +
            '<p>I have written every recipe out the way I would explain it to a friend standing next to me &mdash; with the oven temperature, the timings, and the little things nobody tells you, like pressing flapjacks down hard or taking brownies out while they still wobble.</p>' +
            '<ul class="about-rules">' +
              '<li><b>Weigh things.</b> A &pound;5 pair of scales will do more for your baking than any gadget.</li>' +
              '<li><b>Read it all first.</b> Two minutes reading saves a panic halfway through.</li>' +
              '<li><b>Get everything out first.</b> Butter, eggs and milk at room temperature behave far better.</li>' +
              '<li><b>Trust your oven, not the clock.</b> Ovens lie. Skewers and wobbles do not.</li>' +
            '</ul>' +
            '<div class="hero__cta"><a class="btn" href="#/recipes">Have a look at the recipes ' + icon('arrow-right') + '</a>' +
            '<button type="button" class="btn btn--secondary" id="surprise-btn">' + icon('sparkle') + ' Surprise Me</button></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section section--tight">' +
        '<div class="section-head"><div><span class="eyebrow">' + icon('bulb') + ' Good to know</span><h2>How this website works</h2></div></div>' +
        '<div class="strip">' +
          '<div class="strip__item">' + icon('scale') + '<h3>The quantity calculator</h3><p>Choose how many you want and every ingredient changes instantly &mdash; including awkward ones, which come with a note so you are not left guessing about half an egg.</p></div>' +
          '<div class="strip__item">' + icon('check') + '<h3>Tick as you go</h3><p>Tick off ingredients and method steps while you bake. Your place is kept as you move around the page.</p></div>' +
          '<div class="strip__item">' + icon('list') + '<h3>Shopping list</h3><p>Send ingredients to a list, add your own bits of shopping, and it stays saved in this browser.</p></div>' +
          '<div class="strip__item">' + icon('print') + '<h3>Print &amp; share</h3><p>Print a clean recipe card for the kitchen drawer, or send a recipe to somebody else with the share button.</p></div>' +
        '</div>' +
      '</section>' +
    '</div>';
  }

  /* ── Recipe page ──────────────────────────────────────────────────────── */
  const recipeState = {}; // remembers the chosen yield + ticked boxes per recipe

  function stateFor(recipe) {
    if (!recipeState[recipe.id]) {
      recipeState[recipe.id] = { yield_: recipe.servings.base, ings: {}, steps: {} };
    }
    return recipeState[recipe.id];
  }

  function viewRecipe(recipe) {
    const st = stateFor(recipe);
    const base = recipe.servings.base;
    const img = Object.assign({ name: recipe.name }, recipe.image || {});
    const options = yieldOptions(recipe).map((v) =>
      '<option value="' + v + '"' + (v === st.yield_ ? ' selected' : '') + '>' + v + ' ' + esc(recipe.servings.label) + '</option>'
    ).join('');
    const step = stepSize(recipe);

    const i = index[recipe.id];
    const prev = RECIPES[(i - 1 + RECIPES.length) % RECIPES.length];
    const next = RECIPES[(i + 1) % RECIPES.length];
    const related = RECIPES.filter((r) => r.category === recipe.category && r.id !== recipe.id).slice(0, 3);

    return '' +
    '<div class="wrap">' +
      '<nav class="crumbs no-print" aria-label="Breadcrumb">' +
        '<a href="#/">Home</a><span class="sep">/</span>' +
        '<a href="#/recipes">Recipes</a><span class="sep">/</span>' +
        '<a href="#/recipes?cat=' + encodeURIComponent(recipe.category) + '">' + esc(recipe.category) + '</a><span class="sep">/</span>' +
        '<span aria-current="page">' + esc(recipe.name) + '</span>' +
      '</nav>' +

      '<article class="recipe">' +

        /* Only visible when printed */
        '<div class="print-only print-head">' +
          '<p class="print-brand">Bonny Bakes</p>' +
          '<h1>' + esc(recipe.name) + '</h1>' +
          '<p class="print-meta">' + esc(recipe.description) + '</p>' +
          '<div class="print-facts">' +
            '<div><b>Prep</b>' + mins(recipe.timings.prep) + '</div>' +
            '<div><b>Cook</b>' + mins(recipe.timings.cook) + '</div>' +
            '<div><b>Total</b>' + mins(totalTime(recipe)) + '</div>' +
            '<div><b>Oven</b>' + esc(ovenText(recipe.oven)) + '</div>' +
            '<div><b>Makes</b><span id="print-makes">' + st.yield_ + ' ' + esc(recipe.servings.label) + '</span></div>' +
            '<div><b>Difficulty</b>' + esc(recipe.difficulty) + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="recipe__hero">' + mediaFrame(img) +
          ((img.credit && img.credit !== 'Bonny Bakes') ? '<span class="recipe__credit no-print">Photo: ' + esc(img.credit) + '</span>' : '') +
        '</div>' +

        '<header class="recipe__head">' +
          '<div class="recipe__head-text">' +
            '<span class="card__cat">' + esc(recipe.category) + '</span>' +
            '<h1 class="recipe__title">' + esc(recipe.name) + '</h1>' +
            '<p class="recipe__intro">' + esc(recipe.description) + '</p>' +
            '<p class="rating" aria-label="Difficulty ' + esc(recipe.difficulty) + '">' +
              '<span class="rating__stars" aria-hidden="true">' +
                (recipe.difficulty === 'Easy' ? '★☆☆' : recipe.difficulty === 'Medium' ? '★★☆' : '★★★') +
              '</span>' + esc(recipe.difficulty) +
            '</p>' +
          '</div>' +
          '<div class="recipe__head-actions no-print">' +
            '<button type="button" class="btn btn--secondary" id="print-btn">' + icon('print') + ' Print Recipe</button>' +
            '<button type="button" class="btn btn--secondary" id="share-btn">' + icon('share') + ' Share</button>' +
            favButton(recipe) +
          '</div>' +
        '</header>' +

        '<div class="fact-row no-print">' +
          '<div class="fact"><span class="fact__icon">' + icon('clock') + '</span><span><span class="fact__label">Preparation</span><br><span class="fact__value">' + mins(recipe.timings.prep) + '</span></span></div>' +
          '<div class="fact"><span class="fact__icon">' + icon('oven') + '</span><span><span class="fact__label">Cooking</span><br><span class="fact__value">' + mins(recipe.timings.cook) + '</span></span></div>' +
          '<div class="fact"><span class="fact__icon">' + icon('timer') + '</span><span><span class="fact__label">Total time</span><br><span class="fact__value">' + mins(totalTime(recipe)) + '</span></span></div>' +
          '<div class="fact"><span class="fact__icon">' + icon('serves') + '</span><span><span class="fact__label">Makes</span><br><span class="fact__value">' + base + ' ' + esc(recipe.servings.label) + '</span></span></div>' +
          '<div class="fact fact--temp"><span class="fact__icon">' + icon('oven') + '</span><span><span class="fact__label">Oven</span><br><span class="fact__value">' + esc(ovenText(recipe.oven)) + '</span></span></div>' +
        '</div>' +

        (recipe.timings.note ? '<p class="scaler__note no-print" style="margin-top:-.4rem">' + icon('bulb') + ' ' + esc(recipe.timings.note) + '</p>' : '') +

        '<div class="recipe__cols">' +

          /* ── Ingredients panel ─────────────────────────────────────── */
          '<section class="panel-box ingredients-panel" aria-labelledby="ings-title">' +
            '<div class="panel-box__head">' +
              '<h2 id="ings-title">Ingredients</h2>' +
              '<p id="ings-summary"></p>' +
            '</div>' +

            '<div class="scaler no-print">' +
              '<span class="scaler__label">' + icon('scale') + ' How many are you making?</span>' +
              '<div class="scaler__row">' +
                '<div class="stepper">' +
                  '<button type="button" id="yield-minus" aria-label="Make fewer"' + (step ? '' : ' disabled') + '>' + icon('minus') + '</button>' +
                  '<span class="stepper__value" id="yield-value" aria-hidden="true">' + st.yield_ + '</span>' +
                  '<button type="button" id="yield-plus" aria-label="Make more"' + (step ? '' : ' disabled') + '>' + icon('plus') + '</button>' +
                '</div>' +
                '<div class="select-wrap field">' +
                  '<label class="sr-only" for="yield-select">Number of ' + esc(recipe.servings.label) + '</label>' +
                  '<select id="yield-select">' + options + '<option value="custom"' + (options.indexOf('value="' + st.yield_ + '"') === -1 ? ' selected' : '') + '>Custom amount&hellip;</option></select>' +
                '</div>' +
                '<button type="button" class="btn btn--ghost btn--sm scaler__reset" id="yield-reset">' + icon('reset') + ' Reset</button>' +
              '</div>' +
              '<div class="scaler__row" id="yield-custom-row" hidden>' +
                '<div class="field">' +
                  '<label class="sr-only" for="yield-custom">Custom number of ' + esc(recipe.servings.label) + '</label>' +
                  '<input id="yield-custom" type="number" min="1" max="999" step="1" inputmode="numeric" value="' + st.yield_ + '">' +
                  '<span class="scaler__note">' + esc(recipe.servings.label) + '</span>' +
                '</div>' +
              '</div>' +
              '<p class="scaler__note" id="yield-note">' + (step ? '' : 'Use the drop-down to choose your number.') + '</p>' +
            '</div>' +

            '<div class="panel-box__body">' +
              '<ul class="ings" id="ings-list"></ul>' +
              '<div class="ings-progress no-print"><span id="ings-count">0 / 0</span>' +
                '<span class="ings-progress__bar"><span class="ings-progress__fill" id="ings-fill"></span></span></div>' +
              '<div class="recipe-actions no-print">' +
                '<button type="button" class="btn btn--leaf btn--sm" id="add-shop">' + icon('list') + ' Add to shopping list</button>' +
                '<button type="button" class="btn btn--ghost btn--sm" id="clear-checks">Untick all</button>' +
              '</div>' +
            '</div>' +
          '</section>' +

          /* ── Method + extras ───────────────────────────────────────── */
          '<div class="recipe__main">' +
            '<section aria-labelledby="method-title" style="margin-bottom:1.5rem">' +
              '<div class="section-head" style="margin-bottom:1rem">' +
                '<div><span class="eyebrow">' + icon('whisk') + ' Step by step</span><h2 id="method-title">Method</h2>' +
                '<p>Tap a step to tick it off as you go.</p></div>' +
              '</div>' +
              '<div class="method" id="method-list">' +
                recipe.method.map((s, n) =>
                  '<button type="button" class="step" data-step="' + n + '" aria-pressed="' + (st.steps[n] ? 'true' : 'false') + '">' +
                    '<span class="step__num" aria-hidden="true"></span>' +
                    '<span class="step__text">' + esc(s) + '</span>' +
                  '</button>').join('') +
              '</div>' +
              '<p class="step__hint no-print">' + icon('bulb') + ' ' + esc(recipe.timings.note || 'Read the whole method through once before you start &mdash; it makes everything calmer.') + '</p>' +
              '<div class="method-progress no-print"><span id="step-count">0 / ' + recipe.method.length + ' steps</span>' +
                '<span class="method-progress__bar"><span class="method-progress__fill" id="step-fill"></span></span></div>' +
            '</section>' +

            '<section class="tip-box" aria-labelledby="tip-title" style="margin-bottom:1.5rem">' +
              '<h2 id="tip-title">' + icon('bulb') + ' Bonny&rsquo;s tips</h2>' +
              '<ul class="tip-list">' + recipe.tips.map((t) => '<li><span>' + esc(t) + '</span></li>').join('') + '</ul>' +
            '</section>' +

            '<section class="info-grid">' +
              (recipe.storage ? '<div class="info-card"><h2>' + icon('clock') + ' Keeping &amp; freezing</h2><p>' + esc(recipe.storage) + '</p></div>' : '') +
              (recipe.equipment && recipe.equipment.length
                ? '<div class="info-card"><h2>' + icon('whisk') + ' What you will need</h2><ul>' + recipe.equipment.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul></div>' : '') +
              '<div class="info-card"><h2>' + icon('oven') + ' Oven temperature</h2>' +
                '<table class="temp-table"><tbody>' +
                  (recipe.oven.fan != null ? '<tr><th>Fan oven</th><td>' + recipe.oven.fan + '&deg;C</td></tr>' : '') +
                  (recipe.oven.conventional != null ? '<tr><th>Conventional</th><td>' + recipe.oven.conventional + '&deg;C</td></tr>' : '') +
                  (recipe.oven.gas != null ? '<tr><th>Gas mark</th><td>' + recipe.oven.gas + '</td></tr>' : '') +
                  (recipe.oven.fahrenheit != null ? '<tr><th>Fahrenheit</th><td>' + recipe.oven.fahrenheit + '&deg;F</td></tr>' : '') +
                '</tbody></table></div>' +
            '</section>' +

            '<nav class="pager no-print" aria-label="More recipes" style="margin-top:1.75rem">' +
              '<a class="pager--prev" href="#/recipe/' + prev.id + '">' + icon('arrow-right') +
                '<span><span class="pager__label">Previous</span><br><span class="pager__name">' + esc(prev.name) + '</span></span></a>' +
              '<a class="pager--next" href="#/recipe/' + next.id + '">' + icon('arrow-right') +
                '<span><span class="pager__label">Next</span><br><span class="pager__name">' + esc(next.name) + '</span></span></a>' +
            '</nav>' +
          '</div>' +
        '</div>' +

        (related.length
          ? '<section class="section section--tight section--related no-print" style="padding-inline:0">' +
              '<div class="section-head"><div><span class="eyebrow">' + icon('sparkle') + ' More from the ' + esc(recipe.category.toLowerCase()) + ' shelf</span>' +
              '<h2>You might also like</h2></div></div>' + cardGrid(related, []) + '</section>'
          : '') +
      '</article>' +

      '<footer class="print-only print-foot">Bonny Bakes &mdash; simple bakes, happy hearts. Printed from ' +
        '<span id="print-url">' + esc(window.location.href) + '</span></footer>' +
    '</div>';
  }


  /* ═══════════════════════════════════════════════════════════════════════
     7. RECIPE PAGE BEHAVIOUR
     ═════════════════════════════════════════════════════════════════════ */

  function paintIngredients(recipe) {
    const st = stateFor(recipe);
    const list = scaledIngredients(recipe, st.yield_);
    const box = document.getElementById('ings-list');
    if (!box) return;

    box.innerHTML = list.map((ing, n) => {
      const id = 'ing-' + recipe.id + '-' + n;
      const checked = st.ings[n] ? ' checked' : '';
      return '' +
        '<li class="ing">' +
          '<input type="checkbox" id="' + id + '" data-ing="' + n + '"' + checked + '>' +
          '<label class="ing__box" for="' + id + '" aria-hidden="true">' + icon('check') + '</label>' +
          '<label class="ing__text" for="' + id + '">' +
            '<span class="ing__qty">' + esc(ing.text) + '</span>' +
            (ing.note ? '<span class="ing__note">' + esc(ing.note) + '</span>' : '') +
            (ing.us ? '<span class="ing__us">US: ' + esc(ing.us) + '</span>' : '') +
            (ing.help ? '<span class="ing__help">' + esc(ing.help) + '</span>' : '') +
          '</label>' +
        '</li>';
    }).join('');

    const summary = document.getElementById('ings-summary');
    if (summary) {
      const base = recipe.servings.base;
      summary.textContent = st.yield_ === base
        ? 'The original recipe &mdash; makes ' + base + ' ' + recipe.servings.label + '.'
        : 'Scaled from ' + base + ' to ' + st.yield_ + ' ' + recipe.servings.label + '. Amounts are rounded to what you can measure.';
    }

    const value = document.getElementById('yield-value');
    if (value) value.textContent = String(st.yield_);

    const pm = document.getElementById('print-makes');
    if (pm) pm.textContent = st.yield_ + ' ' + recipe.servings.label;

    paintIngProgress(recipe);
  }

  function paintIngProgress(recipe) {
    const st = stateFor(recipe);
    const total = recipe.ingredients.length;
    const done = recipe.ingredients.filter((_, n) => st.ings[n]).length;
    const count = document.getElementById('ings-count');
    const fill = document.getElementById('ings-fill');
    if (count) count.textContent = done + ' / ' + total + ' ready';
    if (fill) fill.style.width = (total ? (done / total) * 100 : 0) + '%';
  }

  function paintStepProgress(recipe) {
    const st = stateFor(recipe);
    const total = recipe.method.length;
    const done = recipe.method.filter((_, n) => st.steps[n]).length;
    const count = document.getElementById('step-count');
    const fill = document.getElementById('step-fill');
    if (count) count.textContent = done + ' / ' + total + (done === total && total ? ' steps — lovely!' : ' steps');
    if (fill) fill.style.width = (total ? (done / total) * 100 : 0) + '%';
  }

  function setYield(recipe, value, opts) {
    const st = stateFor(recipe);
    st.yield_ = clampYield(recipe, value);
    paintIngredients(recipe);

    const select = document.getElementById('yield-select');
    if (select) {
      const match = Array.prototype.some.call(select.options, (o) => Number(o.value) === st.yield_);
      select.value = match ? String(st.yield_) : 'custom';
    }
    const customRow = document.getElementById('yield-custom-row');
    if (customRow) customRow.hidden = select ? select.value !== 'custom' : true;
    const customInput = document.getElementById('yield-custom');
    if (customInput && document.activeElement !== customInput) customInput.value = st.yield_;

    if (!opts || !opts.silent) {
      announce('Ingredients recalculated for ' + st.yield_ + ' ' + recipe.servings.label);
    }
  }

  function wireRecipePage(recipe) {
    const st = stateFor(recipe);

    /* Quantity controls */
    const step = stepSize(recipe);
    const minus = document.getElementById('yield-minus');
    const plus = document.getElementById('yield-plus');
    if (minus) minus.addEventListener('click', () => setYield(recipe, st.yield_ - step));
    if (plus) plus.addEventListener('click', () => setYield(recipe, st.yield_ + step));

    const select = document.getElementById('yield-select');
    if (select) {
      select.addEventListener('change', () => {
        if (select.value === 'custom') {
          const row = document.getElementById('yield-custom-row');
          if (row) row.hidden = false;
          const input = document.getElementById('yield-custom');
          if (input) { input.focus(); input.select(); }
          announce('Type the number of ' + recipe.servings.label + ' you want to make.');
        } else {
          const row = document.getElementById('yield-custom-row');
          if (row) row.hidden = true;
          setYield(recipe, Number(select.value));
        }
      });
    }

    const customInput = document.getElementById('yield-custom');
    if (customInput) {
      const apply = () => {
        const v = parseInt(customInput.value, 10);
        if (v > 0) setYield(recipe, v);
      };
      customInput.addEventListener('input', apply);
      customInput.addEventListener('change', apply);
    }

    const reset = document.getElementById('yield-reset');
    if (reset) {
      reset.addEventListener('click', () => {
        setYield(recipe, recipe.servings.base);
        toast('Back to the original: ' + recipe.servings.base + ' ' + recipe.servings.label + '.');
      });
    }

    /* Ingredient checkboxes */
    const ingsList = document.getElementById('ings-list');
    if (ingsList) {
      ingsList.addEventListener('change', (e) => {
        const input = e.target.closest('input[data-ing]');
        if (!input) return;
        st.ings[input.getAttribute('data-ing')] = input.checked;
        paintIngProgress(recipe);
      });
    }
    const clearChecks = document.getElementById('clear-checks');
    if (clearChecks) {
      clearChecks.addEventListener('click', () => {
        st.ings = {};
        $$('input[data-ing]', ingsList).forEach((i) => { i.checked = false; });
        paintIngProgress(recipe);
        announce('All ingredients unticked.');
      });
    }

    /* Method steps */
    const methodList = document.getElementById('method-list');
    if (methodList) {
      methodList.addEventListener('click', (e) => {
        const btn = e.target.closest('.step');
        if (!btn) return;
        const n = btn.getAttribute('data-step');
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        st.steps[n] = on;
        paintStepProgress(recipe);
      });
    }

    /* Shopping list */
    const addShop = document.getElementById('add-shop');
    if (addShop) {
      addShop.addEventListener('click', () => {
        addRecipeToShop(recipe, st.yield_);
        renderPanel();
      });
    }

    /* Print */
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const old = document.title;
        document.title = recipe.name + ' — Bonny Bakes';
        const restore = () => { document.title = old; window.removeEventListener('afterprint', restore); };
        window.addEventListener('afterprint', restore);
        setTimeout(() => window.print(), 60);
      });
    }

    /* Share */
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.addEventListener('click', () => shareRecipe(recipe));

    paintIngredients(recipe);
    paintStepProgress(recipe);
  }

  async function shareRecipe(recipe) {
    const url = window.location.origin + window.location.pathname + '#/recipe/' + recipe.id;
    const text = recipe.name + ' — ' + recipe.description + ' (from Bonny Bakes)';
    if (navigator.share) {
      try { await navigator.share({ title: recipe.name + ' — Bonny Bakes', text: text, url: url }); return; }
      catch (err) { if (err && err.name === 'AbortError') return; }
    }
    const payload = recipe.name + '\n' + recipe.description + '\n' + url;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
        toast('Recipe link copied to your clipboard.', 'leaf');
      } else { throw new Error('no clipboard'); }
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = payload;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      toast(ok ? 'Recipe link copied to your clipboard.' : 'Copy this link: ' + url, ok ? 'leaf' : 'rasp');
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════
     8. HEADER: nav, search, shopping panel, toasts
     ═════════════════════════════════════════════════════════════════════ */

  /* ── Mobile navigation ────────────────────────────────────────────────── */
  function wireNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
  }

  /* ── Header search + live suggestions ─────────────────────────────────── */
  function wireSearch() {
    const form = document.getElementById('header-search');
    const input = document.getElementById('header-search-input');
    const toggle = document.getElementById('search-toggle');
    const suggest = document.getElementById('search-suggest');
    if (!form || !input || !suggest) return;

    let cursor = -1;

    const closeSuggest = () => {
      suggest.hidden = true; suggest.innerHTML = ''; cursor = -1;
      input.setAttribute('aria-expanded', 'false');
    };

    const openSearch = () => {
      form.classList.add('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      input.focus();
    };
    const closeSearch = () => {
      if (window.innerWidth <= 900) {
        form.classList.remove('is-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
      closeSuggest();
    };

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (form.classList.contains('is-open') && window.innerWidth <= 900) closeSearch();
        else openSearch();
      });
    }

    const resultsFor = (q) => {
      const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      return RECIPES.filter((r) => matches(r, words)).slice(0, 6);
    };

    const paintSuggest = () => {
      const q = input.value;
      const list = resultsFor(q);
      form.classList.toggle('has-value', q.length > 0);
      if (!q.trim()) { closeSuggest(); return; }

      const items = list.map((r, i) => {
        const img = (r.image && r.image.file) || '';
        return '<li role="option" id="sug-' + i + '" aria-selected="false">' +
          '<a href="#/recipe/' + r.id + '">' +
            (img ? '<img class="ss-thumb" src="' + esc(img) + '" alt="" loading="lazy">' : '<span class="ss-thumb"></span>') +
            '<span><span class="ss-name">' + esc(r.name) + '</span><br><span class="ss-cat">' + esc(r.category) + '</span></span>' +
          '</a></li>';
      }).join('');

      suggest.innerHTML = (list.length
        ? items + '<li class="ss-foot">Press Enter to search all ' + RECIPES.filter((r) => matches(r, q.trim().toLowerCase().split(/\s+/).filter(Boolean))).length + ' matches</li>'
        : '<li class="ss-empty">Nothing matches &ldquo;' + esc(q) + '&rdquo; — try &ldquo;chocolate&rdquo; or &ldquo;lemon&rdquo;.</li>');
      suggest.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      cursor = -1;
      wireMediaFallbacks(suggest);
    };

    const moveCursor = (delta) => {
      const links = $$('a', suggest);
      if (!links.length) return;
      cursor = (cursor + delta + links.length) % links.length;
      links.forEach((a, i) => {
        a.classList.toggle('is-cursor', i === cursor);
        a.closest('li').setAttribute('aria-selected', i === cursor ? 'true' : 'false');
      });
      input.setAttribute('aria-activedescendant', 'sug-' + cursor);
      links[cursor].scrollIntoView({ block: 'nearest' });
    };

    input.addEventListener('input', paintSuggest);
    input.addEventListener('focus', () => { if (input.value.trim()) paintSuggest(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveCursor(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveCursor(-1); }
      else if (e.key === 'Escape') { closeSuggest(); }
      else if (e.key === 'Enter') {
        const links = $$('a', suggest);
        if (cursor > -1 && links[cursor]) { e.preventDefault(); links[cursor].click(); }
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      browse.q = input.value;
      browse.favs = false;
      closeSuggest();
      go('/recipes');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#header-search') && !e.target.closest('#search-toggle')) closeSuggest();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
      // "/" focuses the search box from anywhere — a small kindness
      if (e.key === '/' && document.activeElement === document.body) {
        e.preventDefault();
        if (window.innerWidth <= 900) openSearch(); else input.focus();
      }
    });
  }

  /* ── Shopping list panel ──────────────────────────────────────────────── */
  let panelOpen = false, lastFocused = null;

  function renderPanel() {
    const body = document.getElementById('panel-body');
    if (!body) return;

    if (!shop.length) {
      body.innerHTML = '<div class="shop-empty">' + icon('list') +
        '<p><b>Nothing on the list yet.</b><br>Open any recipe and press ' +
        '&ldquo;Add to shopping list&rdquo;, or add something of your own below.</p></div>' +
        '<form class="shop-add" id="shop-add-form">' +
          '<div class="field">' +
            '<label class="sr-only" for="shop-add-input">Add your own item</label>' +
            '<input id="shop-add-input" type="text" placeholder="Add your own item&hellip;" autocomplete="off">' +
          '</div>' +
          '<button class="btn btn--sm" type="submit">Add</button>' +
        '</form>';
    } else {
      const groups = [];
      const byRecipe = {};
      shop.forEach((it) => {
        const key = it.recipeId || 'custom';
        if (!byRecipe[key]) byRecipe[key] = { id: key, name: it.recipeName || 'Added by you', items: [] };
        byRecipe[key].items.push(it);
      });
      Object.keys(byRecipe).forEach((k) => groups.push(byRecipe[k]));
      groups.sort((a, b) => (a.id === 'custom' ? 1 : b.id === 'custom' ? -1 : 0));

      body.innerHTML =
        '<form class="shop-add" id="shop-add-form">' +
          '<div class="field">' +
            '<label class="sr-only" for="shop-add-input">Add your own item</label>' +
            '<input id="shop-add-input" type="text" placeholder="Add your own item&hellip;" autocomplete="off">' +
          '</div>' +
          '<button class="btn btn--sm" type="submit">Add</button>' +
        '</form>' +
        groups.map((g) =>
          '<section class="shop-group">' +
            '<div class="shop-group__head">' + icon(g.id === 'custom' ? 'plus' : 'whisk') + esc(g.name) +
              '<span class="shop-group__meta">' + g.items.length + ' item' + (g.items.length === 1 ? '' : 's') + '</span>' +
              '<button type="button" class="clear-g" data-clear-group="' + esc(g.id) + '">remove all</button>' +
            '</div>' +
            g.items.map((it) =>
              '<div class="shop-item">' +
                '<input type="checkbox" id="' + it.id + '" data-shop-item="' + it.id + '"' + (it.done ? ' checked' : '') + '>' +
                '<label class="shop-item__box" for="' + it.id + '" aria-hidden="true">' + icon('check') + '</label>' +
                '<label class="shop-item__text" for="' + it.id + '">' +
                  '<span class="shop-item__qty">' + esc(it.label) + '</span>' +
                '</label>' +
                '<button type="button" class="shop-item__del" data-del-item="' + it.id + '" aria-label="Remove ' + esc(it.label) + ' from the list">' + icon('trash') + '</button>' +
              '</div>').join('') +
          '</section>').join('');
    }

    const addForm = document.getElementById('shop-add-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('shop-add-input');
        const value = (input.value || '').trim();
        if (!value) { input.focus(); return; }
        shop.push({
          id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          recipeId: 'custom', recipeName: 'Added by you',
          key: shopKey(value, ''), n: value, u: '', q: 0, label: value, done: false
        });
        saveShop(); renderPanel();
        const again = document.getElementById('shop-add-input');
        if (again) again.focus();
        announce(value + ' added to your shopping list.');
      });
    }
  }

  function openPanel() {
    const panel = document.getElementById('shopping-panel');
    if (!panel) return;
    lastFocused = document.activeElement;
    renderPanel();
    panel.hidden = false;
    panelOpen = true;
    document.body.style.overflow = 'hidden';
    const btn = document.getElementById('cart-button');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    const first = $('#shop-add-input', panel) || $('.panel__box', panel);
    if (first) first.focus();
  }

  function closePanel() {
    const panel = document.getElementById('shopping-panel');
    if (!panel || !panelOpen) return;
    panel.hidden = true;
    panelOpen = false;
    document.body.style.overflow = '';
    const btn = document.getElementById('cart-button');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  }

  function wirePanel() {
    const panel = document.getElementById('shopping-panel');
    const cartBtn = document.getElementById('cart-button');
    if (!panel) return;

    if (cartBtn) cartBtn.addEventListener('click', () => (panelOpen ? closePanel() : openPanel()));

    panel.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-panel]')) closePanel();

      const box = e.target.closest('input[data-shop-item]');
      if (box) {
        const it = shop.find((x) => x.id === box.getAttribute('data-shop-item'));
        if (it) { it.done = box.checked; saveShop(); }
        return;
      }
      const del = e.target.closest('[data-del-item]');
      if (del) {
        const id = del.getAttribute('data-del-item');
        shop = shop.filter((x) => x.id !== id);
        saveShop(); renderPanel();
        return;
      }
      const clearG = e.target.closest('[data-clear-group]');
      if (clearG) {
        const gid = clearG.getAttribute('data-clear-group');
        shop = shop.filter((x) => (x.recipeId || 'custom') !== gid);
        saveShop(); renderPanel();
      }
    });

    const clearAll = document.getElementById('panel-clear');
    if (clearAll) {
      clearAll.addEventListener('click', () => {
        if (!shop.length) { toast('The list is already empty.'); return; }
        shop = []; saveShop(); renderPanel(); toast('Shopping list cleared.');
      });
    }

    const printList = document.getElementById('panel-print');
    if (printList) {
      printList.addEventListener('click', () => {
        const old = document.title;
        document.title = 'Shopping list — Bonny Bakes';
        document.body.classList.add('printing-list');
        const restore = () => {
          document.title = old;
          document.body.classList.remove('printing-list');
          window.removeEventListener('afterprint', restore);
        };
        window.addEventListener('afterprint', restore);
        setTimeout(() => window.print(), 80);
      });
    }

    /* Keep tab focus inside the panel while it is open */
    panel.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = $$('a[href], button:not([disabled]), input, select, textarea', panel)
        .filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelOpen) closePanel();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPanel(); }
    });
  }

  /* Favourite buttons anywhere on the page (delegated) */
  function wireFavourites() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-fav-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-fav-id');
      const name = btn.getAttribute('data-fav-name') || 'Recipe';
      const nowFav = toggleFav(id);
      btn.classList.remove('is-pop');
      void btn.offsetWidth; // restart the little pop animation
      btn.classList.add('is-pop');
      toast(nowFav ? name + ' saved to your favourites.' : name + ' removed from your favourites.', nowFav ? 'rasp' : '');
      // If we are on the favourites page, a removal should disappear from view
      if (!nowFav && /^#?\/favourites/.test(window.location.hash)) render();
    });
  }

  /* ── Browse page wiring (re-attached on every browse render) ──────────── */
  function wireBrowse() {
    const search = document.getElementById('browse-search');
    if (search) {
      search.addEventListener('input', () => {
        browse.q = search.value;
        paintBrowseResults();
        const hs = document.getElementById('header-search-input');
        if (hs) hs.value = browse.q;
      });
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
    const clear = document.getElementById('browse-clear');
    if (clear) {
      clear.addEventListener('click', () => {
        browse.q = '';
        const hs = document.getElementById('header-search-input');
        if (hs) hs.value = '';
        render();
      });
    }
    const sort = document.getElementById('browse-sort');
    if (sort) sort.addEventListener('change', () => { browse.sort = sort.value; paintBrowseResults(); });

    const favsBtn = document.getElementById('browse-favs');
    if (favsBtn) {
      favsBtn.addEventListener('click', () => {
        browse.favs = !browse.favs;
        favsBtn.setAttribute('aria-pressed', String(browse.favs));
        paintBrowseResults();
      });
    }

    $$('[data-cat]').forEach((chip) => {
      chip.addEventListener('click', () => {
        browse.cat = chip.getAttribute('data-cat');
        $$('[data-cat]').forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-cat') === browse.cat)));
        paintBrowseResults();
      });
    });

    const reset = document.getElementById('reset-filters');
    if (reset) {
      reset.addEventListener('click', () => {
        browse = { q: '', cat: '', sort: 'featured', favs: false };
        const hs = document.getElementById('header-search-input');
        if (hs) hs.value = '';
        render();
      });
    }

    paintBrowseResults();
  }


  /* ═══════════════════════════════════════════════════════════════════════
     9. ROUTING
     ═════════════════════════════════════════════════════════════════════ */

  const app = document.getElementById('app');

  function parseHash() {
    const raw = window.location.hash.replace(/^#/, '') || '/';
    const qi = raw.indexOf('?');
    const path = (qi === -1 ? raw : raw.slice(0, qi)).replace(/\/+$/, '') || '/';
    const params = new URLSearchParams(qi === -1 ? '' : raw.slice(qi + 1));
    return { path: path, params: params };
  }

  function go(path) {
    const target = '#' + path;
    if (window.location.hash === target) render();
    else window.location.hash = target;
  }

  function setActiveNav(path) {
    const match = (p) => p === '/' ? path === '/' : path === p || path.indexOf(p + '/') === 0 || path.indexOf(p + '?') === 0;
    $$('.main-nav a').forEach((a) => {
      const p = a.getAttribute('data-nav');
      a.classList.toggle('is-active', match(p));
      if (match(p)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  let firstRender = true;

  function render() {
    const { path, params } = parseHash();
    let html = '', title = 'Bonny Bakes — Simple bakes. Happy hearts.', recipe = null;

    if (path.indexOf('/recipe/') === 0) {
      recipe = findRecipe(decodeURIComponent(path.slice('/recipe/'.length)));
      if (!recipe) {
        html = '<div class="wrap">' + emptyState('We cannot find that recipe',
          'It may have been renamed or the link was not quite right. All the other bakes are still here.',
          '<a class="btn" href="#/recipes">See all recipes</a>', 'search') + '</div>';
        title = 'Recipe not found — Bonny Bakes';
      } else {
        html = viewRecipe(recipe);
        title = recipe.name + ' — Bonny Bakes';
      }
    } else if (path.indexOf('/recipes') === 0) {
      if (params.get('cat')) browse.cat = params.get('cat');
      if (params.get('q') !== null) browse.q = params.get('q');
      if (params.has('favs')) browse.favs = true;
      html = viewBrowse();
      title = 'All recipes — Bonny Bakes';
    } else if (path.indexOf('/favourites') === 0) {
      html = viewFavourites();
      title = 'My Favourites — Bonny Bakes';
    } else if (path.indexOf('/about') === 0) {
      html = viewAbout();
      title = 'About Bonny — Bonny Bakes';
    } else {
      html = viewHome();
      title = 'Bonny Bakes — Simple bakes. Happy hearts.';
    }

    app.innerHTML = html;
    document.title = title;
    setActiveNav(path);
    paintFavCounts();
    wireMediaFallbacks(app);

    if (recipe) wireRecipePage(recipe);
    if (path.indexOf('/recipes') === 0) wireBrowse();

    /* Surprise Me */
    const surprise = document.getElementById('surprise-btn');
    if (surprise) {
      surprise.addEventListener('click', () => {
        const pick = RECIPES[Math.floor(Math.random() * RECIPES.length)];
        const nameEl = document.getElementById('surprise-name');
        if (nameEl) nameEl.textContent = pick.name;
        toast('Today you are baking ' + pick.name + '!', 'leaf');
        setTimeout(() => go('/recipe/' + pick.id), 220);
      });
    }

    if (!firstRender) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const main = document.getElementById('main');
      if (main) main.focus({ preventScroll: true });
    }
    firstRender = false;
    announce(title);
  }

  window.addEventListener('hashchange', () => { if (panelOpen) closePanel(); render(); });


  /* ═══════════════════════════════════════════════════════════════════════
     10. START UP
     ═════════════════════════════════════════════════════════════════════ */

  function init() {
    /* style.css loaded? Drop the safety-net styles if so. */
    Promise.race([
      Array.prototype.some.call(document.styleSheets, (s) => (s.href || '').indexOf('style.css') > -1)
        ? Promise.resolve(true)
        : new Promise((res) => {
            const l = document.createElement('link');
            l.rel = 'stylesheet'; l.href = 'style.css';
            l.onload = () => res(true); l.onerror = () => res(false);
            document.head.appendChild(l);
          }),
      new Promise((res) => setTimeout(() => res(false), 2500))
    ]).then((ok) => { if (ok) document.documentElement.classList.remove('bb-nocss'); });
    document.documentElement.classList.add('bb-nocss');

    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    const footerCats = document.getElementById('footer-categories');
    if (footerCats) {
      footerCats.innerHTML = CATEGORIES.slice(0, 5).map((c) =>
        '<li><a href="#/recipes?cat=' + encodeURIComponent(c) + '">' + esc(c) + '</a></li>').join('');
    }

    wireNav();
    wireSearch();
    wirePanel();
    wireFavourites();
    paintFavCounts();
    paintShopCount();

    if (!window.location.hash) window.location.replace('#/');
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
