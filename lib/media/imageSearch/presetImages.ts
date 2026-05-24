import type { ImageSearchResult, SearchImageInput, SearchImageOutput } from "./types";

const JADID_IMAGES: Record<number, ImageSearchResult> = {
  1: {
    id: "preset:turkestan-map-1900",
    provider: "wikimedia",
    title: "Russian Turkestan in 1900",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/T%C3%BCrkistan_1900-tr.svg?width=1280",
    thumbnailUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/T%C3%BCrkistan_1900-tr.svg?width=640",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:T%C3%BCrkistan_1900-tr.svg",
    creator: "Lord Leatherface",
    license: "CC BY-SA 3.0 / GFDL",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    attributionText: "Russian Turkestan in 1900, Lord Leatherface, CC BY-SA 3.0 / GFDL",
    width: 1280,
    height: 725,
    tags: ["Turkestan", "map", "history"],
  },
  2: {
    id: "preset:muslim-school-routine",
    provider: "wikimedia",
    title: "Muslim School. School Routine",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Muslim%20School.%20School%20Routine%20WDL10758.png?width=1280",
    thumbnailUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Muslim%20School.%20School%20Routine%20WDL10758.png?width=640",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Muslim_School._School_Routine_WDL10758.png",
    creator: "World Digital Library",
    license: "Public domain",
    attributionText: "Muslim School. School Routine, World Digital Library, Public domain",
    width: 1280,
    height: 900,
    tags: ["school", "education", "Central Asia"],
  },
  3: {
    id: "preset:behbudiy-portrait",
    provider: "wikimedia",
    title: "Photograph of Mahmud Khoja Behbudiy",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Photograph_of_Mahmud_Khoja_Behbudiy.jpg?width=900",
    thumbnailUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Photograph_of_Mahmud_Khoja_Behbudiy.jpg?width=360",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Photograph_of_Mahmud_Khoja_Behbudiy.jpg",
    creator: "Unknown author",
    license: "Public domain",
    attributionText: "Photograph of Mahmud Khoja Behbudiy, Unknown author, Public domain",
    width: 648,
    height: 824,
    tags: ["Behbudiy", "portrait", "Jadid"],
  },
  4: {
    id: "preset:turkestanskie-vedomosti",
    provider: "wikimedia",
    title: "Turkestanskie Vedomosti newspaper, 1871",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/%D0%A2%D1%83%D1%80%D0%BA%D0%B5%D1%81%D1%82%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B5%20%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D0%BE%D1%81%D1%82%D0%B8%20%E2%84%9620.%2014%20%D0%B8%D1%8E%D0%BD%D1%8F%201871%20%D0%B3%D0%BE%D0%B4%D0%B0.jpg?width=1280",
    thumbnailUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/%D0%A2%D1%83%D1%80%D0%BA%D0%B5%D1%81%D1%82%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%D0%B5%20%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D0%BE%D1%81%D1%82%D0%B8%20%E2%84%9620.%2014%20%D0%B8%D1%8E%D0%BD%D1%8F%201871%20%D0%B3%D0%BE%D0%B4%D0%B0.jpg?width=480",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Turkestanskie_Vedomosti",
    creator: "Turkestanskie Vedomosti",
    license: "Public domain / Wikimedia Commons",
    attributionText: "Turkestanskie Vedomosti newspaper, Wikimedia Commons",
    width: 1267,
    height: 2000,
    tags: ["newspaper", "Turkestan", "press"],
  },
  5: {
    id: "preset:muslims-of-russia-congress-1905",
    provider: "wikimedia",
    title: "The First Congress of the Muslims of Russia, 1905",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/The_First_Congress_of_the_Muslims_of_Russia%2C_1905.jpg?width=1280",
    thumbnailUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/The_First_Congress_of_the_Muslims_of_Russia%2C_1905.jpg?width=640",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:The_First_Congress_of_the_Muslims_of_Russia,_1905.jpg",
    creator: "Unknown author",
    license: "Public domain",
    attributionText: "The First Congress of the Muslims of Russia, 1905, Unknown author, Public domain",
    width: 1280,
    height: 857,
    tags: ["Jadid", "reform", "Muslim congress", "legacy"],
  },
};

export function getPresetImageSearch(input: SearchImageInput): SearchImageOutput | null {
  if (input.lessonId !== "jadidchilik-harakati") return null;
  const selectedImage = JADID_IMAGES[input.sceneId];
  if (!selectedImage) return null;

  return {
    success: true,
    providerUsed: selectedImage.provider,
    query: selectedImage.title,
    selectedImage,
    alternatives: Object.entries(JADID_IMAGES)
      .filter(([sceneId]) => Number(sceneId) !== input.sceneId)
      .map(([, image]) => image)
      .slice(0, 4),
  };
}
