export type ImageSearchProviderName =
  | "wikimedia"
  | "openverse"
  | "pexels"
  | "unsplash"
  | "placeholder";

export type SceneVisualType =
  | "map"
  | "portrait"
  | "newspaper"
  | "school"
  | "timeline"
  | "quote"
  | "infographic"
  | "general";

export type ImageSearchResult = {
  id: string;
  provider: ImageSearchProviderName;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  creator?: string;
  license?: string;
  licenseUrl?: string;
  attributionText?: string;
  width?: number;
  height?: number;
  score?: number;
  tags?: string[];
};

export type SearchImageInput = {
  lessonId: string;
  sceneId: number;
  topic: string;
  sceneTitle: string;
  sceneDescription: string;
  visualType: SceneVisualType;
  preferredLanguage?: "uz" | "en" | "ru";
};

export type SearchImageOutput = {
  success: boolean;
  providerUsed: string;
  query: string;
  selectedImage: ImageSearchResult;
  alternatives: ImageSearchResult[];
  warning?: string;
};

export type ImageSearchProvider = {
  name: ImageSearchProviderName;
  isAvailable: () => boolean;
  search: (query: string, input: SearchImageInput) => Promise<ImageSearchResult[]>;
};
