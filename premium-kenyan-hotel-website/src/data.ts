import { SITE } from "./site";
import heroImg from "./assets/hero.jpg";

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Bar", href: "#bar" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export interface MenuItem {
  id?: string;
  name: string;
  desc: string;
  price: string;
  img: string;
  thumb: string;
  available?: boolean;
}

/* Full-bleed / editorial images */
const px = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/* Dish popup photo — compressed 4:3 crop, light to load */
const pxd = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=880&h=660&fit=crop`;

/* Menu thumbnail — tiny square crop for fast loading */
const pxt = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&fit=crop`;

const dish = (
  id: number,
  name: string,
  desc: string,
  price: string
): MenuItem => ({ name, desc, price, img: pxd(id), thumb: pxt(id) });

export const FEATURED_MENU: MenuItem[] = [
  dish(
    37575745,
    "Grilled Chicken",
    "Charcoal-grilled free-range chicken, hand-cut chips and house kachumbari.",
    "KSh 850"
  ),
  dish(
    30350296,
    "Beef Steak & Chips",
    "Seared sirloin with rosemary butter and golden chips.",
    "KSh 1,250"
  ),
  dish(
    35532828,
    "Swahili Coconut Fish",
    "Tilapia simmered in a gentle coastal coconut curry, served with rice.",
    "KSh 1,100"
  ),
  dish(
    28674660,
    "Chicken Biryani",
    "Fragrant basmati layered with spiced chicken, finished with cool raita.",
    "KSh 850"
  ),
  dish(
    31261500,
    "Vegetable Pasta",
    "Garden vegetables folded through a slow-cooked tomato sugo.",
    "KSh 750"
  ),
  dish(
    36869502,
    "Beef Burger & Chips",
    "Flame-grilled beef, toasted brioche and smoked tomato relish.",
    "KSh 900"
  ),
  dish(
    9725989,
    "Fish & Chips",
    "Crisp-battered fillet with tartare sauce and a wedge of lemon.",
    "KSh 950"
  ),
  dish(
    8480760,
    "Kenyan Breakfast",
    "Eggs your way, grilled sausage, mandazi and tropical fruit.",
    "KSh 650"
  ),
  dish(
    13640505,
    "Fresh Passion Juice",
    "Hand-pressed passionfruit, served chilled.",
    "KSh 300"
  ),
  dish(
    37662777,
    "House Cocktail",
    "Our bartender's daily pour with Kenyan citrus and honey.",
    "KSh 650"
  ),
];

export const EXTRA_MENU: { group: string; items: MenuItem[] }[] = [
  {
    group: "From the Charcoal Grill",
    items: [
      dish(
        37575747,
        "Beef Nyama Choma · 500g",
        "Slow-grilled over charcoal, with ugali and sukuma wiki.",
        "KSh 1,150"
      ),
      dish(
        12932200,
        "Whole Grilled Tilapia",
        "Lake-fresh, with coconut rice and charred lime.",
        "KSh 1,300"
      ),
    ],
  },
  {
    group: "Sides & Small Plates",
    items: [
      dish(38615181, "Masala Chips", "Tossed in warm coastal spices.", "KSh 350"),
      dish(
        5393660,
        "Kachumbari Salad",
        "Tomato, red onion, fresh coriander and lime.",
        "KSh 300"
      ),
      dish(
        14883759,
        "Vegetable Samosas · 3",
        "Crisp pastry with a mild garden filling.",
        "KSh 400"
      ),
    ],
  },
  {
    group: "Mornings",
    items: [
      dish(
        7332985,
        "Mandazi & Chai",
        "Fresh mandazi with spiced Kenyan tea.",
        "KSh 250"
      ),
      dish(
        36701454,
        "Tropical Fruit Plate",
        "Mango, pineapple, pawpaw and passionfruit.",
        "KSh 450"
      ),
    ],
  },
];

export const BAR_DRINKS: (Omit<MenuItem, "img" | "thumb"> & { id?: string })[] = [
  {
    name: "Dawa",
    desc: "Kenya's classic — vodka, honey and lime over crushed ice.",
    price: "KSh 700",
  },
  {
    name: "House Cocktail",
    desc: "The bartender's daily pour, built on local citrus.",
    price: "KSh 650",
  },
  {
    name: "Tusker Lager",
    desc: "Ice-cold Kenyan lager, straight from the tap.",
    price: "KSh 400",
  },
  {
    name: "Iced Coffee",
    desc: "A double shot over ice, gently sweetened.",
    price: "KSh 350",
  },
  {
    name: "Fresh Juice",
    desc: "Passion, mango or pineapple, pressed to order.",
    price: "KSh 300",
  },
  {
    name: "Sparkling Water",
    desc: "Chilled, with a lime wedge.",
    price: "KSh 180",
  },
];

export const CONTACT = {
  address: SITE.address,
  city: SITE.city,
  phone: SITE.phone,
  email: SITE.email,
  hours: SITE.hours,
  barHours: SITE.barHours,
};

export const IMAGES = {
  hero: heroImg,
  restaurant: px(279768, 1400),
  grillFood: px(18330967, 1200),
  morningTable: px(18071816, 1200),
  bar: px(1872888, 1400),
  room: px(7746092, 1400),
  breakfast: px(22458433, 900),
  guests: px(6210437, 900),
};
