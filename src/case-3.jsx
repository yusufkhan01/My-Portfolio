import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import { createRoot } from "react-dom/client";

/*
  DetailPro Garage — SEG3125 Assignment 4 (Case 3)
  ================================================================
  A high-fidelity e-commerce prototype for a car-care store. It sells
  detailing products (shampoos, waxes, ceramic sprays, etc.) and gift
  cards. There is no backend: product data lives in this file and all
  cart/checkout state is held in React state + Context (cart is also
  mirrored to localStorage so the badge survives refreshes).

  Everything is one bundled file (same pattern as case-1/case-2), split
  into clearly labelled sections and small components:
    1. DATA        -> categories, use-cases, and the product catalogue
    2. HELPERS     -> price/format/validation utilities
    3. CONTEXTS    -> CartContext (cart ops) + AppContext (nav + toasts)
    4. UI ATOMS    -> StarRating, StockBadge, QtyStepper, Toasts
    5. LAYOUT      -> PromoBar, Navbar (live cart badge), Footer
    6. CATALOGUE   -> ProductCard, ProductGrid, Filters (faceted search)
    7. PAGES       -> Home, Products, Details, Cart, Checkout,
                      Confirmation, Survey, About/Contact (+ FAQ)
    8. APP         -> hash "router" (view state) that ties it together

  Navigation uses a lightweight hash router (no react-router) so it works
  as a static file on GitHub Pages and supports the browser Back button.

  --- Where the assignment requirements show up -------------------------
  * Faceted search .......... Filters + search + sort + clear + count (Products)
  * Shopping cart ........... CartContext, live navbar badge, Cart page
  * Checkout flow ........... CheckoutStepper + validated multi-step form
  * Survey .................. SurveyPage (rating, likes, improve, recommend)
  * 3 communication goals ... incite (PromoBar/CTAs/sale badges),
                              inform (product cards + detail pages),
                              engage (survey + confirmation copy)
  * 10 Nielsen heuristics ... noted inline next to the feature that shows it
*/

// ===========================================================================
// 1. DATA
// ===========================================================================

// Use-case facets (H: match the real world — how drivers actually shop).
const USE_CASES = [
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "wheels", label: "Wheels & Tires" },
  { id: "protection", label: "Protection" },
  { id: "gift", label: "Gifts" },
];

// Category metadata drives the Home tiles and the Products filter.
const CATEGORY_META = [
  { name: "Car shampoo", icon: "🫧", blurb: "Suds that lift grime safely" },
  { name: "Wax", icon: "✨", blurb: "Deep gloss and protection" },
  { name: "Ceramic spray", icon: "🛡️", blurb: "Months of slick protection" },
  { name: "Tire shine", icon: "🛞", blurb: "Rich, long-lasting black" },
  { name: "Interior cleaner", icon: "🧽", blurb: "Fresh, spotless cabins" },
  { name: "Microfiber towels", icon: "🧻", blurb: "Scratch-free drying & buffing" },
  { name: "Detailing kits", icon: "📦", blurb: "Everything in one box" },
  { name: "Pressure washer accessories", icon: "💦", blurb: "Foam cannons & nozzles" },
  { name: "Gift cards", icon: "🎁", blurb: "Give the gift of a clean car" },
];

// Product photography — every image is a verified Unsplash photo that
// clearly shows CAR detailing (wash, wax, wheels, interior, pressure wash,
// microfiber on paint, etc.). No household cleaners or unrelated stock.
const PRODUCT_PHOTOS = {
  // Wash & shampoo
  foamOnCar: "1769641156607-16833781bc16",      // thick foam covering car
  spongeWash: "1694678505383-676d78ea3b96",     // hand-washing with sponge
  washBucket: "1575844611398-2a68400b437c",     // bucket wash at home
  thickFoam: "1608506375591-b90e1f955e4b",      // foam cannon / suds
  washAction: "1694025893767-9a212606fbc5",     // washing car panels

  // Wax & paint protection
  waxOnHood: "1632823469850-2f77dd9c7f93",      // applying wax to hood
  carWax: "1607860115477-7b3700e055b6",         // wax / polish on car
  paintSeal: "1589750602846-60028879da9b",      // coated glossy paint

  // Ceramic spray & coating
  ceramicShine: "1619255566224-fca5ef4ca1be",   // ceramic-coated car
  ceramicPrep: "1708805282676-0c15476eb8a2",     // coating application
  ceramicBeads: "1708805282695-ef186db20192",    // hydrophobic finish
  glossyCar: "1518306727298-4c17e1bf6942",       // deep gloss paint

  // Wheels & tires
  alloyWheel: "1565381169814-50def2eb0387",      // alloy wheel close-up
  wheelRim: "1598453527201-a9b82a34f7d9",       // wheel / rim detail
  wheelFoam: "1627503292253-dd54564d3b28",      // wheel being cleaned
  tireTread: "1444947295498-07f60c19a4ff",      // tire close-up
  tireBlack: "1559674697-aea453b06ea9",        // tire sidewall
  tireDress: "1601739722627-f00a99138ea1",      // tire / wheel detail

  // Interior
  carCabin: "1605437241278-c1806d14a4d9",       // car interior / seats
  interiorVac: "1549041732-a8307955cfdf",        // vacuuming interior
  seatClean: "1591388156010-dd522151da35",      // cleaning car seats
  interiorDetail: "1624884269715-70759892cd29", // detailing cabin
  dashClean: "1638602030549-d04078ed0b90",      // dashboard / cockpit

  // Microfiber towels (car context)
  buffPaint: "1761934657948-708146148588",       // microfiber on car paint
  dryCar: "1761934658038-d0e6792378b1",         // drying / wiping car
  towelStack: "1761934658112-80095148fe87",     // microfiber cloths

  // Detailing kits & pro setup
  detailSupplies: "1683647115932-b33455fe6a3e",  // pro detailing supplies
  detailGarage: "1632823470270-a7d3d03c3e20",   // garage detail setup
  detailPro: "1641494639075-5571f7ef486b",      // detailer at work
  sprayOnCar: "1607860108358-47c0441e7adb",     // spray product on car

  // Pressure washer accessories
  pressureWasher: "1620584898989-d39f7f9ed1b7",  // pressure washer
  pressureRinse: "1592365559101-19adfefdf294",  // rinsing car with pressure
  foamRinse: "1605164598708-25701594473e",      // foam pre-wash
  washHose: "1632685062337-095b722134ca",        // hose / wash setup
};

function productImg(id, focus) {
  let url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=600&q=80`;
  if (focus) url += "&" + focus;
  return url;
}
function fallbackImg(name) {
  return "https://placehold.co/800x600/0f1115/e5e7eb?text=" + encodeURIComponent(name);
}

// The catalogue: 31 products across every required category. Each item has
// the merchandising fields (price/rating/stock/flags) plus the "inform"
// copy: what it does, who it's for, and key features.
const PRODUCTS = [
  // --- Car shampoo -------------------------------------------------------
  {
    id: 1, name: "Foam Bath Car Shampoo", brand: "AquaShield", category: "Car shampoo",
    price: 14.99, rating: 4.8, reviews: 412, stock: "in", img: PRODUCT_PHOTOS.foamOnCar,
    useCases: ["exterior"], tags: ["pH-neutral", "high-foam", "wash"],
    bestSeller: true, added: 6,
    description: "A pH-neutral, high-foaming wash that lifts dirt without stripping wax.",
    whatItDoes: "Encapsulates road grime in thick suds so it rinses away instead of scratching your paint.",
    whoFor: "Weekend washers who want a safe, slick everyday shampoo.",
    features: ["pH-neutral, wax-safe formula", "Ultra-thick foam", "Cherry scent", "1 L makes up to 20 washes"],
  },
  {
    id: 2, name: "Wash & Wax Shampoo", brand: "GlossLab", category: "Car shampoo",
    price: 18.49, salePrice: 14.99, onSale: true, rating: 4.6, reviews: 233, stock: "in",
    img: PRODUCT_PHOTOS.spongeWash, useCases: ["exterior", "protection"],
    tags: ["wax-boost", "gloss", "wash"], added: 9,
    description: "Cleans and lays down a layer of carnauba gloss in a single step.",
    whatItDoes: "Adds hydrophobic wax protection while you wash, boosting shine and beading.",
    whoFor: "Drivers who want quick protection without a separate waxing step.",
    features: ["Carnauba wax boost", "Water-beading finish", "Streak-free rinse", "Safe on all paint & clear coats"],
  },
  {
    id: 3, name: "Rinseless Wash Concentrate", brand: "DriftClean", category: "Car shampoo",
    price: 22.0, rating: 4.5, reviews: 156, stock: "in", img: PRODUCT_PHOTOS.washBucket,
    useCases: ["exterior"], tags: ["rinseless", "waterless", "eco"], added: 11,
    description: "Wash your car almost anywhere using a fraction of the water.",
    whatItDoes: "Lubricates and lifts dirt so you can wipe panels clean with no hose.",
    whoFor: "Apartment and condo drivers with no driveway or hose access.",
    features: ["Uses ~90% less water", "Great for touch-ups", "High lubricity", "Concentrated — 1 cap per bucket"],
  },

  // --- Wax ---------------------------------------------------------------
  {
    id: 4, name: "Carnauba Paste Wax", brand: "GlossLab", category: "Wax",
    price: 29.99, rating: 4.7, reviews: 301, stock: "in", img: PRODUCT_PHOTOS.waxOnHood,
    useCases: ["exterior", "protection"], tags: ["carnauba", "gloss", "wax"],
    bestSeller: true, added: 4,
    description: "Premium Brazilian carnauba for a deep, warm, wet-look shine.",
    whatItDoes: "Lays a durable protective layer that makes paint pop and repels water.",
    whoFor: "Enthusiasts who love a show-car glow and don't mind hand application.",
    features: ["Natural Brazilian carnauba", "Up to 3 months protection", "Wet-look gloss", "Includes foam applicator"],
  },
  {
    id: 5, name: "Liquid Spray Wax", brand: "PureShine", category: "Wax",
    price: 16.99, rating: 4.4, reviews: 189, stock: "low", img: PRODUCT_PHOTOS.carWax,
    useCases: ["exterior", "protection"], tags: ["spray-wax", "quick", "gloss"], added: 5,
    description: "A wipe-on, wipe-off spray wax for fast shine between details.",
    whatItDoes: "Refreshes protection and gloss in minutes — perfect after a wash.",
    whoFor: "Busy drivers who want protection without the elbow grease.",
    features: ["Apply in under 10 minutes", "Safe on glass & trim", "Streak-free", "Boosts existing wax"],
  },
  {
    id: 6, name: "Synthetic Sealant Wax", brand: "NanoGuard", category: "Wax",
    price: 34.99, salePrice: 27.99, onSale: true, rating: 4.6, reviews: 142, stock: "in",
    img: PRODUCT_PHOTOS.paintSeal, useCases: ["protection", "exterior"],
    tags: ["sealant", "durable", "synthetic"], added: 7,
    description: "A polymer paint sealant that outlasts natural waxes.",
    whatItDoes: "Bonds to the clear coat for long-lasting, high-gloss protection.",
    whoFor: "Owners who want maximum durability from a wax-style product.",
    features: ["Up to 6 months durability", "Hydrophobic polymers", "Easy on/off", "UV protection"],
  },

  // --- Ceramic spray -----------------------------------------------------
  {
    id: 7, name: "Ceramic SiO2 Spray Coating", brand: "NanoGuard", category: "Ceramic spray",
    price: 27.99, rating: 4.8, reviews: 510, stock: "in", img: PRODUCT_PHOTOS.sprayOnCar,
    useCases: ["protection", "exterior"], tags: ["ceramic", "SiO2", "hydrophobic"],
    bestSeller: true, added: 8,
    description: "Salon-grade SiO2 protection you can spray on after any wash.",
    whatItDoes: "Creates a slick, hydrophobic ceramic layer that beads water and blocks UV.",
    whoFor: "Anyone who wants ceramic-coating benefits without the pro price.",
    features: ["Up to 6 months protection", "Extreme water beading", "Adds serious gloss", "Works on paint, glass & wheels"],
  },
  {
    id: 8, name: "Graphene Ceramic Detail Spray", brand: "ApexAuto", category: "Ceramic spray",
    price: 39.99, rating: 4.7, reviews: 98, stock: "in", img: PRODUCT_PHOTOS.ceramicShine,
    useCases: ["protection"], tags: ["graphene", "ceramic", "premium"],
    isNew: true, added: 30,
    description: "Next-gen graphene infusion for even slicker, longer-lasting protection.",
    whatItDoes: "Combines graphene and SiO2 for higher water contact angle and less water spotting.",
    whoFor: "Detailers chasing the very best beading and slickness.",
    features: ["Graphene + SiO2 blend", "Reduces water spots", "Anti-static finish", "Deep, glassy gloss"],
  },
  {
    id: 9, name: "Ceramic Boost Topper", brand: "SlickCoat", category: "Ceramic spray",
    price: 21.99, rating: 4.5, reviews: 77, stock: "low", img: PRODUCT_PHOTOS.ceramicBeads,
    useCases: ["protection", "exterior"], tags: ["topper", "ceramic", "maintenance"], added: 12,
    description: "A light topper that refreshes an existing ceramic coating.",
    whatItDoes: "Restores slickness and beading on top of coatings and sealants.",
    whoFor: "Coating owners keeping their protection at its peak.",
    features: ["Extends coating life", "Fast maintenance spray", "Amplifies gloss", "Safe over coatings & waxes"],
  },

  // --- Tire shine --------------------------------------------------------
  {
    id: 10, name: "Tire Shine Gel", brand: "DriftClean", category: "Tire shine",
    price: 12.99, rating: 4.6, reviews: 264, stock: "in", img: PRODUCT_PHOTOS.tireBlack,
    useCases: ["wheels", "exterior"], tags: ["tire", "gel", "sling-free"],
    bestSeller: true, added: 10,
    description: "A controllable gel that delivers deep black shine with no sling.",
    whatItDoes: "Dresses tires with a rich satin-to-glossy finish that lasts through rain.",
    whoFor: "Drivers who want clean, dark tires that don't fling onto the paint.",
    features: ["Sling-free formula", "Satin or glossy (layer to taste)", "Water-resistant", "Includes applicator pad"],
  },
  {
    id: 11, name: "Tire & Trim Spray Dressing", brand: "PureShine", category: "Tire shine",
    price: 10.49, salePrice: 8.49, onSale: true, rating: 4.3, reviews: 143, stock: "in",
    img: PRODUCT_PHOTOS.tireDress, useCases: ["wheels"], tags: ["tire", "trim", "spray"], added: 3,
    description: "A quick spray dressing for tires and faded plastic trim.",
    whatItDoes: "Restores a natural finish to tires and revives dull exterior trim.",
    whoFor: "Anyone wanting a fast, no-mess tire and trim refresh.",
    features: ["Restores faded trim", "Even, natural sheen", "Spray & walk away", "Great value"],
  },
  {
    id: 12, name: "Graphene Tire Coating", brand: "NanoGuard", category: "Tire shine",
    price: 24.99, rating: 4.7, reviews: 61, stock: "in", img: PRODUCT_PHOTOS.wheelFoam,
    useCases: ["wheels", "protection"], tags: ["tire", "graphene", "durable"],
    isNew: true, added: 29,
    description: "A durable tire coating that keeps rubber dark for weeks.",
    whatItDoes: "Bonds to tire rubber for long-lasting, low-sling satin protection.",
    whoFor: "Detailers who want tire shine that survives multiple washes.",
    features: ["Weeks of durability", "Low-sling satin finish", "UV crack protection", "A little goes a long way"],
  },

  // --- Interior cleaner --------------------------------------------------
  {
    id: 13, name: "All-Purpose Interior Cleaner", brand: "DriftClean", category: "Interior cleaner",
    price: 11.99, rating: 4.6, reviews: 388, stock: "in", img: PRODUCT_PHOTOS.interiorDetail,
    useCases: ["interior"], tags: ["APC", "interior", "cleaner"],
    bestSeller: true, added: 13,
    description: "One dilutable cleaner for carpets, plastics, fabric, and vinyl.",
    whatItDoes: "Cuts through dirt, spills, and grime across nearly every interior surface.",
    whoFor: "Families and pet owners who need one bottle for everything.",
    features: ["Dilute 1:10 for light jobs", "Safe on most surfaces", "Low-odor formula", "No greasy residue"],
  },
  {
    id: 14, name: "Leather Cleaner & Conditioner", brand: "PureShine", category: "Interior cleaner",
    price: 19.99, rating: 4.7, reviews: 210, stock: "in", img: PRODUCT_PHOTOS.seatClean,
    useCases: ["interior", "protection"], tags: ["leather", "conditioner", "interior"], added: 14,
    description: "Cleans and nourishes leather seats in one gentle step.",
    whatItDoes: "Lifts body oils and dirt while conditioning to prevent cracking.",
    whoFor: "Owners of leather interiors who want soft, protected seats.",
    features: ["Cleans + conditions", "Matte, non-greasy finish", "UV protection", "Pleasant leather scent"],
  },
  {
    id: 15, name: "Streak-Free Glass Cleaner", brand: "GlossLab", category: "Interior cleaner",
    price: 8.99, rating: 4.5, reviews: 175, stock: "in", img: PRODUCT_PHOTOS.buffPaint,
    useCases: ["interior", "exterior"], tags: ["glass", "ammonia-free", "cleaner"], added: 2,
    description: "An ammonia-free glass cleaner that's safe for tint.",
    whatItDoes: "Cuts film and haze for crystal-clear, streak-free windows and mirrors.",
    whoFor: "Anyone tired of glare and streaks on the windshield.",
    features: ["Ammonia-free (tint-safe)", "No streaks or haze", "Works inside & out", "Foaming trigger"],
  },
  {
    id: 16, name: "Odor Eliminator Mist", brand: "DriftClean", category: "Interior cleaner",
    price: 9.49, rating: 4.2, reviews: 96, stock: "low", img: PRODUCT_PHOTOS.interiorVac,
    useCases: ["interior"], tags: ["odor", "freshener", "interior"], added: 1,
    description: "Neutralizes odors instead of just masking them.",
    whatItDoes: "Eliminates smoke, food, and pet smells and leaves a clean scent.",
    whoFor: "Drivers reviving a musty cabin or prepping for resale.",
    features: ["Neutralizes, not masks", "Light clean scent", "Safe on fabric", "Fine even mist"],
  },

  // --- Microfiber towels -------------------------------------------------
  {
    id: 17, name: "Plush Microfiber Towels (6-Pack)", brand: "FiberPro", category: "Microfiber towels",
    price: 18.99, rating: 4.8, reviews: 620, stock: "in", img: PRODUCT_PHOTOS.towelStack,
    useCases: ["interior", "exterior"], tags: ["microfiber", "towels", "buffing"],
    bestSeller: true, added: 17,
    description: "Thick 400 GSM towels for buffing wax and general detailing.",
    whatItDoes: "Absorbs product and buffs to a streak-free finish without scratching.",
    whoFor: "Every detailer — you can never have too many good towels.",
    features: ["400 GSM plush pile", "Edgeless & scratch-free", "Machine washable", "6 towels per pack"],
  },
  {
    id: 18, name: "Twist Drying Towel (XL)", brand: "FiberPro", category: "Microfiber towels",
    price: 24.99, rating: 4.7, reviews: 214, stock: "in", img: PRODUCT_PHOTOS.dryCar,
    useCases: ["exterior"], tags: ["drying", "towel", "large"], added: 18,
    description: "A huge twist-pile towel that dries a whole car in a few passes.",
    whatItDoes: "Soaks up sheeting water fast to prevent water spots.",
    whoFor: "Anyone who hates chasing drips with tiny towels.",
    features: ["1200 GSM twist pile", "Dries an entire car", "Soft silk-banded edges", "Huge 50x30 in size"],
  },
  {
    id: 19, name: "Glass & Polish Cloths (3-Pack)", brand: "FiberPro", category: "Microfiber towels",
    price: 12.99, salePrice: 9.99, onSale: true, rating: 4.5, reviews: 132, stock: "in",
    img: PRODUCT_PHOTOS.buffPaint, useCases: ["interior", "exterior"],
    tags: ["glass", "polish", "microfiber"], added: 15,
    description: "Tight-weave cloths made for lint-free glass and final wipe-downs.",
    whatItDoes: "Leaves glass and polished surfaces clear with zero lint.",
    whoFor: "Detailers who want a dedicated, lint-free glass towel.",
    features: ["Lint-free weave", "Perfect for glass & sprays", "Waffle texture", "3 cloths per pack"],
  },
  {
    id: 20, name: "Wheel & Detail Towels (4-Pack)", brand: "FiberPro", category: "Microfiber towels",
    price: 14.99, rating: 4.4, reviews: 88, stock: "in", img: PRODUCT_PHOTOS.alloyWheel,
    useCases: ["wheels"], tags: ["wheels", "towels", "durable"], added: 16,
    description: "Rugged towels you won't mind getting dirty on wheels and jambs.",
    whatItDoes: "Handles brake dust and grime on wheels, tires, and door jambs.",
    whoFor: "Anyone who wants to keep their good towels off the wheels.",
    features: ["Durable heavier weave", "Color-coded for dirty jobs", "Machine washable", "4 towels per pack"],
  },

  // --- Detailing kits ----------------------------------------------------
  {
    id: 21, name: "Complete Detailing Starter Kit", brand: "Garageline", category: "Detailing kits",
    price: 79.99, salePrice: 64.99, onSale: true, rating: 4.8, reviews: 305, stock: "in",
    img: PRODUCT_PHOTOS.detailSupplies, useCases: ["exterior", "interior", "protection"],
    tags: ["kit", "starter", "value"], bestSeller: true, added: 21,
    description: "Everything a beginner needs to detail inside and out.",
    whatItDoes: "Bundles shampoo, wax, interior cleaner, tire gel, and towels at a big saving.",
    whoFor: "New detailers or anyone who wants one box to do it all.",
    features: ["7 essentials in one box", "Save vs. buying separately", "Includes 3 microfiber towels", "Illustrated how-to guide"],
  },
  {
    id: 22, name: "Interior Refresh Kit", brand: "Garageline", category: "Detailing kits",
    price: 49.99, rating: 4.6, reviews: 121, stock: "in", img: PRODUCT_PHOTOS.dashClean,
    useCases: ["interior"], tags: ["kit", "interior", "value"], added: 22,
    description: "A focused kit to deep-clean and protect your cabin.",
    whatItDoes: "Combines APC, leather care, glass cleaner, and detailing brushes.",
    whoFor: "Drivers who spend a lot of time in the car and want a fresh cabin.",
    features: ["APC + leather + glass", "2 detailing brushes", "Includes 2 towels", "Great for resale prep"],
  },
  {
    id: 23, name: "Wheel & Tire Care Kit", brand: "Garageline", category: "Detailing kits",
    price: 44.99, rating: 4.6, reviews: 87, stock: "low", img: PRODUCT_PHOTOS.wheelRim,
    useCases: ["wheels"], tags: ["kit", "wheels", "value"], added: 23,
    description: "A complete wheel setup: cleaner, coating, brushes, and shine.",
    whatItDoes: "Removes brake dust, then protects and shines wheels and tires.",
    whoFor: "Anyone whose wheels are the dirtiest part of the car.",
    features: ["Wheel cleaner + tire gel", "Ceramic wheel coating", "2 wheel brushes", "Sling-free finish"],
  },
  {
    id: 24, name: "Ceramic Protection Kit", brand: "NanoGuard", category: "Detailing kits",
    price: 99.99, rating: 4.7, reviews: 54, stock: "in", img: PRODUCT_PHOTOS.ceramicPrep,
    useCases: ["protection", "exterior"], tags: ["kit", "ceramic", "premium"],
    isNew: true, added: 31,
    description: "A DIY ceramic-coating kit for long-term, high-gloss protection.",
    whatItDoes: "Guides you through prep and coating for months of slick protection.",
    whoFor: "Confident DIYers who want near-pro results at home.",
    features: ["Prep spray + coating", "Applicator blocks & cloths", "Up to 12 months protection", "Step-by-step guide"],
  },

  // --- Pressure washer accessories ---------------------------------------
  {
    id: 25, name: "Foam Cannon (1L)", brand: "TurboFoam", category: "Pressure washer accessories",
    price: 34.99, rating: 4.7, reviews: 268, stock: "in", img: PRODUCT_PHOTOS.foamRinse,
    useCases: ["exterior"], tags: ["foam-cannon", "pressure-washer", "wash"],
    bestSeller: true, added: 25,
    description: "Blanket your car in thick foam for a safer pre-wash.",
    whatItDoes: "Mixes shampoo and water into clinging foam that softens dirt before contact.",
    whoFor: "Pressure-washer owners who want the satisfying foam-bath experience.",
    features: ["Adjustable foam & spray", "1 L bottle", "Brass 1/4 in quick-connect", "Fits most pressure washers"],
  },
  {
    id: 26, name: "Quick-Connect Nozzle Set (5-Pc)", brand: "TurboFoam", category: "Pressure washer accessories",
    price: 19.99, rating: 4.5, reviews: 154, stock: "in", img: PRODUCT_PHOTOS.pressureWasher,
    useCases: ["exterior"], tags: ["nozzles", "pressure-washer", "accessory"], added: 26,
    description: "Five color-coded spray tips from gentle rinse to turbo.",
    whatItDoes: "Swaps spray patterns instantly for washing, rinsing, or stripping grime.",
    whoFor: "Anyone who wants the right spray angle for every job.",
    features: ["0/15/25/40 + soap tips", "Quick-connect fittings", "Corrosion-resistant", "Universal 1/4 in"],
  },
  {
    id: 27, name: "Surface Cleaner Attachment", brand: "TurboFoam", category: "Pressure washer accessories",
    price: 59.99, rating: 4.6, reviews: 63, stock: "out", img: PRODUCT_PHOTOS.pressureRinse,
    useCases: ["exterior"], tags: ["surface-cleaner", "driveway", "accessory"], added: 24,
    description: "Spin-clean driveways and patios without the zebra stripes.",
    whatItDoes: "Two spinning jets clean flat surfaces evenly and fast.",
    whoFor: "Homeowners cleaning driveways, garage floors, and walkways.",
    features: ["15 in cleaning path", "Even, stripe-free results", "Splash guard", "Quick-connect ready"],
  },
  {
    id: 28, name: "20 ft Pressure Hose Extension", brand: "TurboFoam", category: "Pressure washer accessories",
    price: 29.99, rating: 4.4, reviews: 71, stock: "in", img: PRODUCT_PHOTOS.washHose,
    useCases: ["exterior"], tags: ["hose", "extension", "accessory"], added: 27,
    description: "Add 20 feet of reach so you can walk around the whole car.",
    whatItDoes: "Extends your pressure washer's range without moving the machine.",
    whoFor: "Anyone tired of dragging the washer around the driveway.",
    features: ["20 ft (6 m) length", "Kink-resistant", "Quick-connect ends", "Rated to 3600 PSI"],
  },

  // --- Gift cards --------------------------------------------------------
  {
    id: 29, name: "DetailPro Gift Card — $25", brand: "DetailPro Garage", category: "Gift cards",
    price: 25.0, rating: 5.0, reviews: 40, stock: "in", img: PRODUCT_PHOTOS.glossyCar,
    useCases: ["gift"], tags: ["gift", "digital"], added: 19,
    description: "Give the gift of a clean car — delivered instantly by email.",
    whatItDoes: "A flexible digital gift card redeemable on anything in the store.",
    whoFor: "The car lover who's tricky to shop for.",
    features: ["Delivered by email", "Never expires", "Redeemable on any product", "Add a personal message"],
  },
  {
    id: 30, name: "DetailPro Gift Card — $50", brand: "DetailPro Garage", category: "Gift cards",
    price: 50.0, rating: 5.0, reviews: 52, stock: "in", img: PRODUCT_PHOTOS.detailGarage,
    useCases: ["gift"], tags: ["gift", "digital"], added: 20,
    description: "Give the gift of a clean car — delivered instantly by email.",
    whatItDoes: "A flexible digital gift card redeemable on anything in the store.",
    whoFor: "A great starter budget for a full detailing haul.",
    features: ["Delivered by email", "Never expires", "Redeemable on any product", "Add a personal message"],
  },
  {
    id: 31, name: "DetailPro Gift Card — $100", brand: "DetailPro Garage", category: "Gift cards",
    price: 100.0, rating: 5.0, reviews: 33, stock: "in", img: PRODUCT_PHOTOS.ceramicShine,
    useCases: ["gift"], tags: ["gift", "digital"], bestSeller: true, added: 28,
    description: "Give the gift of a clean car — delivered instantly by email.",
    whatItDoes: "A generous gift card that covers a premium kit or a coating.",
    whoFor: "The enthusiast who deserves the full treatment.",
    features: ["Delivered by email", "Never expires", "Redeemable on any product", "Add a personal message"],
  },
];

// Quick lookups + derived facet lists.
const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const ALL_BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
const CATEGORY_NAMES = CATEGORY_META.map((c) => c.name);
const PRICE_CEIL = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 10) * 10; // e.g. 100

// Store-wide pricing rules (H: match the real world — Ontario HST, CAD).
const TAX_RATE = 0.13;
const FREE_SHIP = 75;
const SHIP_FLAT = 9.99;

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Nova Scotia", "Ontario",
  "Prince Edward Island", "Quebec", "Saskatchewan",
  "Northwest Territories", "Nunavut", "Yukon",
];

// ===========================================================================
// 2. HELPERS
// ===========================================================================

const money = (n) => "$" + Number(n || 0).toFixed(2);
const priceOf = (p) => (p.onSale && p.salePrice ? p.salePrice : p.price);
const stockLabel = { in: "In stock", low: "Low stock", out: "Out of stock" };

// Cart line-item + order totals.
function computeTotals(cartItems) {
  let subtotal = 0;
  let savings = 0;
  cartItems.forEach((ci) => {
    const p = productById[ci.id];
    if (!p) return;
    subtotal += priceOf(p) * ci.qty;
    if (p.onSale && p.salePrice) savings += (p.price - p.salePrice) * ci.qty;
  });
  const shipping = subtotal > 0 && subtotal < FREE_SHIP ? SHIP_FLAT : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  return { subtotal, savings, shipping, tax, total };
}

// --- Validation (H: error prevention + help users recover) -----------------
function validateCustomer(v) {
  const e = {};
  if (!v.fullName || v.fullName.trim().length < 2) e.fullName = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email || "")) e.email = "Enter a valid email like name@example.com.";
  if ((v.phone || "").replace(/\D/g, "").length !== 10) e.phone = "Enter a 10-digit phone number.";
  if (!v.address || v.address.trim().length < 4) e.address = "Please enter your street address.";
  if (!v.city || v.city.trim().length < 2) e.city = "Please enter your city.";
  if (!v.province) e.province = "Please select your province.";
  if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test((v.postal || "").trim()))
    e.postal = "Enter a valid postal code (e.g., K1A 0B1).";
  return e;
}

function luhn(value) {
  const d = (value || "").replace(/\D/g, "");
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return d.length >= 13 && sum % 10 === 0;
}

function validatePayment(v) {
  const e = {};
  if (!v.cardName || v.cardName.trim().length < 2) e.cardName = "Enter the cardholder name.";
  const digits = (v.cardNumber || "").replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19 || !luhn(v.cardNumber))
    e.cardNumber = "Enter a valid card number.";
  if (!/^\d{2}\/\d{2}$/.test(v.expiry || "")) {
    e.expiry = "Use MM/YY format.";
  } else {
    const [mm, yy] = v.expiry.split("/").map(Number);
    if (mm < 1 || mm > 12) e.expiry = "Month must be 01-12.";
    else {
      const lastDay = new Date(2000 + yy, mm, 0, 23, 59, 59);
      if (lastDay < new Date()) e.expiry = "This card has expired.";
    }
  }
  if (!/^\d{3,4}$/.test(v.cvv || "")) e.cvv = "3 or 4 digits.";
  return e;
}

// Input formatters (recognition, not recall — the field guides the user).
const formatCard = (val) =>
  val.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (val) => {
  const d = val.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
};

// --- Hash router helpers ---------------------------------------------------
const KNOWN_PAGES = ["home", "products", "product", "cart", "checkout", "confirmation", "survey", "about"];
function parseHash(hash) {
  const clean = (hash || "").replace(/^#\/?/, "");
  if (!clean) return { page: "home" };
  const parts = clean.split("/");
  const page = parts[0];
  if (!KNOWN_PAGES.includes(page)) return { page: "home" };
  if (page === "product") return { page: "product", productId: Number(parts[1]) };
  return { page };
}
function buildHash(page, id) {
  if (page === "home") return "#/";
  if (page === "product" && id != null) return "#/product/" + id;
  return "#/" + page;
}

// ===========================================================================
// 3. CONTEXTS  (H: consistency — one source of truth for cart + navigation)
// ===========================================================================

const CartContext = createContext(null);
const useCart = () => useContext(CartContext);

const CART_KEY = "detailProCart";

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Mirror the cart to localStorage so the badge/contents survive refreshes.
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i));
      }
      return [...prev, { id: product.id, qty }];
    });
  };
  const updateQty = (id, qty) =>
    setItems((prev) =>
      prev.flatMap((i) => (i.id === id ? (qty <= 0 ? [] : [{ ...i, qty: Math.min(qty, 99) }]) : [i]))
    );
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const totals = computeTotals(items);

  const value = { items, addItem, updateQty, removeItem, clear, count, totals };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ===========================================================================
// 4. UI ATOMS
// ===========================================================================

// Fractional star rating (H: recognition — rating is visible at a glance).
function StarRating({ value, size = "sm" }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={"dp-stars dp-stars--" + size} title={value + " out of 5"} aria-label={value + " out of 5 stars"}>
      <span className="dp-stars-empty" aria-hidden="true">★★★★★</span>
      <span className="dp-stars-fill" style={{ width: pct + "%" }} aria-hidden="true">★★★★★</span>
    </span>
  );
}

// Stock pill (H: visibility of system status).
function StockBadge({ stock }) {
  return <span className={"dp-stock dp-stock--" + stock}>{stockLabel[stock]}</span>;
}

// Product image with a branded fallback so it never renders broken.
function ProductImage({ product, className }) {
  return (
    <img
      className={className}
      style={product.imgFocus ? { objectPosition: product.imgFocus } : undefined}
      src={productImg(product.img)}
      alt={product.name}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = fallbackImg(product.name);
      }}
    />
  );
}

// Quantity stepper used in the cart + product page.
function QtyStepper({ value, onChange, min = 1, max = 99, size }) {
  return (
    <div className={"dp-qty" + (size === "sm" ? " dp-qty--sm" : "")}>
      <button type="button" className="dp-qty-btn" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <input
        className="dp-qty-input"
        type="number"
        value={value}
        min={min}
        max={max}
        aria-label="Quantity"
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
      />
      <button type="button" className="dp-qty-btn" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

// Toast stack (H: visibility of system status — instant feedback on actions).
function ToastHost({ toasts }) {
  return (
    <div className="dp-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="dp-toast">
          <span className="dp-toast-check" aria-hidden="true">✓</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// 5. LAYOUT
// ===========================================================================

// Promotional bar (communication goal: INCITE TO ACTION). Dismissible so the
// user stays in control (H: user control & freedom).
function PromoBar() {
  const { navigate } = useApp();
  const [open, setOpen] = useState(() => localStorage.getItem("dpPromoClosed") !== "1");
  if (!open) return null;
  return (
    <div className="dp-promo">
      <span className="dp-promo-text">
        ☀️ <strong>Summer Shine Sale</strong> — Save 15% on protection products.{" "}
        <button className="dp-promo-link" onClick={() => navigate("products", { useCase: "protection" })}>
          Shop best sellers →
        </button>
      </span>
      <button
        className="dp-promo-close"
        aria-label="Dismiss announcement"
        onClick={() => {
          setOpen(false);
          try { localStorage.setItem("dpPromoClosed", "1"); } catch {}
        }}
      >×</button>
    </div>
  );
}

function Navbar() {
  const { navigate, view } = useApp();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const link = (page, label) => (
    <button
      className={"dp-nav-link" + (view.page === page ? " is-active" : "")}
      aria-current={view.page === page ? "page" : undefined}
      onClick={() => { navigate(page); setMenuOpen(false); }}
    >
      {label}
    </button>
  );

  return (
    <header className="dp-navbar">
      <div className="dp-container dp-navbar-inner">
        <button className="dp-brand" onClick={() => navigate("home")} aria-label="DetailPro Garage home">
          <span className="dp-brand-mark" aria-hidden="true">◆</span>
          DetailPro<span className="dp-brand-accent">Garage</span>
        </button>

        <button className="dp-nav-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
          ☰
        </button>

        <nav className={"dp-nav" + (menuOpen ? " is-open" : "")} aria-label="Primary">
          {link("home", "Home")}
          {link("products", "Shop")}
          {link("about", "About & Help")}
          <a className="dp-nav-link dp-nav-portfolio" href="index.html">← Portfolio</a>
          <button className="dp-cart-btn" onClick={() => { navigate("cart"); setMenuOpen(false); }} aria-label={`Cart with ${count} items`}>
            🛒 Cart
            {count > 0 && <span className="dp-cart-badge" aria-hidden="true">{count}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { navigate } = useApp();
  return (
    <footer className="dp-footer">
      <div className="dp-container dp-footer-grid">
        <div>
          <div className="dp-brand dp-brand--footer">
            <span className="dp-brand-mark" aria-hidden="true">◆</span>
            DetailPro<span className="dp-brand-accent">Garage</span>
          </div>
          <p className="dp-footer-tag">
            Trusted car-care advice and pro-grade products for everyday drivers.
            Thanks for supporting DetailPro Garage.
          </p>
        </div>
        <div>
          <h4 className="dp-footer-h">Shop</h4>
          <button className="dp-footer-link" onClick={() => navigate("products")}>All products</button>
          <button className="dp-footer-link" onClick={() => navigate("products", { category: "Detailing kits" })}>Detailing kits</button>
          <button className="dp-footer-link" onClick={() => navigate("products", { category: "Gift cards" })}>Gift cards</button>
        </div>
        <div>
          <h4 className="dp-footer-h">Help</h4>
          <button className="dp-footer-link" onClick={() => navigate("about")}>About & Contact</button>
          <button className="dp-footer-link" onClick={() => navigate("about")}>FAQ</button>
          <button className="dp-footer-link" onClick={() => navigate("survey")}>Leave feedback</button>
        </div>
        <div>
          <h4 className="dp-footer-h">Contact</h4>
          <p className="dp-footer-mini">123 Garage Way, Ottawa, ON</p>
          <p className="dp-footer-mini">support@detailprogarage.ca</p>
          <p className="dp-footer-mini">(613) 555-0142</p>
        </div>
      </div>
      <div className="dp-container dp-footer-bottom">
        <span>© {new Date().getFullYear()} DetailPro Garage · Prototype for SEG3125</span>
        <span>Prices in CAD · Designed by Yusuf Khan</span>
      </div>
    </footer>
  );
}

// A small reusable price display with sale handling.
function PriceTag({ product }) {
  if (product.onSale && product.salePrice) {
    return (
      <span className="dp-price">
        <span className="dp-price-now">{money(product.salePrice)}</span>
        <span className="dp-price-was">{money(product.price)}</span>
      </span>
    );
  }
  return <span className="dp-price"><span className="dp-price-now">{money(product.price)}</span></span>;
}

// ===========================================================================
// 6. CATALOGUE
// ===========================================================================

// Product card (communication goal: INFORM — name, category, price, rating,
// stock and a one-line "what it does" are all visible up front).
function ProductCard({ product }) {
  const { navigate, notify } = useApp();
  const { addItem } = useCart();
  const soldOut = product.stock === "out";

  return (
    <article className="dp-card">
      <button className="dp-card-media" onClick={() => navigate("product", { id: product.id })} aria-label={`View ${product.name}`}>
        <ProductImage product={product} className="dp-card-img" />
        <div className="dp-card-flags">
          {product.bestSeller && <span className="dp-flag dp-flag--best">Best seller</span>}
          {product.isNew && <span className="dp-flag dp-flag--new">New</span>}
          {product.onSale && <span className="dp-flag dp-flag--sale">Sale</span>}
        </div>
      </button>
      <div className="dp-card-body">
        <span className="dp-card-cat">{product.category}</span>
        <h3 className="dp-card-title">
          <button className="dp-linklike" onClick={() => navigate("product", { id: product.id })}>{product.name}</button>
        </h3>
        <div className="dp-card-rating">
          <StarRating value={product.rating} />
          <span className="dp-card-reviews">{product.rating} ({product.reviews})</span>
        </div>
        <p className="dp-card-desc">{product.whatItDoes}</p>
        <div className="dp-card-foot">
          <PriceTag product={product} />
          <StockBadge stock={product.stock} />
        </div>
        <button
          className="dp-btn dp-btn--primary dp-card-add"
          disabled={soldOut}
          onClick={() => { addItem(product, 1); notify(`Added "${product.name}" to cart`); }}
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="dp-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

// Faceted filters. All controls are visible and labelled, plus a "Clear
// filters" escape hatch (H: user control & freedom + recognition).
function Filters({ filters, setFilters, open, onClose }) {
  const toggle = (key, value) =>
    setFilters((f) => {
      const list = f[key];
      return { ...f, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });

  return (
    <aside className={"dp-filters" + (open ? " is-open" : "")} aria-label="Product filters">
      <div className="dp-filters-head">
        <h2 className="dp-filters-title">Filters</h2>
        <button className="dp-filters-close" onClick={onClose} aria-label="Close filters">×</button>
      </div>

      <div className="dp-facet">
        <h3 className="dp-facet-h">Category</h3>
        {CATEGORY_NAMES.map((c) => (
          <label key={c} className="dp-check">
            <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => toggle("categories", c)} />
            <span>{c}</span>
          </label>
        ))}
      </div>

      <div className="dp-facet">
        <h3 className="dp-facet-h">Use case</h3>
        <div className="dp-chips">
          {USE_CASES.map((u) => (
            <button
              key={u.id}
              type="button"
              className={"dp-chip" + (filters.useCases.includes(u.id) ? " is-on" : "")}
              aria-pressed={filters.useCases.includes(u.id)}
              onClick={() => toggle("useCases", u.id)}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dp-facet">
        <h3 className="dp-facet-h">Price range</h3>
        <div className="dp-price-range">
          <span>{money(filters.priceMin)}</span>
          <span>–</span>
          <span>{money(filters.priceMax)}</span>
        </div>
        <label className="dp-range-label">Min
          <input
            type="range" min={0} max={PRICE_CEIL} step={5} value={filters.priceMin}
            onChange={(e) => setFilters((f) => ({ ...f, priceMin: Math.min(Number(e.target.value), f.priceMax) }))}
          />
        </label>
        <label className="dp-range-label">Max
          <input
            type="range" min={0} max={PRICE_CEIL} step={5} value={filters.priceMax}
            onChange={(e) => setFilters((f) => ({ ...f, priceMax: Math.max(Number(e.target.value), f.priceMin) }))}
          />
        </label>
      </div>

      <div className="dp-facet">
        <h3 className="dp-facet-h">Brand</h3>
        {ALL_BRANDS.map((b) => (
          <label key={b} className="dp-check">
            <input type="checkbox" checked={filters.brands.includes(b)} onChange={() => toggle("brands", b)} />
            <span>{b}</span>
          </label>
        ))}
      </div>

      <div className="dp-facet">
        <h3 className="dp-facet-h">Rating</h3>
        {[0, 3, 4, 4.5].map((r) => (
          <label key={r} className="dp-check">
            <input type="radio" name="rating" checked={filters.minRating === r} onChange={() => setFilters((f) => ({ ...f, minRating: r }))} />
            <span>{r === 0 ? "Any rating" : `${r}★ & up`}</span>
          </label>
        ))}
      </div>

      <div className="dp-facet">
        <h3 className="dp-facet-h">Availability</h3>
        <label className="dp-check">
          <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))} />
          <span>In stock only</span>
        </label>
        <label className="dp-check">
          <input type="checkbox" checked={filters.onSaleOnly} onChange={(e) => setFilters((f) => ({ ...f, onSaleOnly: e.target.checked }))} />
          <span>On sale</span>
        </label>
      </div>

      <button className="dp-btn dp-btn--ghost dp-filters-apply" onClick={onClose}>Show results</button>
    </aside>
  );
}

// ===========================================================================
// 7. PAGES
// ===========================================================================

// A small breadcrumb-style back control (H: user control & freedom).
function BackLink({ to, label, params }) {
  const { navigate } = useApp();
  return (
    <button className="dp-back" onClick={() => navigate(to, params)}>← {label}</button>
  );
}

function HomePage() {
  const { navigate } = useApp();
  const bestSellers = PRODUCTS.filter((p) => p.bestSeller).slice(0, 4);
  const newArrivals = [...PRODUCTS].filter((p) => p.isNew).slice(0, 4);

  return (
    <div className="dp-home">
      {/* Hero (INCITE): big promise + primary and secondary CTAs */}
      <section className="dp-hero">
        <div className="dp-container dp-hero-inner">
          <div className="dp-hero-copy">
            <span className="dp-eyebrow">Premium car care · Made simple</span>
            <h1 className="dp-hero-title">Make your car <span className="dp-accent-text">shine like new.</span></h1>
            <p className="dp-hero-sub">
              Pro-grade shampoos, waxes, ceramic sprays and kits — chosen by
              detailers, explained for everyday drivers. Free shipping over {money(FREE_SHIP)}.
            </p>
            <div className="dp-hero-cta">
              <button className="dp-btn dp-btn--primary dp-btn--lg" onClick={() => navigate("products")}>Shop best sellers</button>
              <button className="dp-btn dp-btn--outline dp-btn--lg" onClick={() => navigate("products", { category: "Detailing kits" })}>Explore kits</button>
            </div>
            <ul className="dp-hero-trust">
              <li>★ 4.7 average rating</li>
              <li>✓ 30-day returns</li>
              <li>🚚 Ships from Ottawa</li>
            </ul>
          </div>
          <div className="dp-hero-card">
            <div className="dp-hero-badge">Save 15% today</div>
            <ProductImage product={PRODUCTS[6]} className="dp-hero-img" />
            <p className="dp-hero-caption">Ceramic SiO2 Spray — our #1 for easy protection</p>
          </div>
        </div>
      </section>

      {/* Value props (INFORM/engage) */}
      <section className="dp-container dp-values">
        <div className="dp-value"><span className="dp-value-ic">🚚</span><div><strong>Free shipping over {money(FREE_SHIP)}</strong><p>Fast, tracked delivery across Canada.</p></div></div>
        <div className="dp-value"><span className="dp-value-ic">💬</span><div><strong>Expert advice</strong><p>Plain-language help choosing the right product.</p></div></div>
        <div className="dp-value"><span className="dp-value-ic">↩️</span><div><strong>30-day returns</strong><p>Not happy? Send it back, no fuss.</p></div></div>
      </section>

      {/* Category tiles (recognition, not recall) */}
      <section className="dp-container dp-section">
        <div className="dp-section-head">
          <h2 className="dp-h2">Shop by category</h2>
          <button className="dp-link" onClick={() => navigate("products")}>View all →</button>
        </div>
        <div className="dp-cats">
          {CATEGORY_META.map((c) => (
            <button key={c.name} className="dp-cat-tile" onClick={() => navigate("products", { category: c.name })}>
              <span className="dp-cat-ic" aria-hidden="true">{c.icon}</span>
              <span className="dp-cat-name">{c.name}</span>
              <span className="dp-cat-blurb">{c.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="dp-container dp-section">
        <div className="dp-section-head">
          <h2 className="dp-h2">Best sellers</h2>
          <button className="dp-link" onClick={() => navigate("products")}>Shop all →</button>
        </div>
        <ProductGrid products={bestSellers} />
      </section>

      {/* Gift card promo (INCITE) */}
      <section className="dp-container">
        <div className="dp-giftcard">
          <div>
            <span className="dp-eyebrow dp-eyebrow--light">Gift cards</span>
            <h2 className="dp-h2 dp-h2--light">Give the gift of a clean car.</h2>
            <p className="dp-giftcard-sub">Digital gift cards delivered by email — they never expire and work on anything in the store.</p>
            <button className="dp-btn dp-btn--light" onClick={() => navigate("products", { category: "Gift cards" })}>Send a gift card</button>
          </div>
          <div className="dp-giftcard-art" aria-hidden="true">🎁</div>
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="dp-container dp-section">
          <div className="dp-section-head">
            <h2 className="dp-h2">New arrivals</h2>
            <button className="dp-link" onClick={() => navigate("products")}>See what's new →</button>
          </div>
          <ProductGrid products={newArrivals} />
        </section>
      )}
    </div>
  );
}

const DEFAULT_FILTERS = {
  categories: [], brands: [], useCases: [], minRating: 0,
  inStockOnly: false, onSaleOnly: false, priceMin: 0, priceMax: PRICE_CEIL,
};

function ProductsPage() {
  const { view } = useApp();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Apply any preset passed in from a category tile / promo bar / footer.
  useEffect(() => {
    const p = view.params || {};
    setFilters({
      ...DEFAULT_FILTERS,
      categories: p.category ? [p.category] : [],
      useCases: p.useCase ? [p.useCase] : [],
    });
    setQuery(p.q || "");
    setSort("featured");
  }, [view.params]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (filters.useCases.length && !filters.useCases.some((u) => p.useCases.includes(u))) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (filters.inStockOnly && p.stock === "out") return false;
      if (filters.onSaleOnly && !p.onSale) return false;
      if (priceOf(p) < filters.priceMin || priceOf(p) > filters.priceMax) return false;
      if (q) {
        const hay = (p.name + " " + p.brand + " " + p.category + " " + p.description + " " + p.tags.join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const by = {
      "price-asc": (a, b) => priceOf(a) - priceOf(b),
      "price-desc": (a, b) => priceOf(b) - priceOf(a),
      rating: (a, b) => b.rating - a.rating,
      newest: (a, b) => b.added - a.added,
      featured: (a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) || b.rating - a.rating,
    };
    return [...list].sort(by[sort] || by.featured);
  }, [filters, query, sort]);

  const activeCount =
    filters.categories.length + filters.brands.length + filters.useCases.length +
    (filters.minRating ? 1 : 0) + (filters.inStockOnly ? 1 : 0) + (filters.onSaleOnly ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < PRICE_CEIL ? 1 : 0);

  const clearAll = () => { setFilters(DEFAULT_FILTERS); setQuery(""); setSort("featured"); };

  return (
    <div className="dp-container dp-shop">
      <div className="dp-shop-head">
        <h1 className="dp-h1">Shop all products</h1>
        <p className="dp-muted">Pro-grade car care, explained in plain language.</p>
      </div>

      {/* Search + sort toolbar */}
      <div className="dp-toolbar">
        <div className="dp-search">
          <span className="dp-search-ic" aria-hidden="true">🔎</span>
          <input
            className="dp-search-input"
            type="search"
            placeholder="Search products, brands, or keywords…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          {query && <button className="dp-search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </div>
        <div className="dp-toolbar-right">
          <button className="dp-btn dp-btn--outline dp-filter-toggle" onClick={() => setDrawerOpen(true)}>
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <label className="dp-sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
      </div>

      <div className="dp-shop-body">
        <Filters filters={filters} setFilters={setFilters} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <div className="dp-shop-main">
          {/* Result count + clear (H: visibility of status; user control) */}
          <div className="dp-results-bar">
            <span className="dp-results-count">
              Showing <strong>{results.length}</strong> of {PRODUCTS.length} products
            </span>
            {(activeCount > 0 || query) && (
              <button className="dp-btn dp-btn--ghost dp-btn--sm" onClick={clearAll}>Clear filters</button>
            )}
          </div>

          {/* Active filter chips */}
          {(activeCount > 0 || query) && (
            <div className="dp-active-chips">
              {query && <span className="dp-active-chip">“{query}” <button onClick={() => setQuery("")} aria-label="Remove search">×</button></span>}
              {filters.categories.map((c) => <span key={c} className="dp-active-chip">{c} <button onClick={() => setFilters((f) => ({ ...f, categories: f.categories.filter((x) => x !== c) }))} aria-label={`Remove ${c}`}>×</button></span>)}
              {filters.brands.map((b) => <span key={b} className="dp-active-chip">{b} <button onClick={() => setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== b) }))} aria-label={`Remove ${b}`}>×</button></span>)}
              {filters.useCases.map((u) => <span key={u} className="dp-active-chip">{USE_CASES.find((x) => x.id === u)?.label} <button onClick={() => setFilters((f) => ({ ...f, useCases: f.useCases.filter((x) => x !== u) }))} aria-label="Remove use case">×</button></span>)}
              {filters.minRating > 0 && <span className="dp-active-chip">{filters.minRating}★ & up <button onClick={() => setFilters((f) => ({ ...f, minRating: 0 }))} aria-label="Remove rating filter">×</button></span>}
              {filters.onSaleOnly && <span className="dp-active-chip">On sale <button onClick={() => setFilters((f) => ({ ...f, onSaleOnly: false }))} aria-label="Remove sale filter">×</button></span>}
              {filters.inStockOnly && <span className="dp-active-chip">In stock <button onClick={() => setFilters((f) => ({ ...f, inStockOnly: false }))} aria-label="Remove stock filter">×</button></span>}
            </div>
          )}

          {results.length === 0 ? (
            // Empty state (H: help users recover — clear guidance + action)
            <div className="dp-empty">
              <div className="dp-empty-ic" aria-hidden="true">🔍</div>
              <h3>No products match your filters</h3>
              <p className="dp-muted">Try removing a filter or searching for something broader.</p>
              <button className="dp-btn dp-btn--primary" onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <ProductGrid products={results} />
          )}
        </div>
      </div>

      {drawerOpen && <div className="dp-scrim" onClick={() => setDrawerOpen(false)} />}
    </div>
  );
}

function ProductDetailsPage() {
  const { view, navigate, notify } = useApp();
  const { addItem } = useCart();
  const product = productById[view.productId];
  const [qty, setQty] = useState(1);

  useEffect(() => { setQty(1); }, [view.productId]);

  if (!product) {
    return (
      <div className="dp-container dp-narrow dp-pad">
        <h1 className="dp-h2">Product not found</h1>
        <p className="dp-muted">That product may have moved.</p>
        <button className="dp-btn dp-btn--primary" onClick={() => navigate("products")}>Back to shop</button>
      </div>
    );
  }

  const soldOut = product.stock === "out";
  const related = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.useCases.some((u) => product.useCases.includes(u)))
  ).slice(0, 4);

  return (
    <div className="dp-container dp-pad">
      <BackLink to="products" label="Back to shop" />

      <div className="dp-detail">
        <div className="dp-detail-media">
          <ProductImage product={product} className="dp-detail-img" />
          <div className="dp-card-flags dp-card-flags--detail">
            {product.bestSeller && <span className="dp-flag dp-flag--best">Best seller</span>}
            {product.isNew && <span className="dp-flag dp-flag--new">New</span>}
            {product.onSale && <span className="dp-flag dp-flag--sale">Sale</span>}
          </div>
        </div>

        <div className="dp-detail-info">
          <span className="dp-card-cat">{product.brand} · {product.category}</span>
          <h1 className="dp-detail-title">{product.name}</h1>
          <div className="dp-card-rating">
            <StarRating value={product.rating} size="md" />
            <span className="dp-card-reviews">{product.rating} · {product.reviews} reviews</span>
          </div>

          <div className="dp-detail-price">
            <PriceTag product={product} />
            {product.onSale && product.salePrice && (
              <span className="dp-save-pill">Save {money(product.price - product.salePrice)}</span>
            )}
          </div>

          <StockBadge stock={product.stock} />

          <p className="dp-detail-desc">{product.description}</p>

          {/* INFORM: what it does / who it's for */}
          <div className="dp-detail-blocks">
            <div className="dp-info-block">
              <h3 className="dp-info-h">What it does</h3>
              <p>{product.whatItDoes}</p>
            </div>
            <div className="dp-info-block">
              <h3 className="dp-info-h">Who it's for</h3>
              <p>{product.whoFor}</p>
            </div>
          </div>

          <div className="dp-info-block">
            <h3 className="dp-info-h">Key features</h3>
            <ul className="dp-features">
              {product.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>

          <div className="dp-detail-tags">
            {product.useCases.map((u) => (
              <button key={u} className="dp-chip is-soft" onClick={() => navigate("products", { useCase: u })}>
                {USE_CASES.find((x) => x.id === u)?.label}
              </button>
            ))}
          </div>

          {/* Buy box */}
          <div className="dp-buybox">
            <QtyStepper value={qty} onChange={setQty} min={1} max={soldOut ? 1 : 10} />
            <button
              className="dp-btn dp-btn--primary dp-btn--lg"
              disabled={soldOut}
              onClick={() => { addItem(product, qty); notify(`Added ${qty} × "${product.name}" to cart`); }}
            >
              {soldOut ? "Sold out" : "Add to cart"}
            </button>
            <button
              className="dp-btn dp-btn--outline dp-btn--lg"
              disabled={soldOut}
              onClick={() => { addItem(product, qty); navigate("cart"); }}
            >
              Buy now
            </button>
          </div>
          <p className="dp-buybox-note">🚚 Free shipping over {money(FREE_SHIP)} · ↩️ 30-day returns</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="dp-section">
          <h2 className="dp-h2">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

// Shared progress stepper (H: visibility of system status).
const STEPS = ["Cart", "Customer Info", "Payment", "Review", "Confirmation"];
function CheckoutStepper({ current }) {
  return (
    <ol className="dp-stepper" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const state = step < current ? "done" : step === current ? "current" : "todo";
        return (
          <li key={label} className={"dp-step dp-step--" + state} aria-current={state === "current" ? "step" : undefined}>
            <span className="dp-step-dot">{state === "done" ? "✓" : step}</span>
            <span className="dp-step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

// Order summary panel reused on Cart + Checkout.
function OrderSummary({ children }) {
  const { totals } = useCart();
  const remaining = Math.max(0, FREE_SHIP - totals.subtotal);
  const pct = Math.min(100, (totals.subtotal / FREE_SHIP) * 100);
  return (
    <div className="dp-summary">
      <h2 className="dp-summary-h">Order summary</h2>
      <div className="dp-summary-row"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
      {totals.savings > 0 && <div className="dp-summary-row dp-summary-row--save"><span>Sale savings</span><span>−{money(totals.savings)}</span></div>}
      <div className="dp-summary-row"><span>Shipping</span><span>{totals.shipping === 0 ? "FREE" : money(totals.shipping)}</span></div>
      <div className="dp-summary-row"><span>HST (13%)</span><span>{money(totals.tax)}</span></div>
      <div className="dp-summary-total"><span>Total</span><span>{money(totals.total)}</span></div>

      {/* Free-shipping nudge (INCITE + visibility of status) */}
      {totals.subtotal > 0 && remaining > 0 ? (
        <div className="dp-ship-nudge">
          <div className="dp-ship-bar"><div className="dp-ship-fill" style={{ width: pct + "%" }} /></div>
          Add <strong>{money(remaining)}</strong> more for FREE shipping!
        </div>
      ) : totals.subtotal > 0 ? (
        <div className="dp-ship-nudge dp-ship-nudge--won">🎉 You've unlocked free shipping!</div>
      ) : null}

      {children}
    </div>
  );
}

function CartPage() {
  const { navigate } = useApp();
  const { items, updateQty, removeItem, clear, count } = useCart();

  if (count === 0) {
    return (
      <div className="dp-container dp-pad">
        <CheckoutStepper current={1} />
        <div className="dp-empty dp-empty--cart">
          <div className="dp-empty-ic" aria-hidden="true">🛒</div>
          <h2>Your cart is empty</h2>
          <p className="dp-muted">Add some shine to your ride — browse our best sellers to get started.</p>
          <button className="dp-btn dp-btn--primary" onClick={() => navigate("products")}>Start shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dp-container dp-pad">
      <CheckoutStepper current={1} />
      <div className="dp-cart">
        <div className="dp-cart-list">
          <div className="dp-cart-listhead">
            <h1 className="dp-h1">Your cart ({count})</h1>
            <button className="dp-btn dp-btn--ghost dp-btn--sm" onClick={() => { if (window.confirm("Remove all items from your cart?")) clear(); }}>
              Clear cart
            </button>
          </div>

          {items.map((ci) => {
            const p = productById[ci.id];
            if (!p) return null;
            return (
              <div key={ci.id} className="dp-cartitem">
                <button className="dp-cartitem-media" onClick={() => navigate("product", { id: p.id })} aria-label={`View ${p.name}`}>
                  <ProductImage product={p} className="dp-cartitem-img" />
                </button>
                <div className="dp-cartitem-main">
                  <div className="dp-cartitem-top">
                    <div>
                      <span className="dp-card-cat">{p.category}</span>
                      <h3 className="dp-cartitem-name">
                        <button className="dp-linklike" onClick={() => navigate("product", { id: p.id })}>{p.name}</button>
                      </h3>
                    </div>
                    <PriceTag product={p} />
                  </div>
                  <div className="dp-cartitem-bottom">
                    <QtyStepper value={ci.qty} onChange={(q) => updateQty(ci.id, q)} min={1} max={10} size="sm" />
                    <span className="dp-cartitem-line">{money(priceOf(p) * ci.qty)}</span>
                    <button className="dp-btn dp-btn--ghost dp-btn--sm" onClick={() => removeItem(ci.id)}>Remove</button>
                  </div>
                </div>
              </div>
            );
          })}

          <BackLink to="products" label="Continue shopping" />
        </div>

        <OrderSummary>
          <button className="dp-btn dp-btn--primary dp-btn--block dp-btn--lg" onClick={() => navigate("checkout")}>
            Proceed to checkout
          </button>
          <p className="dp-summary-note">Secure checkout · This is a prototype — no real payment is taken.</p>
        </OrderSummary>
      </div>
    </div>
  );
}

// Reusable labelled field with inline error (H: recognition + recover errors).
function Field({ label, name, values, errors, show, onChange, type = "text", placeholder, hint, maxLength, inputMode, children }) {
  const err = show && errors[name];
  return (
    <div className={"dp-field" + (err ? " has-error" : "")}>
      <label htmlFor={name}>{label}</label>
      {children ? (
        children
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          maxLength={maxLength}
          value={values[name] || ""}
          onChange={(e) => onChange(name, e.target.value)}
          aria-invalid={!!err}
          aria-describedby={err ? name + "-err" : hint ? name + "-hint" : undefined}
        />
      )}
      {hint && !err && <span className="dp-hint" id={name + "-hint"}>{hint}</span>}
      {err && <span className="dp-error" id={name + "-err"}>⚠ {err}</span>}
    </div>
  );
}

function CheckoutPage() {
  const { navigate, setOrder } = useApp();
  const { items, count, totals, clear } = useCart();
  const [step, setStep] = useState("info"); // info | payment | review
  const [customer, setCustomer] = useState({ fullName: "", email: "", phone: "", address: "", city: "", province: "", postal: "" });
  const [payment, setPayment] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
  const [showInfoErr, setShowInfoErr] = useState(false);
  const [showPayErr, setShowPayErr] = useState(false);

  const infoErrors = validateCustomer(customer);
  const payErrors = validatePayment(payment);

  if (count === 0) {
    return (
      <div className="dp-container dp-pad">
        <CheckoutStepper current={2} />
        <div className="dp-empty dp-empty--cart">
          <div className="dp-empty-ic" aria-hidden="true">🛒</div>
          <h2>Your cart is empty</h2>
          <p className="dp-muted">Add a product before checking out.</p>
          <button className="dp-btn dp-btn--primary" onClick={() => navigate("products")}>Start shopping</button>
        </div>
      </div>
    );
  }

  const setC = (k, v) => setCustomer((c) => ({ ...c, [k]: v }));
  const setP = (k, v) => {
    if (k === "cardNumber") v = formatCard(v);
    if (k === "expiry") v = formatExpiry(v);
    if (k === "cvv") v = v.replace(/\D/g, "").slice(0, 4);
    setPayment((p) => ({ ...p, [k]: v }));
  };

  const currentStepNum = step === "info" ? 2 : step === "payment" ? 3 : 4;

  const goPayment = () => {
    if (Object.keys(infoErrors).length) { setShowInfoErr(true); return; }
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goReview = () => {
    if (Object.keys(payErrors).length) { setShowPayErr(true); return; }
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const placeOrder = () => {
    const number = "DPG-" + String(Math.floor(100000 + Math.random() * 900000));
    const orderItems = items.map((ci) => {
      const p = productById[ci.id];
      return { id: p.id, name: p.name, qty: ci.qty, unit: priceOf(p), line: priceOf(p) * ci.qty };
    });
    setOrder({
      number,
      date: new Date().toISOString(),
      items: orderItems,
      totals,
      customer,
      cardLast4: payment.cardNumber.replace(/\D/g, "").slice(-4),
      email: customer.email,
    });
    clear();
    navigate("confirmation");
  };

  return (
    <div className="dp-container dp-pad">
      <CheckoutStepper current={currentStepNum} />
      <div className="dp-checkout">
        <div className="dp-checkout-main">
          {step === "info" && (
            <section className="dp-panel">
              <h1 className="dp-h2">Customer information</h1>
              <p className="dp-muted">Where should we ship your order? Fields marked required must be filled in.</p>
              <div className="dp-form-grid">
                <Field label="Full name *" name="fullName" values={customer} errors={infoErrors} show={showInfoErr} onChange={setC} placeholder="Alex Driver" />
                <Field label="Email *" name="email" type="email" values={customer} errors={infoErrors} show={showInfoErr} onChange={setC} placeholder="alex@example.com" hint="We'll email your receipt here." />
                <Field label="Phone *" name="phone" type="tel" inputMode="tel" values={customer} errors={infoErrors} show={showInfoErr} onChange={setC} placeholder="(613) 555-0123" />
                <Field label="Street address *" name="address" values={customer} errors={infoErrors} show={showInfoErr} onChange={setC} placeholder="123 Garage Way" />
                <Field label="City *" name="city" values={customer} errors={infoErrors} show={showInfoErr} onChange={setC} placeholder="Ottawa" />
                <Field label="Province *" name="province" values={customer} errors={infoErrors} show={showInfoErr} onChange={setC}>
                  <select id="province" value={customer.province} onChange={(e) => setC("province", e.target.value)} aria-invalid={!!(showInfoErr && infoErrors.province)}>
                    <option value="">Select province…</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Postal code *" name="postal" values={customer} errors={infoErrors} show={showInfoErr} onChange={setC} placeholder="K1A 0B1" hint="Format: A1A 1A1" />
              </div>
              <div className="dp-form-actions">
                <BackLink to="cart" label="Back to cart" />
                <button className="dp-btn dp-btn--primary dp-btn--lg" onClick={goPayment}>Continue to payment</button>
              </div>
            </section>
          )}

          {step === "payment" && (
            <section className="dp-panel">
              <h1 className="dp-h2">Payment</h1>
              <div className="dp-proto-note">🔒 Prototype only — do not enter a real card. Try <code>4242 4242 4242 4242</code>.</div>
              <div className="dp-form-grid">
                <Field label="Cardholder name *" name="cardName" values={payment} errors={payErrors} show={showPayErr} onChange={setP} placeholder="Alex Driver" />
                <Field label="Card number *" name="cardNumber" inputMode="numeric" values={payment} errors={payErrors} show={showPayErr} onChange={setP} placeholder="4242 4242 4242 4242" maxLength={23} />
                <Field label="Expiry (MM/YY) *" name="expiry" inputMode="numeric" values={payment} errors={payErrors} show={showPayErr} onChange={setP} placeholder="12/28" maxLength={5} />
                <Field label="CVV *" name="cvv" inputMode="numeric" values={payment} errors={payErrors} show={showPayErr} onChange={setP} placeholder="123" maxLength={4} hint="3 or 4 digits on the back." />
              </div>
              <div className="dp-form-actions">
                <button className="dp-back" onClick={() => setStep("info")}>← Back to info</button>
                <button className="dp-btn dp-btn--primary dp-btn--lg" onClick={goReview}>Review order</button>
              </div>
            </section>
          )}

          {step === "review" && (
            <section className="dp-panel">
              <h1 className="dp-h2">Review your order</h1>
              <p className="dp-muted">Please confirm everything looks right before placing your order.</p>

              <div className="dp-review-cols">
                <div className="dp-review-card">
                  <div className="dp-review-cardhead">
                    <h3>Shipping to</h3>
                    <button className="dp-link" onClick={() => setStep("info")}>Edit</button>
                  </div>
                  <p>{customer.fullName}<br />{customer.address}<br />{customer.city}, {customer.province} {customer.postal}<br />{customer.email} · {customer.phone}</p>
                </div>
                <div className="dp-review-card">
                  <div className="dp-review-cardhead">
                    <h3>Payment</h3>
                    <button className="dp-link" onClick={() => setStep("payment")}>Edit</button>
                  </div>
                  <p>{payment.cardName}<br />Card ending in •••• {payment.cardNumber.replace(/\D/g, "").slice(-4)}<br />Expires {payment.expiry}</p>
                </div>
              </div>

              <div className="dp-review-items">
                {items.map((ci) => {
                  const p = productById[ci.id];
                  if (!p) return null;
                  return (
                    <div key={ci.id} className="dp-review-item">
                      <ProductImage product={p} className="dp-review-img" />
                      <span className="dp-review-name">{p.name} <span className="dp-muted">× {ci.qty}</span></span>
                      <span>{money(priceOf(p) * ci.qty)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="dp-form-actions">
                <button className="dp-back" onClick={() => setStep("payment")}>← Back to payment</button>
                <button className="dp-btn dp-btn--primary dp-btn--lg" onClick={placeOrder}>Place order · {money(totals.total)}</button>
              </div>
            </section>
          )}
        </div>

        <OrderSummary />
      </div>
    </div>
  );
}

function ConfirmationPage() {
  const { navigate, order } = useApp();

  if (!order) {
    return (
      <div className="dp-container dp-pad dp-narrow">
        <CheckoutStepper current={5} />
        <div className="dp-empty">
          <div className="dp-empty-ic" aria-hidden="true">📦</div>
          <h2>No recent order</h2>
          <p className="dp-muted">Once you place an order, your confirmation will appear here.</p>
          <button className="dp-btn dp-btn--primary" onClick={() => navigate("products")}>Go shopping</button>
        </div>
      </div>
    );
  }

  const eta = new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="dp-container dp-pad">
      <CheckoutStepper current={5} />
      {/* ENGAGE: warm, appreciative confirmation copy */}
      <div className="dp-confirm">
        <div className="dp-confirm-check" aria-hidden="true">✓</div>
        <h1 className="dp-h1">Thank you for your order!</h1>
        <p className="dp-confirm-lead">
          Thanks for supporting DetailPro Garage, {order.customer.fullName.split(" ")[0] || "friend"}.
          We're already prepping your order for a shiny send-off.
        </p>

        <div className="dp-confirm-meta">
          <div><span className="dp-muted">Order number</span><strong>{order.number}</strong></div>
          <div><span className="dp-muted">Confirmation sent to</span><strong>{order.email}</strong></div>
          <div><span className="dp-muted">Estimated delivery</span><strong>{eta}</strong></div>
          <div><span className="dp-muted">Total paid</span><strong>{money(order.totals.total)}</strong></div>
        </div>

        <div className="dp-confirm-items">
          <h2 className="dp-summary-h">What's on its way</h2>
          {order.items.map((it) => (
            <div key={it.id} className="dp-summary-row"><span>{it.name} × {it.qty}</span><span>{money(it.line)}</span></div>
          ))}
          <div className="dp-summary-row"><span>Shipping</span><span>{order.totals.shipping === 0 ? "FREE" : money(order.totals.shipping)}</span></div>
          <div className="dp-summary-row"><span>HST (13%)</span><span>{money(order.totals.tax)}</span></div>
          <div className="dp-summary-total"><span>Total</span><span>{money(order.totals.total)}</span></div>
        </div>

        <div className="dp-confirm-cta">
          <button className="dp-btn dp-btn--primary dp-btn--lg" onClick={() => navigate("survey")}>We'd love your feedback →</button>
          <button className="dp-btn dp-btn--outline dp-btn--lg" onClick={() => navigate("products")}>Continue shopping</button>
        </div>
        <p className="dp-muted dp-confirm-note">A receipt has been emailed to you. Need help? Visit our <button className="dp-link" onClick={() => navigate("about")}>Help & FAQ</button>.</p>
      </div>
    </div>
  );
}

function SurveyPage() {
  const { navigate } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [recommend, setRecommend] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (rating === 0) { setShowErr(true); return; }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    // ENGAGE: friendly thank-you after submission.
    return (
      <div className="dp-container dp-pad dp-narrow">
        <div className="dp-confirm">
          <div className="dp-confirm-check" aria-hidden="true">💙</div>
          <h1 className="dp-h1">Thank you for your feedback!</h1>
          <p className="dp-confirm-lead">
            Your input helps us make DetailPro Garage better for every driver.
            We really appreciate you taking the time.
          </p>
          <div className="dp-confirm-cta">
            <button className="dp-btn dp-btn--primary dp-btn--lg" onClick={() => navigate("home")}>Back to home</button>
            <button className="dp-btn dp-btn--outline dp-btn--lg" onClick={() => navigate("products")}>Keep shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dp-container dp-pad dp-narrow">
      <div className="dp-panel">
        <span className="dp-eyebrow">Quick survey · 30 seconds</span>
        <h1 className="dp-h2">We'd love your feedback</h1>
        <p className="dp-muted">Tell us about your visit to DetailPro Garage — it genuinely helps.</p>

        <form onSubmit={submit} noValidate>
          <div className={"dp-field" + (showErr && rating === 0 ? " has-error" : "")}>
            <label>How would you rate your experience? *</label>
            <div className="dp-rate" role="radiogroup" aria-label="Rating from 1 to 5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className={"dp-rate-star" + ((hoverRating || rating) >= n ? " is-on" : "")}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                >★</button>
              ))}
              <span className="dp-rate-value">{rating > 0 ? `${rating}/5` : ""}</span>
            </div>
            {showErr && rating === 0 && <span className="dp-error">⚠ Please pick a rating from 1 to 5.</span>}
          </div>

          <div className="dp-field">
            <label htmlFor="liked">What did you like?</label>
            <textarea id="liked" rows={3} value={liked} onChange={(e) => setLiked(e.target.value)} placeholder="The faceted search made it easy to find…" />
          </div>

          <div className="dp-field">
            <label htmlFor="improve">What could be improved?</label>
            <textarea id="improve" rows={3} value={improve} onChange={(e) => setImprove(e.target.value)} placeholder="I wish there was…" />
          </div>

          <label className="dp-check dp-check--big">
            <input type="checkbox" checked={recommend} onChange={(e) => setRecommend(e.target.checked)} />
            <span>I would recommend DetailPro Garage to a friend.</span>
          </label>

          <div className="dp-form-actions dp-form-actions--end">
            <button type="submit" className="dp-btn dp-btn--primary dp-btn--lg">Submit feedback</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// FAQ accordion (H: help & documentation).
const FAQ_ITEMS = [
  { q: "How do I choose the right product?", a: "Start on the Shop page and filter by Use case — Exterior, Interior, Wheels, Protection, or Gifts. Each product page also explains what it does and who it's for. Still unsure? Email us and we'll recommend a routine." },
  { q: "What is your shipping policy?", a: "We ship across Canada from Ottawa. Standard shipping is $9.99, and it's FREE on orders over $75. Most orders arrive within 3–5 business days." },
  { q: "What is your return policy?", a: "If you're not happy, return any unused product within 30 days for a full refund. Gift cards are non-refundable but never expire." },
  { q: "How do gift cards work?", a: "Digital gift cards are delivered by email after purchase. They never expire and can be redeemed on any product in the store." },
  { q: "Is my payment information safe?", a: "This site is a class prototype and does not process real payments — please don't enter real card details. In a production store, payments would be handled by a secure PCI-compliant processor." },
  { q: "Do these products work on ceramic-coated cars?", a: "Yes. Look for pH-neutral shampoos and coating-safe toppers. Our Ceramic Boost Topper is designed specifically to maintain existing coatings." },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="dp-faq">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={item.q} className={"dp-faq-item" + (isOpen ? " is-open" : "")}>
            <button className="dp-faq-q" aria-expanded={isOpen} onClick={() => setOpenIdx(isOpen ? -1 : i)}>
              <span>{item.q}</span>
              <span className="dp-faq-ic" aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <div className="dp-faq-a">{item.a}</div>}
          </div>
        );
      })}
    </div>
  );
}

function AboutPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const errors = {};
  if (!form.name || form.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email.";
  if (!form.message || form.message.trim().length < 5) errors.message = "Please enter a short message.";

  const submit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) { setShowErr(true); return; }
    setSent(true);
  };

  return (
    <div className="dp-container dp-pad">
      {/* Writer/reader voice: the trusted car-care expert */}
      <section className="dp-about-hero">
        <span className="dp-eyebrow">About us</span>
        <h1 className="dp-h1">Car care, made simple.</h1>
        <p className="dp-about-lead">
          DetailPro Garage started in an Ottawa garage with a simple belief: every
          driver deserves a great-looking car without needing to be a pro. We test
          and hand-pick pro-grade products, then explain them in plain language so
          you can buy with confidence. Think of us as your car-care expert on call.
        </p>
      </section>

      <section className="dp-about-stats">
        <div><strong>10k+</strong><span>happy drivers</span></div>
        <div><strong>4.7★</strong><span>average rating</span></div>
        <div><strong>30-day</strong><span>easy returns</span></div>
        <div><strong>Ottawa</strong><span>proudly local</span></div>
      </section>

      <section className="dp-section">
        <h2 className="dp-h2">Help & FAQ</h2>
        <p className="dp-muted">Answers to the questions we hear most. Can't find yours? Message us below.</p>
        <FAQ />
      </section>

      <section className="dp-section dp-contact">
        <div className="dp-contact-info">
          <h2 className="dp-h2">Get in touch</h2>
          <p className="dp-muted">We're a real, friendly team — reach out any time.</p>
          <ul className="dp-contact-list">
            <li><span aria-hidden="true">📍</span> 123 Garage Way, Ottawa, ON K1A 0B1</li>
            <li><span aria-hidden="true">✉️</span> support@detailprogarage.ca</li>
            <li><span aria-hidden="true">📞</span> (613) 555-0142</li>
            <li><span aria-hidden="true">🕘</span> Mon–Sat, 9am–6pm ET</li>
          </ul>
        </div>
        <div className="dp-panel dp-contact-form">
          <h3 className="dp-h3">Send us a message</h3>
          {sent ? (
            <div className="dp-alert dp-alert--ok">✓ Thanks, {form.name.split(" ")[0]}! We'll reply within one business day.</div>
          ) : (
            <form onSubmit={submit} noValidate>
              <Field label="Your name *" name="name" values={form} errors={errors} show={showErr} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} placeholder="Your name" />
              <Field label="Email *" name="email" type="email" values={form} errors={errors} show={showErr} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))} placeholder="you@example.com" />
              <Field label="Message *" name="message" values={form} errors={errors} show={showErr} onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}>
                <textarea id="message" rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="How can we help?" />
              </Field>
              <button type="submit" className="dp-btn dp-btn--primary dp-btn--block">Send message</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

// ===========================================================================
// 8. APP  (hash router + providers)
// ===========================================================================

function App() {
  const [view, setView] = useState(() => parseHash(window.location.hash));
  const [order, setOrder] = useState(null);
  const [toasts, setToasts] = useState([]);
  const pendingParams = useRef(null);

  // Back/forward + refresh: hashchange is the single source of truth.
  useEffect(() => {
    const handle = () => {
      const parsed = parseHash(window.location.hash);
      parsed.params = pendingParams.current || {};
      pendingParams.current = null;
      setView(parsed);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);

  const navigate = (page, opts = {}) => {
    const hash = buildHash(page, opts.id);
    const cur = window.location.hash || "#/";
    if (cur === hash) {
      // Same hash -> hashchange won't fire, so update in place.
      setView({ page, productId: opts.id, params: opts });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      pendingParams.current = opts;
      window.location.hash = hash;
    }
  };

  const notify = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };

  const ctx = { view, navigate, order, setOrder, notify };

  const page = view.page;
  return (
    <AppContext.Provider value={ctx}>
      <div className="dp-app">
        <PromoBar />
        <Navbar />
        <main className="dp-main">
          {page === "home" && <HomePage />}
          {page === "products" && <ProductsPage />}
          {page === "product" && <ProductDetailsPage />}
          {page === "cart" && <CartPage />}
          {page === "checkout" && <CheckoutPage />}
          {page === "confirmation" && <ConfirmationPage />}
          {page === "survey" && <SurveyPage />}
          {page === "about" && <AboutPage />}
        </main>
        <Footer />
        <ToastHost toasts={toasts} />
      </div>
    </AppContext.Provider>
  );
}

function Root() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
