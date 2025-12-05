import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, QuadrantType } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productContext: {
      type: Type.OBJECT,
      properties: {
        niche: { type: Type.STRING, description: "Identified niche (e.g., Cottagecore, Desk Decor)" },
        isPhysical: { type: Type.BOOLEAN, description: "True if physical item, False if digital/pattern" },
        visualStyle: { type: Type.STRING, description: "Brief description of style/color/usage" },
      },
      required: ["niche", "isPhysical", "visualStyle"],
    },
    keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING },
          searchVolume: { type: Type.NUMBER },
          competition: { type: Type.NUMBER },
          quadrant: {
            type: Type.STRING,
            enum: ["GOLD_MINE", "LONG_TAIL", "WAR_ZONE", "TRASH_RISK"],
            description: "Classification based on volume vs competition",
          },
          reason: { type: Type.STRING, description: "Brief reason for classification" },
        },
        required: ["keyword", "searchVolume", "competition", "quadrant", "reason"],
      },
    },
    valueAnalysis: {
      type: Type.STRING,
      description: "Detailed analysis of why Gold/Long Tail keywords are valuable for this specific image. Markdown format.",
    },
    pricingStrategy: {
      type: Type.STRING,
      description: "Pricing suggestions based on market data or perceived value. Markdown format.",
    },
    nextSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 5-10 specific new keywords to search next.",
    },
  },
  required: ["productContext", "keywords", "valueAnalysis", "pricingStrategy", "nextSteps"],
};

const keywordsSuggestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 15-20 distinct search keywords ranging from broad to specific.",
    },
  },
  required: ["suggestions"],
};

export const generateInitialKeywords = async (imagesBase64: string[]): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Role: Etsy SEO Specialist.
    Task: Analyze the uploaded product images. Identify the item, its style (e.g., Boho, Minimalist), material, and potential usage.
    Output: Generate a list of 15-20 distinct keyword phrases I should type into a keyword research tool (like eRank or Etsy Search) to find data.
    Strategy:
    1. Start with 3-4 broad terms (e.g., "Ceramic Mug").
    2. Add 5-6 niche specific terms (e.g., "Strawberry Cow Mug", "Cottagecore Coffee Cup").
    3. Add 5-6 occasion/recipient terms (e.g., "Gift for Gamer", "Office Desk Decor").
    4. Ensure terms are relevant to Physical Products if the image looks like one.
    Language: English (as Etsy SEO is primarily English based).
  `;

  const imageParts = imagesBase64.map(base64 => ({
    inlineData: { mimeType: "image/jpeg", data: base64 }
  }));

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: {
        parts: [...imageParts, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: keywordsSuggestionSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const result = JSON.parse(text);
    return result.suggestions || [];
  } catch (error) {
    console.error("Keyword generation failed:", error);
    throw new Error("Failed to generate keywords.");
  }
};

export const analyzeSeoData = async (
  imagesBase64: string[],
  rawData: string
): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";

  // Safeguard: Truncate raw data if it's excessively large (e.g. > 60k chars) to prevent XHR errors
  // while keeping enough data for analysis.
  const MAX_TEXT_LENGTH = 60000;
  const cleanedData = rawData.length > MAX_TEXT_LENGTH 
    ? rawData.substring(0, MAX_TEXT_LENGTH) + "\n...[Data Truncated for Analysis Safety]" 
    : rawData;

  const prompt = `
    Role: You are an expert Etsy SEO Data Analyst and Product Strategy Consultant.
    Language: Chinese (Simplified).
    
    Task:
    1. Analyze the uploaded product images to identify the niche, style, and usage. These images represent the product(s) being sold.
    2. Parse the provided Raw Data (which may be unstructured text from eRank/Etsy) to extract keywords, search volume, and competition numbers.
    3. Filter: If the image is a Physical Item, flag keywords like "Pattern", "PDF", "Digital", "Download" as 'TRASH_RISK'.
    4. Classify keywords into 4 Quadrants:
       - GOLD_MINE (💎): High Search Volume (>1000/mo recommended, but relative), Low Competition.
       - LONG_TAIL (🎯): Low Search, Low Competition (Specific, high conversion).
       - WAR_ZONE (⚔️): High Search, High Competition (Hard to rank).
       - TRASH_RISK (❌): Low Search + High Comp OR Wrong Intent (Digital terms for physical items).
    5. Provide value analysis and pricing strategy suggestions.
    6. Suggest 5-10 new keywords to research based on style/occasion gaps.

    Raw Data to parse:
    ${cleanedData}
  `;

  // Create image parts for all uploaded images
  // Images are now compressed JPEGs from FileUpload component
  const imageParts = imagesBase64.map(base64 => ({
    inlineData: { mimeType: "image/jpeg", data: base64 }
  }));

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: {
        parts: [
          ...imageParts,
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a helpful, professional, and data-driven Etsy SEO expert communicating in Chinese.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze data. Try removing some text or using fewer images.");
  }
};
