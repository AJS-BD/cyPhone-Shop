export type PhoneSpec = {
  ram: string;
  storage: string;
  display: string;
  chipset: string;
  camera: string;
  battery: string;
  os: string;
};
export type PhoneReview = {
  stars: number;
  text: string;
  source: string;
};
export type Phone = {
  name: string;
  keys: string[];
  description: string[];
  specs: PhoneSpec;
  reviews: PhoneReview[];
};
export const UNKNOWN = "—";
export const PHONES: Phone[] = [
  {
    name: "Samsung Galaxy S25",
    keys: ["galaxy s25", "s25"],
    description: [
      "Flagship Galaxy with a 6.2 inch 120Hz AMOLED display.",
      "Snapdragon 8 Elite power with a 50MP triple camera.",
      "Compact, fast and built for Galaxy AI.",
    ],
    specs: {
      ram: "12 GB",
      storage: "128 / 256 / 512 GB",
      display: "6.2 inch Dynamic AMOLED 2X, 120Hz",
      chipset: "Snapdragon 8 Elite",
      camera: "50MP + 12MP + 10MP (3x tele)",
      battery: "4000 mAh",
      os: "Android 15, One UI 7",
    },
    reviews: [
      { stars: 5, text: "Small in hand, huge on performance.", source: "TechRadar (sample)" },
      { stars: 5, text: "Battery lasts a full day without stress.", source: "GSMArena (sample)" },
      { stars: 4, text: "Great cameras, charging could be faster.", source: "The Verge (sample)" },
    ],
  },
  {
    name: "Apple iPhone 16 Pro",
    keys: ["iphone 16 pro", "16 pro", "iphone 16"],
    description: [
      "Pro power with the A18 Pro chip.",
      "48MP Fusion camera and 5x optical zoom.",
      "Titanium build with a 6.3 inch ProMotion display.",
    ],
    specs: {
      ram: "8 GB",
      storage: "128 / 256 / 512 GB / 1 TB",
      display: "6.3 inch Super Retina XDR OLED, 120Hz",
      chipset: "Apple A18 Pro",
      camera: "48MP Fusion + 48MP Ultra Wide + 12MP 5x Tele",
      battery: "3582 mAh",
      os: "iOS 18",
    },
    reviews: [
      { stars: 5, text: "The A18 Pro is absurdly fast.", source: "TechRadar (sample)" },
      { stars: 5, text: "Camera Control changes how I shoot.", source: "The Verge (sample)" },
      { stars: 4, text: "Battery improved, no charger in the box.", source: "GSMArena (sample)" },
    ],
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    keys: ["galaxy s24 ultra", "s24 ultra"],
    description: [
      "The big Galaxy with a 200MP camera and S Pen.",
      "Titanium frame and flat 6.8 inch display.",
      "Seven years of updates, built to last.",
    ],
    specs: {
      ram: "12 GB",
      storage: "256 / 512 GB / 1 TB",
      display: "6.8 inch Dynamic AMOLED 2X, 120Hz",
      chipset: "Snapdragon 8 Gen 3",
      camera: "200MP + 12MP + 50MP 5x + 10MP 3x Tele",
      battery: "5000 mAh",
      os: "Android 14, One UI 6.1",
    },
    reviews: [
      { stars: 5, text: "The S Pen is still unmatched.", source: "GSMArena (sample)" },
      { stars: 5, text: "Zoom that actually reaches far.", source: "The Verge (sample)" },
      { stars: 4, text: "Big and heavy, but it earns it.", source: "TechRadar (sample)" },
    ],
  },
  {
    name: "Google Pixel 9 Pro",
    keys: ["pixel 9 pro", "pixel 9", "google pixel"],
    description: [
      "The smartest Pixel with Gemini AI built in.",
      "Best-in-class computational photography.",
      "Clean Android with years of updates.",
    ],
    specs: {
      ram: "16 GB",
      storage: "128 / 256 / 512 GB / 1 TB",
      display: "6.3 inch LTPO OLED, 120Hz",
      chipset: "Google Tensor G4",
      camera: "50MP + 48MP Ultra Wide + 48MP 5x Tele",
      battery: "4700 mAh",
      os: "Android 14",
    },
    reviews: [
      { stars: 5, text: "The cleanest Android experience.", source: "TechRadar (sample)" },
      { stars: 5, text: "Photos look stunning in any light.", source: "GSMArena (sample)" },
      { stars: 4, text: "Tensor is fast enough for daily work.", source: "The Verge (sample)" },
    ],
  },
  {
    name: "OnePlus 12",
    keys: ["oneplus 12", "oneplus"],
    description: [
      "Flagship speed with 100W fast charging.",
      "Hasselblad-tuned triple camera system.",
      "Big 5400 mAh battery in a sleek body.",
    ],
    specs: {
      ram: "12 / 16 GB",
      storage: "256 / 512 GB",
      display: "6.82 inch LTPO AMOLED, 120Hz",
      chipset: "Snapdragon 8 Gen 3",
      camera: "50MP + 48MP Ultra Wide + 64MP 3x Tele",
      battery: "5400 mAh",
      os: "Android 14, OxygenOS 14",
    },
    reviews: [
      { stars: 5, text: "Charges to full before breakfast.", source: "GSMArena (sample)" },
      { stars: 4, text: "Great display, huge battery.", source: "TechRadar (sample)" },
      { stars: 4, text: "Software is snappy and clean.", source: "The Verge (sample)" },
    ],
  },
];
export function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function findPhone(query: string): Phone | null {
  const q = normalize(query);
  if (!q) return null;
  for (const phone of PHONES) {
    for (const key of phone.keys) {
      const k = normalize(key);
      if (q.includes(k) || k.includes(q)) {
        return phone;
      }
    }
  }
  return null;
}
export function fallbackPhone(name: string): Phone {
  return {
    name: name,
    keys: [],
    description: [
      "Specs for this model are coming soon.",
      "Sample layout shown below.",
    ],
    specs: {
      ram: UNKNOWN,
      storage: UNKNOWN,
      display: UNKNOWN,
      chipset: UNKNOWN,
      camera: UNKNOWN,
      battery: UNKNOWN,
      os: UNKNOWN,
    },
    reviews: [
      { stars: 5, text: "A solid everyday phone for the price.", source: "TechRadar (sample)" },
      { stars: 4, text: "Reliable performance and clean software.", source: "GSMArena (sample)" },
      { stars: 4, text: "Good value, waiting on a full review.", source: "The Verge (sample)" },
    ],
  };
}
export function resolvePhone(query: string): Phone {
  const found = findPhone(query);
  return found !== null ? found : fallbackPhone(query.trim());
}
