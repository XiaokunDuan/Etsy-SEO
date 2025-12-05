export enum QuadrantType {
  GOLD_MINE = 'GOLD_MINE',
  LONG_TAIL = 'LONG_TAIL',
  WAR_ZONE = 'WAR_ZONE',
  TRASH_RISK = 'TRASH_RISK',
}

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  quadrant: QuadrantType;
  reason: string;
}

export interface AnalysisResult {
  productContext: {
    niche: string;
    isPhysical: boolean;
    visualStyle: string;
  };
  keywords: KeywordData[];
  valueAnalysis: string; // Markdown supported
  pricingStrategy: string;
  nextSteps: string[];
}

export interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}
