/* ============================================================================
 *  BONNY BAKES — RECIPE DATA
 *  -------------------------------------------------------------------------
 *  This is the ONLY file you need to touch to add a new recipe.
 *  Nothing else in the website is hard-coded: the cards, the search, the
 *  category filters, the scaling maths, the shopping list and the print
 *  layout are all built automatically from the objects below.
 *
 *  ┌────────────────────────────────────────────────────────────────────────┐
 *  │  ★ ★ ★   HOW TO ADD A NEW RECIPE   ★ ★ ★                             │
 *  └────────────────────────────────────────────────────────────────────────┘
 *
 *  1. Copy an existing recipe object below (everything from { to },).
 *  2. Paste it into the RECIPES list — anywhere you like, order doesn't matter.
 *  3. Give it a NEW short id in the id field, e.g. id: 'ginger-bread-men'
 *     (lowercase letters and dashes only — this becomes the web address).
 *  4. Change name, description, category, image, servings, ingredients,
 *     method, timings, temperature and tips.
 *  5. Put your photograph in the images folder using the filename you typed
 *     in the image field, e.g. images/ginger-bread-men.jpg
 *  6. Save the file and refresh the website. That's it.
 *
 *  ── FIELD GUIDE (what every line means) ──────────────────────────────────
 *
 *  id          Unique address for the recipe. Lowercase + dashes.
 *  name        Recipe title shown everywhere.
 *  description One or two friendly sentences (used on cards + in search).
 *  category    One of: 'Cakes', 'Biscuits', 'Traybakes', 'Quick & Easy',
 *              'Fruit Bakes', 'Family Favourites'   (add a new one if you
 *              like — the filter buttons are built from this list too)
 *  tags        Extra words people might search for. Optional.
 *  featured    true  = shows in "Fresh from the oven" on the home page.
 *  image       { file, alt, credit }
 *                file   = where the photo lives (images/your-photo.jpg)
 *                alt    = describe the photo for screen readers & Google
 *                credit = who took it / where it came from (or "Bonny")
 *  difficulty  'Easy' | 'Medium' | 'A bit of a project'
 *  servings    { base: 12, label: 'fairy cakes', yields: [1, 2, 4, 6, ...] }
 *                base   = how many the recipe as written makes
 *                label  = the word for one serving ("fairy cakes", "slices")
 *                yields = the quick-pick numbers in the drop-down
 *  timings     { prep, cook, note }  — minutes. Total time is worked out for
 *              you automatically, so you never have to add them up.
 *  oven        { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 }
 *  equipment   Optional list of tins/bowls needed.
 *  ingredients Each ingredient is one line, like:
 *                { q: 200, u: 'g', n: 'plain flour' }
 *                q = quantity as a plain number (200, 2.5, 0.5 ...)
 *                u = unit: 'g', 'kg', 'ml', 'tsp', 'tbsp', or '' for counts
 *                n = the ingredient name
 *              Optional extras you can add to a line:
 *                us: '1¾ cups'   → shown as a small optional US equivalent
 *                note: 'softened' → small grey note after the name
 *                fixed: true      → NEVER scaled (e.g. "1 lemon, zested")
 *                scale: false     → same as fixed
 *              Ingredients with no unit (eggs, apples, lemons...) are counted,
 *              and the site automatically adds a helpful hint when the maths
 *              gives an awkward amount such as 1½ eggs.
 *  method      Numbered steps, in order. Keep them short and friendly.
 *  tips        1–4 "Bonny's tip" lines.
 *  storage     How to keep it / how to freeze it.
 *
 *  ── MEASUREMENTS ─────────────────────────────────────────────────────────
 *  Always write UK metric as the main measurement (g, ml, tsp, tbsp, °C) and
 *  add the US equivalent in the optional us: field when it's genuinely useful.
 * ============================================================================
 */

/* global RECIPES */

window.RECIPES = [

  /* ─────────────────────────────────────────────────────────────────────────
   * 1. CLASSIC FLAPJACKS
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'classic-flapjacks',
    name: 'Classic Flapjacks',
    description: 'Golden, chewy oat bars held together with butter, sugar and golden syrup. Three ingredients of comfort, one tin, no fuss at all.',
    category: 'Traybakes',
    tags: ['oaty', 'chewy', 'afternoon tea', 'school run', 'easy'],
    featured: true,
    image: {
      file: 'images/flapjacks.jpg',
      alt: 'A tray of golden homemade flapjacks cut into squares, with a few stacked on a plate.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 16, label: 'flapjack bars', yields: [4, 8, 12, 16, 24, 32] },
    timings: { prep: 15, cook: 25, note: 'Leave to cool fully in the tin before cutting, or they will crumble.' },
    oven: { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 },
    equipment: ['20cm square tin', 'Large saucepan', 'Wooden spoon'],
    ingredients: [
      { q: 225, u: 'g', n: 'unsalted butter', note: 'plus extra for greasing' },
      { q: 225, u: 'g', n: 'light soft brown sugar' },
      { q: 4, u: 'tbsp', n: 'golden syrup' },
      { q: 350, u: 'g', n: 'porridge oats' },
      { q: 50, u: 'g', n: 'plain flour' },
      { q: 0.5, u: 'tsp', n: 'ground ginger', note: 'optional, but lovely' }
    ],
    method: [
      'Heat the oven and line the tin. Line a 20cm square tin with baking parchment, letting the paper hang over two sides so you can lift the flapjack out later. Grease any bare edges with a little butter.',
      'Melt the butter, sugar and syrup. Put the butter, brown sugar and golden syrup into a large saucepan over a gentle heat. Stir now and then until everything has melted into a smooth, glossy caramel — don\'t let it boil.',
      'Take the pan off the heat and stir in the oats, flour and ground ginger until every flake is coated and the mixture looks like wet sand.',
      'Tip into the tin and press down firmly. Use the back of a spoon to press the mixture into the corners and level the top. Pressing hard now is what stops the bars crumbling later.',
      'Bake for 25–30 minutes until the top is deep golden and the edges are just starting to pull away from the tin.',
      'Score, then leave it alone. Run a knife through to mark 16 bars while it is still warm, then leave the tin on a wire rack until completely cold. Cut all the way through once cold, then lift out using the parchment handles.'
    ],
    tips: [
      'Press the mixture down as firmly as you can — a good squash in the tin is the difference between a neat bar and a crumbly one.',
      'Stir a handful of sultanas or chopped dried apricot into the mixture for a fruity flapjack.',
      'Mark the bars while warm but don\'t cut them. Cold flapjack cuts cleanly; warm flapjack collapses.'
    ],
    storage: 'Keep in an airtight tin at room temperature for up to a week. They freeze beautifully for 3 months — separate the layers with baking parchment.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 2. FAIRY CAKES
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'fairy-cakes',
    name: 'Fairy Cakes',
    description: 'Feather-light little sponge cakes with a swirl of vanilla buttercream — the classic birthday plate and a brilliant first bake for small helpers.',
    category: 'Cakes',
    tags: ['cupcakes', 'birthday', 'children', 'buttercream', 'vanilla'],
    featured: true,
    image: {
      file: 'images/fairy-cakes.jpg',
      alt: 'A plate of small vanilla fairy cakes topped with pale pink buttercream and sprinkles.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 12, label: 'fairy cakes', yields: [1, 2, 4, 6, 8, 12, 18, 24] },
    timings: { prep: 20, cook: 18, note: 'Cool completely before icing, or the buttercream will melt.' },
    oven: { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 },
    equipment: ['12-hole fairy cake tin', 'Paper cases', 'Electric whisk or wooden spoon'],
    ingredients: [
      { q: 200, u: 'g', n: 'unsalted butter', note: 'very soft', us: '7 oz' },
      { q: 200, u: 'g', n: 'caster sugar', us: 'scant 1 cup' },
      { q: 4, u: '', n: 'medium eggs', note: 'at room temperature' },
      { q: 200, u: 'g', n: 'self-raising flour', us: '1⅔ cups' },
      { q: 1, u: 'tsp', n: 'baking powder' },
      { q: 2, u: 'tsp', n: 'vanilla extract' },
      { q: 2, u: 'tbsp', n: 'whole milk' },
      { q: 150, u: 'g', n: 'softened butter', note: 'for the buttercream' },
      { q: 300, u: 'g', n: 'icing sugar', note: 'sifted, for the buttercream' },
      { q: 1, u: 'tsp', n: 'vanilla extract', note: 'for the buttercream' },
      { q: 1, u: 'tbsp', n: 'whole milk', note: 'for the buttercream' }
    ],
    method: [
      'Heat the oven to 180°C / 160°C fan / gas 4 and line a 12-hole tin with paper cases.',
      'Cream the butter and sugar together in a large bowl for 3–4 minutes, until the mixture is very pale, fluffy and almost white. This is the step that makes them light, so be patient.',
      'Beat in the eggs one at a time, adding a spoonful of the flour with each one to stop the mixture curdling.',
      'Sift in the flour and baking powder, add the vanilla and milk, then fold together gently with a big metal spoon or spatula until just combined. Stop as soon as the flour disappears.',
      'Divide the mixture between the cases — a dessertspoon in each is about right — and smooth the tops slightly.',
      'Bake for 16–18 minutes until risen, golden and springy to a gentle press. Leave for 5 minutes in the tin, then move to a wire rack to cool completely.',
      'Make the buttercream: beat the softened butter until creamy, then gradually beat in the sifted icing sugar, vanilla and milk until pale and fluffy.',
      'Spoon or pipe the buttercream onto the cold cakes and finish with sprinkles if you like.'
    ],
    tips: [
      'Don\'t overmix the batter once the flour goes in, or your cakes can turn out heavy and tight.',
      'All your ingredients should be at room temperature — cold eggs are the usual reason a mixture splits.',
      'For a classic fairy cake, slice a thin disc off the top of each cake, cut the disc in half and perch the two "wings" in a small swirl of buttercream.'
    ],
    storage: 'Un-iced cakes keep 3 days in an airtight tin. Iced cakes are best eaten within 2 days. Both freeze well for 3 months (freeze the icing separately).'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 3. RASPBERRY THUMBPRINTS
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'raspberry-thumbprints',
    name: 'Raspberry Thumbprints',
    description: 'Buttery melting shortbread biscuits with a jam-filled dip in the middle. Pretty enough for a plate, simple enough for a rainy afternoon.',
    category: 'Biscuits',
    tags: ['shortbread', 'jam', 'raspberry', 'teatime', 'gift'],
    featured: true,
    image: {
      file: 'images/raspberry-thumbprints.jpg',
      alt: 'Pale shortbread thumbprint biscuits filled with bright raspberry jam, arranged on a plate.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 18, label: 'biscuits', yields: [6, 9, 12, 18, 24, 36] },
    timings: { prep: 25, cook: 14, note: 'Includes 30 minutes chilling time for the dough.' },
    oven: { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 },
    equipment: ['2 baking trays', 'Baking parchment', 'Handle of a wooden spoon'],
    ingredients: [
      { q: 175, u: 'g', n: 'unsalted butter', note: 'softened' },
      { q: 100, u: 'g', n: 'caster sugar' },
      { q: 1, u: 'tsp', n: 'vanilla extract' },
      { q: 275, u: 'g', n: 'plain flour', us: '2¼ cups' },
      { q: 0.25, u: 'tsp', n: 'fine salt' },
      { q: 150, u: 'g', n: 'raspberry jam', note: 'good quality, no big seeds' },
      { q: 1, u: 'tbsp', n: 'icing sugar', note: 'for dusting' }
    ],
    method: [
      'Beat the softened butter and caster sugar together until pale and creamy — about 2 minutes with a wooden spoon or whisk. Beat in the vanilla.',
      'Sift in the flour and salt and mix until the dough just comes together in soft clumps. It will look crumbly at first, then suddenly pull together. Don\'t add extra flour.',
      'Bring the dough into a ball, flatten it into a disc, wrap and chill in the fridge for 30 minutes. Cold dough keeps its shape in the oven.',
      'Heat the oven to 180°C / 160°C fan / gas 4 and line two baking trays with parchment.',
      'Roll the dough into small balls, about the size of a walnut, and space them well apart on the trays — they spread a little.',
      'Press a deep dip into the middle of each ball using your thumb or the handle of a wooden spoon. Go almost to the tray; the well shrinks slightly as it bakes.',
      'Bake for 12–14 minutes until the biscuits are set and the edges are barely golden. Leave on the tray for 5 minutes, then cool on a rack.',
      'Spoon a little jam into each dip (warming the jam makes it pour easily) and dust with icing sugar once cool.'
    ],
    tips: [
      'Chilling really matters — skip it and your biscuits will spread into flat puddles.',
      'Swap the vanilla for the finely grated zest of half a lemon for a brighter biscuit.',
      'Fill them after baking, not before. Jam added before the oven tends to bubble over and burn at the edges.'
    ],
    storage: 'Keep in an airtight tin for up to a week with parchment between the layers. Unfilled biscuits freeze well for 3 months.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 4. VICTORIA SPONGE
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'victoria-sponge',
    name: 'Victoria Sponge',
    description: 'The queen of British bakes: two light vanilla sponges sandwiched with raspberry jam and a snowfall of icing sugar.',
    category: 'Cakes',
    tags: ['classic', 'afternoon tea', 'jam', 'celebration', 'sponge'],
    featured: true,
    image: {
      file: 'images/victoria-sponge.jpg',
      alt: 'A Victoria sponge cake dusted with icing sugar, one wedge lifted to show the jam-filled middle.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 8, label: 'slices', yields: [4, 8, 12, 16] },
    timings: { prep: 20, cook: 25, note: 'Cool the sponges completely before sandwiching.' },
    oven: { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 },
    equipment: ['Two 20cm sandwich tins', 'Wire rack', 'Sieve'],
    ingredients: [
      { q: 200, u: 'g', n: 'unsalted butter', note: 'very soft, plus extra for the tins' },
      { q: 200, u: 'g', n: 'caster sugar' },
      { q: 4, u: '', n: 'medium eggs' },
      { q: 1, u: 'tsp', n: 'vanilla extract' },
      { q: 200, u: 'g', n: 'self-raising flour' },
      { q: 2, u: 'tbsp', n: 'whole milk' },
      { q: 150, u: 'g', n: 'raspberry jam', note: 'or strawberry' },
      { q: 2, u: 'tbsp', n: 'icing sugar', note: 'for dusting' }
    ],
    method: [
      'Heat the oven to 180°C / 160°C fan / gas 4. Butter two 20cm sandwich tins and line the bases with baking parchment.',
      'Cream the butter and sugar together for 3–4 minutes until very pale and fluffy. Scrape down the sides halfway through.',
      'Beat in the eggs one at a time with the vanilla, adding a spoonful of the flour with each egg to keep the mixture smooth.',
      'Sift in the remaining flour and fold in gently with a spatula, then fold in the milk. The batter should fall reluctantly off a spoon.',
      'Divide the mixture between the tins and level the tops, dipping the middle slightly so the cakes rise evenly.',
      'Bake for 22–25 minutes until golden and a skewer pushed into the centre comes out clean.',
      'Leave in the tins for 5 minutes, then turn out, peel off the parchment and cool completely on a wire rack.',
      'Sandwich the cold sponges with the jam, dust the top generously with sifted icing sugar and serve.'
    ],
    tips: [
      'Weigh the eggs in their shells and match the butter, sugar and flour to that weight for the lightest sponge.',
      'A traditional Victoria is jam only — but a thin layer of whipped cream or buttercream is very welcome.',
      'If the tops dome, trim them level with a serrated knife and put the trimmings underneath.'
    ],
    storage: 'Best eaten the day it is made. Keeps 2–3 days in a cake tin at room temperature. The plain sponges freeze well for 3 months.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 5. CHOCOLATE BROWNIES
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'chocolate-brownies',
    name: 'Chocolate Brownies',
    description: 'Dark, fudgy and properly squidgy in the middle with a shiny crackled top. One bowl, one tin, and no excuse not to make them.',
    category: 'Traybakes',
    tags: ['chocolate', 'fudgy', 'gooey', 'kids', 'party'],
    featured: false,
    image: {
      file: 'images/chocolate-brownies.jpg',
      alt: 'Squares of fudgy chocolate brownie with a crackled shiny top, stacked on a wooden board.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 16, label: 'brownies', yields: [8, 12, 16, 24] },
    timings: { prep: 20, cook: 35, note: 'Cool completely in the tin — they firm up as they cool.' },
    oven: { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 },
    equipment: ['20cm square tin', 'Heatproof bowl', 'Saucepan for melting'],
    ingredients: [
      { q: 200, u: 'g', n: 'dark chocolate', note: '70% cocoa, chopped' },
      { q: 100, u: 'g', n: 'milk chocolate', note: 'chopped' },
      { q: 200, u: 'g', n: 'unsalted butter', us: '7 oz' },
      { q: 200, u: 'g', n: 'light soft brown sugar' },
      { q: 100, u: 'g', n: 'caster sugar' },
      { q: 3, u: '', n: 'large eggs' },
      { q: 1, u: 'tsp', n: 'vanilla extract' },
      { q: 100, u: 'g', n: 'plain flour' },
      { q: 25, u: 'g', n: 'cocoa powder', note: 'sifted' },
      { q: 0.25, u: 'tsp', n: 'fine salt' }
    ],
    method: [
      'Heat the oven to 180°C / 160°C fan / gas 4 and line a 20cm square tin with baking parchment, leaving an overhang on two sides.',
      'Melt the dark chocolate, milk chocolate and butter together in a heatproof bowl over a pan of barely simmering water, stirring until smooth. Let it cool for 10 minutes — it should be warm, not hot.',
      'Whisk the sugars into the chocolate, then beat in the eggs one at a time with the vanilla until the mixture is glossy and thick.',
      'Sift in the flour, cocoa and salt and fold together gently with a spatula until no white streaks remain. Don\'t overwork it or the brownies will be cakey.',
      'Pour into the tin, level the top and give the tin one firm tap on the worktop to settle the batter.',
      'Bake for 30–35 minutes. The edges should be firm and the middle should still have a gentle wobble — that wobble is your fudge.',
      'Cool completely in the tin, then lift out with the parchment and cut into 16 squares with a sharp knife wiped clean between cuts.'
    ],
    tips: [
      'Slightly under-baked is exactly right. If a skewer comes out clean, they will be more cake than brownie.',
      'Use good-quality dark chocolate — it is doing most of the work here.',
      'A hot knife wiped between cuts gives you clean, bakery-neat squares.'
    ],
    storage: 'Keep in an airtight tin at room temperature for 4–5 days. Freeze for up to 3 months; 10 seconds in the microwave brings back the fudge.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 6. LEMON DRIZZLE CAKE
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'lemon-drizzle-cake',
    name: 'Lemon Drizzle Cake',
    description: 'A buttery loaf soaked while still warm with sharp lemon syrup, then finished with a crunchy sugar crust. Bright, sticky and impossible to eat just one slice.',
    category: 'Cakes',
    tags: ['lemon', 'citrus', 'loaf', 'zesty', 'teatime'],
    featured: false,
    image: {
      file: 'images/lemon-drizzle-cake.jpg',
      alt: 'A lemon drizzle loaf cake with a crackled sugary top, sliced on a cake stand.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 10, label: 'slices', yields: [5, 10, 15, 20] },
    timings: { prep: 15, cook: 50, note: 'Pour the drizzle over while the cake is still hot.' },
    oven: { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 },
    equipment: ['900g (2lb) loaf tin', 'Skewer', 'Wire rack over a tray'],
    ingredients: [
      { q: 225, u: 'g', n: 'unsalted butter', note: 'very soft, plus extra for the tin' },
      { q: 225, u: 'g', n: 'caster sugar' },
      { q: 4, u: '', n: 'medium eggs' },
      { q: 2, u: '', n: 'lemons', note: 'finely grated zest of', fixed: true },
      { q: 225, u: 'g', n: 'self-raising flour' },
      { q: 2, u: 'tbsp', n: 'whole milk' },
      { q: 75, u: 'g', n: 'caster sugar', note: 'for the drizzle' },
      { q: 2, u: '', n: 'lemons', note: 'juice of, for the drizzle', fixed: true },
      { q: 1, u: 'tbsp', n: 'demerara sugar', note: 'optional, for a crunchy top' }
    ],
    method: [
      'Heat the oven to 180°C / 160°C fan / gas 4. Butter a 900g loaf tin and line it with baking parchment.',
      'Beat the butter, sugar and lemon zest together until very pale and fluffy — a good 3–4 minutes.',
      'Beat in the eggs one at a time, adding a spoonful of flour with each one.',
      'Fold in the remaining flour with the milk until smooth, then spoon into the tin and level the top.',
      'Bake for 45–50 minutes until risen, golden and a skewer comes out clean.',
      'While the cake bakes, stir the lemon juice into the drizzle sugar until it dissolves into a thin syrup.',
      'The moment the cake comes out of the oven, prick it all over with a skewer and pour the syrup slowly over the top, letting it soak in. Sprinkle the demerara over the top.',
      'Leave the cake in the tin until completely cold, then lift out and slice.'
    ],
    tips: [
      'Pour the drizzle while the cake is piping hot and prick it first — that is what makes it moist right through instead of soggy on top.',
      'Roll the lemons on the worktop and warm them slightly before juicing and you will get far more juice.',
      'Set the tin on a tray: some syrup always escapes, and you want it back on the cake, not in the oven.'
    ],
    storage: 'Keeps 4–5 days in an airtight tin — it is often better on day two. Freezes well for 3 months, wrapped twice.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 7. CHOCOLATE CHIP COOKIES
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'chocolate-chip-cookies',
    name: 'Chocolate Chip Cookies',
    description: 'Crisp golden edges, a soft chewy centre and pools of melted chocolate. Best eaten warm, standing at the kitchen counter.',
    category: 'Biscuits',
    tags: ['chocolate', 'cookies', 'chewy', 'kids', 'freezer dough'],
    featured: false,
    image: {
      file: 'images/chocolate-chip-cookies.jpg',
      alt: 'A stack of golden chocolate chip cookies with melted chocolate chunks, on a cooling rack.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 20, label: 'cookies', yields: [10, 15, 20, 30, 40] },
    timings: { prep: 20, cook: 12, note: 'Chill the dough for 30 minutes if you have time — it stops them spreading too much.' },
    oven: { fan: 170, conventional: 190, gas: 5, fahrenheit: 375 },
    equipment: ['2 baking trays', 'Baking parchment', 'Ice-cream scoop or dessertspoon'],
    ingredients: [
      { q: 200, u: 'g', n: 'unsalted butter', note: 'softened' },
      { q: 150, u: 'g', n: 'light soft brown sugar' },
      { q: 100, u: 'g', n: 'caster sugar' },
      { q: 1, u: '', n: 'large egg' },
      { q: 2, u: 'tsp', n: 'vanilla extract' },
      { q: 300, u: 'g', n: 'plain flour', us: '2½ cups' },
      { q: 1, u: 'tsp', n: 'bicarbonate of soda' },
      { q: 0.5, u: 'tsp', n: 'fine salt' },
      { q: 200, u: 'g', n: 'dark chocolate', note: 'chopped into chunks, or chips' }
    ],
    method: [
      'Heat the oven to 190°C / 170°C fan / gas 5 and line two large baking trays with parchment.',
      'Beat the butter with both sugars until pale, soft and creamy — about 2–3 minutes.',
      'Beat in the egg and vanilla until fully combined.',
      'Sift in the flour, bicarbonate of soda and salt, then mix on a low speed (or with a spoon) until the dough just comes together. A few floury streaks are fine.',
      'Stir in the chocolate chunks, then roll the dough into balls about the size of a golf ball.',
      'Place the balls well apart on the trays — no more than 8 per tray, as they spread a lot. Press each one down very slightly.',
      'Bake for 10–12 minutes until the edges are set and golden but the middles still look slightly soft and underdone.',
      'Leave on the tray for 5 minutes to firm up, then slide onto a rack. They finish cooking on the tray — resist the urge to bake them longer.'
    ],
    tips: [
      'Take them out while they still look a touch underdone. They set as they cool and stay gloriously chewy.',
      'Roll extra dough balls and freeze them raw — you can bake straight from frozen, adding 2 minutes.',
      'Chilling the dough for 30 minutes (or overnight) gives a deeper flavour and a thicker cookie.'
    ],
    storage: 'Keep in an airtight tin for up to 5 days with a slice of bread in the tin to keep them soft. Raw dough balls freeze for 3 months.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 8. APPLE CRUMBLE
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'apple-crumble',
    name: 'Apple Crumble',
    description: 'Soft spiced apples under a buttery, oaty, craggy crumble topping. The definitive Sunday pudding — just add custard.',
    category: 'Fruit Bakes',
    tags: ['apple', 'pudding', 'custard', 'sunday', 'comfort'],
    featured: false,
    image: {
      file: 'images/apple-crumble.jpg',
      alt: 'A dish of apple crumble with a golden oat topping, with custard being poured over a serving.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 6, label: 'servings', yields: [2, 4, 6, 8, 12] },
    timings: { prep: 20, cook: 45, note: 'Serve warm, within 2 hours of baking, for the best crumble.' },
    oven: { fan: 180, conventional: 200, gas: 6, fahrenheit: 400 },
    equipment: ['2 litre baking dish (about 25cm)', 'Large mixing bowl'],
    ingredients: [
      { q: 900, u: 'g', n: 'cooking apples', note: 'Bramleys are ideal — peeled, cored and sliced', us: 'about 4–5 apples' },
      { q: 50, u: 'g', n: 'caster sugar', note: 'for the apples' },
      { q: 1, u: '', n: 'lemon', note: 'juice of', fixed: true },
      { q: 0.5, u: 'tsp', n: 'ground cinnamon' },
      { q: 1, u: 'tbsp', n: 'plain flour' },
      { q: 175, u: 'g', n: 'plain flour', note: 'for the topping' },
      { q: 100, u: 'g', n: 'cold unsalted butter', note: 'cubed, for the topping' },
      { q: 100, u: 'g', n: 'demerara sugar', note: 'for the topping' },
      { q: 75, u: 'g', n: 'porridge oats', note: 'for the topping' }
    ],
    method: [
      'Heat the oven to 200°C / 180°C fan / gas 6.',
      'Peel, core and slice the apples into chunky pieces about 1cm thick, then toss them in the baking dish with the sugar, lemon juice, cinnamon and flour.',
      'Make the crumble: put the flour and cold cubed butter into a large bowl and rub together with your fingertips until it looks like coarse breadcrumbs. A few pea-sized lumps of butter are good — they make it crisp.',
      'Stir in the demerara sugar and oats.',
      'Pile the crumble over the apples in an even layer, right to the edges, and don\'t press it down. Rough peaks catch the heat and go properly crunchy.',
      'Put the dish on a baking tray (juice bubbles over) and bake for 40–45 minutes until the topping is deep golden and the fruit is bubbling up at the edges.',
      'Leave for 5 minutes to settle, then serve warm with custard, cream or vanilla ice cream.'
    ],
    tips: [
      'Keep the butter cold and rub it in quickly with just your fingertips — warm hands make a pasty, heavy topping.',
      'Toss the apples with a spoonful of flour so the filling thickens instead of turning watery.',
      'Swap a third of the apples for blackberries or rhubarb for a lovely sharp contrast.'
    ],
    storage: 'Best eaten the day it is made. Keeps 3 days in the fridge, covered; reheat at 180°C for 15 minutes. Freezes well for 3 months — bake from frozen, covered, for 45 minutes.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 9. JAM TARTS
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'jam-tarts',
    name: 'Jam Tarts',
    description: 'Flaky shortcrust pastry cases filled with shiny jam — the tins-out-on-a-Sunday classic and a wonderful bake to make with children.',
    category: 'Quick & Easy',
    tags: ['pastry', 'jam', 'children', 'baking tray', 'school'],
    featured: false,
    image: {
      file: 'images/jam-tarts.jpg',
      alt: 'Fluted jam tarts filled with red jam on a wire cooling rack, dusted lightly with icing sugar.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 12, label: 'tarts', yields: [6, 12, 18, 24] },
    timings: { prep: 25, cook: 15, note: 'Includes 20 minutes chilling time for the pastry.' },
    oven: { fan: 180, conventional: 200, gas: 6, fahrenheit: 400 },
    equipment: ['12-hole shallow tart tin', '7.5cm fluted cutter', 'Rolling pin'],
    ingredients: [
      { q: 300, u: 'g', n: 'plain flour', note: 'plus extra for dusting' },
      { q: 175, u: 'g', n: 'cold unsalted butter', note: 'cubed' },
      { q: 50, u: 'g', n: 'caster sugar' },
      { q: 1, u: '', n: 'large egg', note: 'beaten, to bind' },
      { q: 2, u: 'tbsp', n: 'cold water', note: 'only if needed' },
      { q: 200, u: 'g', n: 'raspberry or strawberry jam' },
      { q: 1, u: 'tbsp', n: 'icing sugar', note: 'optional, for dusting' }
    ],
    method: [
      'Make the pastry: rub the flour and cold butter together with your fingertips until it looks like fine breadcrumbs, then stir in the sugar.',
      'Add the beaten egg and bring the dough together with a round-bladed knife. Only add a teaspoon of cold water at a time if it is still too dry.',
      'Knead very briefly into a smooth ball, wrap and chill for 20 minutes. Pastry that has rested shrinks far less in the oven.',
      'Heat the oven to 200°C / 180°C fan / gas 6.',
      'Roll the pastry out on a floured surface to about 3mm thick — roughly the thickness of two £1 coins.',
      'Cut out 12 rounds with the fluted cutter and press them gently into the tart tin holes. Prick each base twice with a fork.',
      'Spoon a good teaspoon of jam into each case, filling about half full — it bubbles up as it bakes.',
      'Bake for 12–15 minutes until the pastry is pale gold and the jam is bubbling. Cool in the tin for 10 minutes, then lift out onto a rack and dust with icing sugar if you like.'
    ],
    tips: [
      'Cold butter, cold hands, quick fingers. Work the pastry as little as possible and it will be short and flaky.',
      'Brush the pastry bases with a little beaten egg white before adding the jam to keep the bottoms crisp.',
      'Use a good-quality jam with plenty of fruit in it — it makes a real difference to the finished tart.'
    ],
    storage: 'Keep in an airtight tin for 3–4 days. Unbaked pastry freezes for 3 months; bring back to room temperature before rolling.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 10. ROCK CAKES
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'rock-cakes',
    name: 'Rock Cakes',
    description: 'Rough, craggy little fruit bakes with a crisp outside and a soft, sweet middle. Ready in half an hour from opening the cupboard.',
    category: 'Quick & Easy',
    tags: ['fruit', 'sultanas', 'old fashioned', 'tea', 'thirty minutes'],
    featured: false,
    image: {
      file: 'images/rock-cakes.jpg',
      alt: 'Rough craggy rock cakes studded with sultanas, cooling on a wire rack beside a cup of tea.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 10, label: 'rock cakes', yields: [5, 10, 15, 20] },
    timings: { prep: 15, cook: 17, note: 'Scoop them rough — that is what makes them rocky.' },
    oven: { fan: 180, conventional: 200, gas: 6, fahrenheit: 400 },
    equipment: ['2 baking trays', 'Two dessertspoons'],
    ingredients: [
      { q: 225, u: 'g', n: 'self-raising flour' },
      { q: 100, u: 'g', n: 'cold unsalted butter', note: 'cubed' },
      { q: 100, u: 'g', n: 'light soft brown sugar' },
      { q: 100, u: 'g', n: 'sultanas' },
      { q: 0.5, u: 'tsp', n: 'ground mixed spice' },
      { q: 1, u: '', n: 'large egg', note: 'beaten' },
      { q: 2, u: 'tbsp', n: 'whole milk' },
      { q: 1, u: 'tsp', n: 'vanilla extract' }
    ],
    method: [
      'Heat the oven to 200°C / 180°C fan / gas 6 and line two baking trays with parchment.',
      'Rub the flour and cold butter together with your fingertips until the mixture looks like coarse breadcrumbs.',
      'Stir in the sugar, sultanas and mixed spice.',
      'Make a well in the middle, pour in the beaten egg, milk and vanilla, and mix with a knife or wooden spoon until you have a stiff, lumpy dough that holds together.',
      'Using two dessertspoons, scoop rough heaps onto the trays, leaving plenty of room between them. Keep the heaps tall and craggy — do not smooth them.',
      'Bake for 15–18 minutes until risen, golden and firm to a light touch.',
      'Cool on a wire rack. Lovely warm with butter, just as nice cold the next day.'
    ],
    tips: [
      'Do not overwork or smooth the dough. The rough, rocky surface is the whole point.',
      'Soak the sultanas in a little hot tea for 10 minutes first if you like them plumper and juicier.',
      'Swap the sultanas for currants, glace cherries or chocolate chips — rock cakes are very forgiving.'
    ],
    storage: 'Best eaten the day they are made, but keep 2–3 days in an airtight tin. Split and toast them if they go a little dry.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 11. BUTTERMILK-FREE SCONES  (BONUS RECIPE)
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'afternoon-tea-scones',
    name: 'Afternoon Tea Scones',
    description: 'Tall, tender scones made with nothing more than flour, butter and milk — split, jam first or cream first, your business.',
    category: 'Quick & Easy',
    tags: ['scones', 'afternoon tea', 'cream tea', 'jam', 'cream'],
    featured: false,
    image: {
      file: 'images/afternoon-tea-scones.jpg',
      alt: 'Golden scones on a stand, one split open with strawberry jam and clotted cream, beside a pot of tea.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 8, label: 'scones', yields: [4, 8, 12, 16] },
    timings: { prep: 15, cook: 13, note: 'Handle the dough as little as possible for tall, light scones.' },
    oven: { fan: 200, conventional: 220, gas: 7, fahrenheit: 425 },
    equipment: ['5cm round cutter', 'Baking tray'],
    ingredients: [
      { q: 350, u: 'g', n: 'self-raising flour', note: 'plus extra for dusting' },
      { q: 1, u: 'tsp', n: 'baking powder' },
      { q: 85, u: 'g', n: 'cold unsalted butter', note: 'cubed' },
      { q: 3, u: 'tbsp', n: 'caster sugar' },
      { q: 175, u: 'ml', n: 'whole milk', us: '⅔ cup + 1 tbsp' },
      { q: 1, u: 'tsp', n: 'vanilla extract' },
      { q: 1, u: '', n: 'medium egg', note: 'beaten, to glaze — optional' },
      { q: 200, u: 'g', n: 'strawberry jam', note: 'to serve', fixed: true },
      { q: 200, u: 'ml', n: 'clotted cream', note: 'to serve', fixed: true }
    ],
    method: [
      'Heat the oven to 220°C / 200°C fan / gas 7 and put a baking tray in to get hot.',
      'Sift the flour and baking powder into a large bowl, add the cold cubed butter and rub in quickly with your fingertips until it looks like fine breadcrumbs.',
      'Stir in the sugar.',
      'Warm the milk very slightly in a pan or jug (just tepid, not hot), stir in the vanilla, then pour into the dry ingredients.',
      'Bring the dough together with a round-bladed knife, then tip out and pat gently to about 3–4cm thick. Do not knead it.',
      'Cut straight down with the cutter — press, don\'t twist. Twisting seals the edge and stops them rising. Gather the trimmings, pat out and cut again.',
      'Place on the hot tray, brush the tops with beaten egg or a little milk, and bake for 12–14 minutes until risen and golden.',
      'Cool slightly on a rack and serve warm, split open, with jam and clotted cream.'
    ],
    tips: [
      'Push the cutter straight down and lift it straight up. A twisted cut seals the sides and gives you squat scones.',
      'Handle the dough as little as possible — every extra squeeze is a slightly tougher scone.',
      'A hot tray in the oven gives the scones a lift the moment they go in.'
    ],
    storage: 'Honestly best eaten the same day. Once cold, split and freeze for up to 2 months, then straight into a hot oven for 8 minutes.'
  },

  /* ─────────────────────────────────────────────────────────────────────────
   * 12. BANANA BREAD  (BONUS RECIPE)
   * ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'banana-bread',
    name: 'Bonny\'s Banana Bread',
    description: 'The loaf that rescues every forgotten fruit bowl: dark, moist, faintly spiced and better on day two than day one.',
    category: 'Family Favourites',
    tags: ['banana', 'loaf', 'leftovers', 'breakfast', 'freezer'],
    featured: false,
    image: {
      file: 'images/banana-bread.jpg',
      alt: 'A sliced loaf of moist banana bread with a crackled top on a wooden board.',
      credit: 'Bonny Bakes'
    },
    difficulty: 'Easy',
    servings: { base: 10, label: 'slices', yields: [5, 10, 15, 20] },
    timings: { prep: 15, cook: 55, note: 'Test with a skewer — a few moist crumbs are perfect, wet batter is not.' },
    oven: { fan: 160, conventional: 180, gas: 4, fahrenheit: 350 },
    equipment: ['900g (2lb) loaf tin', 'Fork for mashing'],
    ingredients: [
      { q: 3, u: '', n: 'very ripe bananas', note: 'peeled weight about 350g' },
      { q: 100, u: 'g', n: 'unsalted butter', note: 'melted and cooled' },
      { q: 150, u: 'g', n: 'light soft brown sugar' },
      { q: 1, u: '', n: 'large egg', note: 'beaten' },
      { q: 1, u: 'tsp', n: 'vanilla extract' },
      { q: 225, u: 'g', n: 'plain flour' },
      { q: 1, u: 'tsp', n: 'bicarbonate of soda' },
      { q: 0.5, u: 'tsp', n: 'ground cinnamon' },
      { q: 0.25, u: 'tsp', n: 'fine salt' },
      { q: 50, u: 'g', n: 'walnuts or chocolate chips', note: 'optional' }
    ],
    method: [
      'Heat the oven to 180°C / 160°C fan / gas 4. Line a 900g loaf tin with baking parchment.',
      'Mash the bananas in a large bowl with a fork until mostly smooth — a few small lumps are fine and give nice pockets of flavour.',
      'Stir in the melted butter, sugar, beaten egg and vanilla.',
      'Sift in the flour, bicarbonate of soda, cinnamon and salt, then fold together gently until just combined. Stop while it still looks slightly streaky.',
      'Fold in the walnuts or chocolate chips if using.',
      'Spoon into the tin, level the top and draw a line down the middle with the back of a spoon — it helps the loaf split neatly.',
      'Bake for 50–55 minutes until risen, dark golden and a skewer comes out with a few moist crumbs on it.',
      'Leave in the tin for 10 minutes, then lift out onto a wire rack and cool completely before slicing.'
    ],
    tips: [
      'The blacker the bananas, the better the bread. Freeze overripe ones and thaw before mashing.',
      'Melted butter (not creamed) is what makes this loaf dense and moist rather than cakey.',
      'Wrap it up after a day — banana bread genuinely improves on day two.'
    ],
    storage: 'Keeps 4–5 days wrapped in foil or in a tin. Slice it and freeze for 3 months — one slice toasts up perfectly.'
  }

  /* ─────────────────────────────────────────────────────────────────────────
   *  ★ PASTE NEW RECIPES ABOVE THIS LINE — remember the comma after the
   *    closing brace of the previous recipe, e.g.  },
   * ─────────────────────────────────────────────────────────────────────── */
];

/* The order recipes appear in the "All recipes" list.
   Add any new category name here; anything missing is added automatically. */
window.BONNY_CATEGORIES = [
  'Cakes',
  'Biscuits',
  'Traybakes',
  'Quick & Easy',
  'Fruit Bakes',
  'Family Favourites'
];
