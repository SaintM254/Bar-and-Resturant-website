// Starting menu, copied from the website's original dishes & prices.
// The admin page can change all of this later without touching code.

export function seedMenuItems() {
  const dish = (pexelsId, name, desc, priceKES, category) => ({
    id: slugify(name),
    name,
    desc,
    priceKES,
    pexelsId,
    imageUrl: null, // optional override: paste any image URL to replace the photo
    category, // featured | grill | sides | mornings
    available: true,
  });

  return [
    // --- Featured (front page favourites) ---
    dish(37575745, "Grilled Chicken", "Charcoal-grilled free-range chicken, hand-cut chips and house kachumbari.", 850, "featured"),
    dish(30350296, "Beef Steak & Chips", "Seared sirloin with rosemary butter and golden chips.", 1250, "featured"),
    dish(35532828, "Swahili Coconut Fish", "Tilapia simmered in a gentle coastal coconut curry, served with rice.", 1100, "featured"),
    dish(28674660, "Chicken Biryani", "Fragrant basmati layered with spiced chicken, finished with cool raita.", 850, "featured"),
    dish(31261500, "Vegetable Pasta", "Garden vegetables folded through a slow-cooked tomato sugo.", 750, "featured"),
    dish(36869502, "Beef Burger & Chips", "Flame-grilled beef, toasted brioche and smoked tomato relish.", 900, "featured"),
    dish(9725989, "Fish & Chips", "Crisp-battered fillet with tartare sauce and a wedge of lemon.", 950, "featured"),
    dish(8480760, "Kenyan Breakfast", "Eggs your way, grilled sausage, mandazi and tropical fruit.", 650, "featured"),
    dish(13640505, "Fresh Passion Juice", "Hand-pressed passionfruit, served chilled.", 300, "featured"),
    dish(37662777, "House Cocktail", "Our bartender's daily pour with Kenyan citrus and honey.", 650, "featured"),
    // --- From the Charcoal Grill ---
    dish(37575747, "Beef Nyama Choma · 500g", "Slow-grilled over charcoal, with ugali and sukuma wiki.", 1150, "grill"),
    dish(12932200, "Whole Grilled Tilapia", "Lake-fresh, with coconut rice and charred lime.", 1300, "grill"),
    // --- Sides & Small Plates ---
    dish(38615181, "Masala Chips", "Tossed in warm coastal spices.", 350, "sides"),
    dish(5393660, "Kachumbari Salad", "Tomato, red onion, fresh coriander and lime.", 300, "sides"),
    dish(14883759, "Vegetable Samosas · 3", "Crisp pastry with a mild garden filling.", 400, "sides"),
    // --- Mornings ---
    dish(7332985, "Mandazi & Chai", "Fresh mandazi with spiced Kenyan tea.", 250, "mornings"),
    dish(36701454, "Tropical Fruit Plate", "Mango, pineapple, pawpaw and passionfruit.", 450, "mornings"),
  ];
}

export function seedDrinks() {
  const drink = (name, desc, priceKES) => ({
    id: slugify(name),
    name,
    desc,
    priceKES,
    available: true,
  });

  return [
    drink("Dawa", "Kenya's classic — vodka, honey and lime over crushed ice.", 700),
    drink("House Cocktail", "The bartender's daily pour, built on local citrus.", 650),
    drink("Tusker Lager", "Ice-cold Kenyan lager, straight from the tap.", 400),
    drink("Iced Coffee", "A double shot over ice, gently sweetened.", 350),
    drink("Fresh Juice", "Passion, mango or pineapple, pressed to order.", 300),
    drink("Sparkling Water", "Chilled, with a lime wedge.", 180),
  ];
}

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/·/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function seedGallery() {
  const photo = (file, caption, category, position) => ({
    id: file.replace(/\.jpg$/, ""),
    caption,
    category,
    path: `/gallery/${file}`,
    position,
    visible: true,
  });

  return [
    photo("restaurant-1.jpg", "The dining room at dusk", "Restaurant", 1),
    photo("restaurant-2.jpg", "Nyama choma over charcoal", "Restaurant", 2),
    photo("bar-1.jpg", "Dawa hour at the bar", "Bar", 3),
    photo("bar-2.jpg", "Chai, poured the slow way", "Bar", 4),
    photo("rooms-1.jpg", "Quiet rooms upstairs", "Rooms", 5),
    photo("rooms-2.jpg", "Breakfast in bed, Kenyan style", "Rooms", 6),
    photo("outdoors-1.jpg", "Sundowners under the acacia", "Outdoors", 7),
    photo("outdoors-2.jpg", "The lantern-lit courtyard", "Outdoors", 8),
  ];
}
