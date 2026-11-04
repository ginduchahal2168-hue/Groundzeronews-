import { GoogleGenAI, Type } from '@google/genai';
import type { SupportedLanguage } from '../src/types/index.ts';
import { LANGUAGE_MAP } from '../src/constants/languages.ts';

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface RawRssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category?: string;
  imageUrl?: string;
}

export interface ProcessedAiArticle {
  headline: string;
  summary: string;
  fullBody: string;
  category: string;
  tags: string[];
  verificationStatus: 'confirmed' | 'developing' | 'investigative' | 'official_release';
  isDuplicate: boolean;
  duplicateOfId?: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  initialTranslations: Record<
    string,
    {
      headline: string;
      summary: string;
      seoTitle: string;
      seoDescription: string;
    }
  >;
}

export async function processNewsItemsWithAi(
  items: RawRssItem[],
  existingHeadlines: string[]
): Promise<ProcessedAiArticle[]> {
  if (!ai) {
    console.warn('[GeminiService] GEMINI_API_KEY is not configured. Falling back to heuristic processing.');
    return items.map((item) => ({
      headline: item.title.replace(/ - [^-]+$/, '').trim(),
      summary: item.description.replace(/<[^>]*>?/gm, '').slice(0, 320) + '...',
      fullBody: item.description.replace(/<[^>]*>?/gm, ''),
      category: item.category || 'World News',
      tags: ['Verified Feed', 'Ground Zero Ingest'],
      verificationStatus: 'confirmed',
      isDuplicate: false,
      seoTitle: item.title,
      seoDescription: item.description.replace(/<[^>]*>?/gm, '').slice(0, 155),
      keywords: ['news', 'breaking news', 'world'],
      initialTranslations: {},
    }));
  }

  try {
    const prompt = `You are the Chief AI News Architect for GROUND ZERO NEWS ("Truth First. News Everywhere.").
Analyze these freshly fetched raw news reports. Follow strict editorial guidelines:
1. NEVER generate fake news or hallucinate facts, dates, names, or statistics.
2. Filter out duplicates based on these existing headlines:
${JSON.stringify(existingHeadlines.slice(0, 15))}
3. For each unique valid news report, create:
   - A factual, authoritative headline (original wording, no clickbait).
   - A concise, objective 2-3 paragraph summary preserving all verifiable facts.
   - An expanded factual article body synthesized strictly from the source facts.
   - Assign the most appropriate category from:
     ['Breaking News', 'India News', 'World News', 'Punjab News', 'Assam News', 'Politics', 'Business', 'Economy', 'Technology', 'Artificial Intelligence', 'Science', 'Sports', 'Entertainment', 'Education', 'Health', 'Crime', 'Defence', 'Agriculture', 'Weather', 'Lifestyle', 'Viral News', 'Opinion', 'Exclusive Reports'].
   - Assign verificationStatus: 'confirmed' or 'developing'.
   - Generate SEO title, meta description (<160 chars), and 5 keywords.
   - Provide accurate translations in Punjabi ('pa'), Hindi ('hi'), and Urdu ('ur').

Raw Items:
${JSON.stringify(
  items.slice(0, 5).map((it) => ({
    title: it.title,
    snippet: it.description.slice(0, 400),
    source: it.source,
  }))
)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a senior digital news editor for an international multi-lingual wire service. Output pristine factual journalism and valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              fullBody: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              verificationStatus: { type: Type.STRING },
              isDuplicate: { type: Type.BOOLEAN },
              seoTitle: { type: Type.STRING },
              seoDescription: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              initialTranslations: {
                type: Type.OBJECT,
                properties: {
                  pa: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      seoTitle: { type: Type.STRING },
                      seoDescription: { type: Type.STRING },
                    },
                    required: ['headline', 'summary'],
                  },
                  hi: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      seoTitle: { type: Type.STRING },
                      seoDescription: { type: Type.STRING },
                    },
                    required: ['headline', 'summary'],
                  },
                  ur: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      seoTitle: { type: Type.STRING },
                      seoDescription: { type: Type.STRING },
                    },
                    required: ['headline', 'summary'],
                  },
                },
              },
            },
            required: [
              'headline',
              'summary',
              'fullBody',
              'category',
              'verificationStatus',
              'isDuplicate',
              'seoTitle',
              'seoDescription',
            ],
          },
        },
      },
    });

    const jsonText = response.text || '[]';
    const parsed = JSON.parse(jsonText) as ProcessedAiArticle[];
    return parsed;
  } catch (error) {
    console.error('[GeminiService] Error processing news batch:', error);
    // Fallback gracefully so the system never breaks
    return items.map((item) => ({
      headline: item.title.replace(/ - [^-]+$/, '').trim(),
      summary: item.description.replace(/<[^>]*>?/gm, '').slice(0, 320) + '...',
      fullBody: item.description.replace(/<[^>]*>?/gm, ''),
      category: item.category || 'World News',
      tags: ['Verified Feed', 'Ground Zero News'],
      verificationStatus: 'confirmed',
      isDuplicate: false,
      seoTitle: item.title,
      seoDescription: item.description.replace(/<[^>]*>?/gm, '').slice(0, 155),
      keywords: ['news', 'breaking'],
      initialTranslations: {},
    }));
  }
}

export async function translateArticleWithAi(
  headline: string,
  summary: string,
  fullBody: string,
  targetLanguage: SupportedLanguage
): Promise<{
  headline: string;
  summary: string;
  fullBody: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}> {
  const langInfo = LANGUAGE_MAP[targetLanguage] || { name: targetLanguage, nativeName: targetLanguage };

  if (!ai) {
    return {
      headline: `[${langInfo.nativeName}] ${headline}`,
      summary: `[${langInfo.nativeName} translation preview] ${summary}`,
      fullBody: `[${langInfo.nativeName} translation preview]\n\n${fullBody}`,
      seoTitle: `${headline} - Ground Zero News (${langInfo.name})`,
      seoDescription: summary.slice(0, 150),
      keywords: ['news', langInfo.name.toLowerCase()],
    };
  }

  const prompt = `Translate this news article faithfully and professionally into ${langInfo.name} (${langInfo.nativeName}).
Preserve all factual accuracy, proper nouns, dates, quotations, and journalistic gravitas. Use proper native script and natural journalistic idioms.

Original English Headline:
${headline}

Original English Summary:
${summary}

Original English Body:
${fullBody.slice(0, 1500)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert bilingual journalist translating wire reports into ${langInfo.name}. Return valid JSON.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            fullBody: { type: Type.STRING },
            seoTitle: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['headline', 'summary', 'fullBody', 'seoTitle', 'seoDescription'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      headline: parsed.headline || headline,
      summary: parsed.summary || summary,
      fullBody: parsed.fullBody || fullBody,
      seoTitle: parsed.seoTitle || `${headline} | Ground Zero News`,
      seoDescription: parsed.seoDescription || summary.slice(0, 150),
      keywords: parsed.keywords || ['news'],
    };
  } catch (error) {
    console.error(`[GeminiService] Translation error for ${targetLanguage}:`, error);
    return {
      headline: `[${langInfo.nativeName}] ${headline}`,
      summary: `[${langInfo.nativeName}] ${summary}`,
      fullBody: `[${langInfo.nativeName}]\n\n${fullBody}`,
      seoTitle: `${headline} - Ground Zero News (${langInfo.name})`,
      seoDescription: summary.slice(0, 150),
      keywords: ['news', langInfo.name.toLowerCase()],
    };
  }
}
