export interface FlavorTextBlock {
  headline: string[];
  description: string;
  side: "left" | "right";
}

export interface Flavor {
  id: string;
  name: string;
  modelPath: string;
  textBlocks: FlavorTextBlock[];
}

export const FLAVORS: Flavor[] = [
  {
    id: "belgium",
    name: "Belgium",
    modelPath: "/Models/compressed/chocobar.glb",
    textBlocks: [
      {
        headline: ["CRAFTED", "WITH", "LOVE"],
        description:
          "Every bar is hand-dipped in rich Belgian chocolate, made with passion by our artisans in small batches.",
        side: "left",
      },
      {
        headline: ["BELGIAN", "DARK", "CHOCOLATE"],
        description:
          "A generous 70% cacao shell that cracks perfectly with each bite, revealing the treasure within.",
        side: "right",
      },
      {
        headline: ["CRISPY", "CARAMEL", "CRUNCH"],
        description:
          "Golden caramelized rice pearls scattered across the surface add that satisfying crunch you crave.",
        side: "left",
      },
      {
        headline: ["PURE", "VANILLA", "CREAM"],
        description:
          "Madagascar vanilla bean ice cream churned to silky perfection, the heart of every choco bar.",
        side: "right",
      },
      {
        headline: ["EXPERIENCE", "PURE", "BLISS"],
        description:
          "From the first crack of chocolate to the last creamy spoonful, indulge in a moment of pure happiness.",
        side: "left",
      },
    ],
  },
  {
    id: "coco",
    name: "Coco",
    modelPath: "/Models/compressed/cocochoc.glb",
    textBlocks: [
      {
        headline: ["CRAFTED", "WITH", "LOVE"],
        description:
          "Every bar is hand-dipped in creamy milk chocolate, made with passion by our artisans in small batches.",
        side: "left",
      },
      {
        headline: ["COCO", "MILK", "CHOCOLATE"],
        description:
          "A silky smooth shell crafted from premium milk cacao that melts on your tongue.",
        side: "right",
      },
      {
        headline: ["TOASTED", "COCONUT", "BITS"],
        description:
          "Delicate flakes of toasted coconut scattered across the surface for a tropical twist.",
        side: "left",
      },
      {
        headline: ["CREAMY", "COCO", "KULFI"],
        description:
          "Rich coconut kulfi churned to silky perfection, the heart of every choco bar.",
        side: "right",
      },
      {
        headline: ["EXPERIENCE", "PURE", "BLISS"],
        description:
          "From the first bite of chocolate to the last creamy spoonful, indulge in a moment of pure happiness.",
        side: "left",
      },
    ],
  },
  {
    id: "dark",
    name: "Dark",
    modelPath: "/Models/compressed/darkchocolate.glb",
    textBlocks: [
      {
        headline: ["CRAFTED", "WITH", "LOVE"],
        description:
          "Every bar is hand-dipped in intense dark chocolate, made with passion by our artisans in small batches.",
        side: "left",
      },
      {
        headline: ["RICH", "DARK", "CHOCOLATE"],
        description:
          "An 85% cacao shell with deep, complex notes that unfold with every single bite.",
        side: "right",
      },
      {
        headline: ["HAZELNUT", "CRUNCH", "BLISS"],
        description:
          "Roasted hazelnut pieces scattered across the surface add that nutty crunch you crave.",
        side: "left",
      },
      {
        headline: ["SMOOTH", "CHOCO", "KULFI"],
        description:
          "Dark chocolate kulfi churned to silky perfection, the heart of every choco bar.",
        side: "right",
      },
      {
        headline: ["EXPERIENCE", "PURE", "BLISS"],
        description:
          "From the first crack of chocolate to the last creamy spoonful, indulge in a moment of pure happiness.",
        side: "left",
      },
    ],
  },
  {
    id: "alphonso",
    name: "Alphonso",
    modelPath: "/Models/compressed/Alphonso.glb",
    textBlocks: [
      {
        headline: ["CRAFTED", "WITH", "LOVE"],
        description:
          "Every bar is hand-dipped in golden white chocolate, made with passion by our artisans in small batches.",
        side: "left",
      },
      {
        headline: ["SUN-KISSED", "ALPHONSO", "MANGO"],
        description:
          "A luscious white chocolate shell infused with the essence of India's finest Alphonso mangoes.",
        side: "right",
      },
      {
        headline: ["JUICY", "MANGO", "BITS"],
        description:
          "Real Alphonso mango pieces scattered across the surface for bursts of tropical flavor.",
        side: "left",
      },
      {
        headline: ["ROYAL", "MANGO", "KULFI"],
        description:
          "Alphonso mango kulfi churned to silky perfection, the heart of every choco bar.",
        side: "right",
      },
      {
        headline: ["EXPERIENCE", "PURE", "BLISS"],
        description:
          "From the first bite of white chocolate to the last creamy spoonful, indulge in a moment of pure happiness.",
        side: "left",
      },
    ],
  },
  {
    id: "malai",
    name: "Malai",
    modelPath: "/Models/compressed/malaialmond.glb",
    textBlocks: [
      {
        headline: ["CRAFTED", "WITH", "LOVE"],
        description:
          "Every bar is hand-dipped in velvety milk chocolate, made with passion by our artisans in small batches.",
        side: "left",
      },
      {
        headline: ["MALAI", "ALMOND", "DELIGHT"],
        description:
          "A creamy milk chocolate shell studded with roasted California almonds for a luxurious crunch.",
        side: "right",
      },
      {
        headline: ["CRUNCHY", "ALMOND", "BITS"],
        description:
          "Hand-picked roasted almonds scattered across the surface add that satisfying bite you crave.",
        side: "left",
      },
      {
        headline: ["SAFFRON", "MALAI", "KULFI"],
        description:
          "Saffron-infused malai kulfi churned to silky perfection, the heart of every choco bar.",
        side: "right",
      },
      {
        headline: ["EXPERIENCE", "PURE", "BLISS"],
        description:
          "From the first crack of chocolate to the last creamy spoonful, indulge in a moment of pure happiness.",
        side: "left",
      },
    ],
  },
];
