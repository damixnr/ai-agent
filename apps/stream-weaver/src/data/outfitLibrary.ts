export type Occasion =
  | "office"
  | "weekend"
  | "evening"
  | "date-night"
  | "wedding"
  | "festival"
  | "travel"
  | "athleisure";

export interface OutfitSuggestion {
  id: string;
  title: string;
  mood: string;
  palette: string[];
  heroPieces: string[];
  accessories: string[];
  stylingNotes: string;
  sustainabilityTip?: string;
}

export interface OutfitBundle {
  occasion: Occasion;
  weather?: "warm" | "cool" | "transitional" | "all-weather";
  bodyFocus?: string;
  budgetLevel: "saver" | "classic" | "investment";
  options: OutfitSuggestion[];
}

export const OUTFIT_LIBRARY: OutfitBundle[] = [
  {
    occasion: "office",
    weather: "all-weather",
    bodyFocus: "tailored structure",
    budgetLevel: "classic",
    options: [
      {
        id: "office-classic-1",
        title: "Textured Neutral Power Suit",
        mood: "Grounded and composed",
        palette: ["stone", "ivory", "deep teal"],
        heroPieces: [
          "Stone double-breasted blazer with subtle herringbone",
          "Cropped straight-leg trousers in coordinating stone",
          "Silk knit shell in deep teal"
        ],
        accessories: [
          "Polished leather belt with matte gold buckle",
          "Two-tone loafers",
          "Minimalist hoop earrings"
        ],
        stylingNotes:
          "Anchor the look with tonal layers. Half-tuck the shell to elongate the waist, and cuff the trouser hem to showcase the loafer. Finish with a sleek ponytail or low bun for clean lines.",
        sustainabilityTip:
          "Consider blazer and trousers made from recycled wool blends or deadstock fabrics."
      },
      {
        id: "office-classic-2",
        title: "Modern Monochrome Capsule",
        mood: "Quiet luxury",
        palette: ["charcoal", "slate", "silver"],
        heroPieces: [
          "Charcoal knit midi dress with mock neck",
          "Cropped charcoal jacket with sculpted shoulders",
          "Opaque slate tights"
        ],
        accessories: [
          "Pointed block-heel ankle boots",
          "Silver torque necklace",
          "Structured pebble leather tote"
        ],
        stylingNotes:
          "Lean into tonal contrast by mixing matte and sheen fabrics. Add a single statement accessory, like a chrome hair clip, for subtle edge.",
        sustainabilityTip:
          "Opt for tights with certified recycled nylon and boots from a repair-friendly brand."
      }
    ]
  },
  {
    occasion: "festival",
    weather: "warm",
    bodyFocus: "freedom of movement",
    budgetLevel: "saver",
    options: [
      {
        id: "festival-saver-1",
        title: "Breezy Crochet Layers",
        mood: "Artful and playful",
        palette: ["sage", "cream", "burnt orange"],
        heroPieces: [
          "Crochet tank in sage",
          "Wide-leg woven shorts",
          "Packable utility vest"
        ],
        accessories: [
          "Lightweight hiking boots",
          "Foldable sun hat",
          "Layered beaded bracelets"
        ],
        stylingNotes:
          "Mix airy textures with functional layers. Clip a mini carabiner pouch to the vest for festival essentials and finish with SPF mist for midday touch-ups.",
        sustainabilityTip:
          "Choose crochet knits from community artisans or recycled cotton blends."
      },
      {
        id: "festival-saver-2",
        title: "Graphic Jumpsuit Remix",
        mood: "Bold and energetic",
        palette: ["cobalt", "black", "electric yellow"],
        heroPieces: [
          "Stretch jumpsuit with abstract print",
          "Mesh longline cardi",
          "Convertible belt bag"
        ],
        accessories: [
          "Platform sneakers",
          "Mirrored sunglasses",
          "Bandana scarf"
        ],
        stylingNotes:
          "Layer mesh over prints to let color peek through. Use the belt bag as a crossbody for hands-free dancing and tie the bandana around your neck after sunset.",
        sustainabilityTip:
          "Rent the jumpsuit or choose one made from recycled polyester to keep the print vibrant longer."
      }
    ]
  }
];
