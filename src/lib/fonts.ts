import {
  Source_Serif_4,
  Source_Sans_3,
  Fraunces,
  Work_Sans,
  Lora,
  Nunito_Sans,
  Archivo,
  DM_Serif_Display,
  DM_Sans,
  Cormorant_Garamond,
  Manrope,
  Playfair_Display,
  Karla,
  Sora,
  JetBrains_Mono,
  Spectral,
  Public_Sans,
  Outfit,
  IBM_Plex_Sans,
  Figtree,
} from "next/font/google";

export const sourceSerif4 = Source_Serif_4({ subsets: ["latin"], variable: "--f-source-serif" });
export const sourceSans3 = Source_Sans_3({ subsets: ["latin"], variable: "--f-source-sans" });

export const fraunces = Fraunces({ subsets: ["latin"], variable: "--f-fraunces", style: ["italic", "normal"] });
export const workSans = Work_Sans({ subsets: ["latin"], variable: "--f-work-sans" });

export const lora = Lora({ subsets: ["latin"], variable: "--f-lora" });
export const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--f-nunito-sans" });

export const archivo = Archivo({ subsets: ["latin"], variable: "--f-archivo" });

export const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], variable: "--f-dm-serif", weight: "400" });
export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--f-dm-sans" });

export const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--f-cormorant", weight: ["500", "600", "700"] });
export const manrope = Manrope({ subsets: ["latin"], variable: "--f-manrope" });

export const playfair = Playfair_Display({ subsets: ["latin"], variable: "--f-playfair" });
export const karla = Karla({ subsets: ["latin"], variable: "--f-karla" });

export const sora = Sora({ subsets: ["latin"], variable: "--f-sora" });
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-jetbrains" });

export const spectral = Spectral({ subsets: ["latin"], variable: "--f-spectral", weight: ["400", "500", "600"] });
export const publicSans = Public_Sans({ subsets: ["latin"], variable: "--f-public-sans" });

export const outfit = Outfit({ subsets: ["latin"], variable: "--f-outfit" });
export const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--f-ibm-plex-sans" });
export const figtree = Figtree({ subsets: ["latin"], variable: "--f-figtree" });
