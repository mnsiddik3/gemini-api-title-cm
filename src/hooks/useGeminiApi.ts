import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MetadataResult {
  title: string;
  alternativeTitles?: string[];
  description: string;
  keywords: string[];
  category: string;
}

// Function to clean symbols and punctuation from keywords
const cleanKeywords = (keywords: string[]): string[] => {
  return keywords.map(keyword => {
    // Remove all symbols and punctuation marks, keep only letters, numbers and spaces
    return keyword.replace(/[^\w\s]/g, '').trim();
  }).filter(keyword => keyword.length > 0);
};

// Function to clean symbols and punctuation from titles
const cleanTitle = (title: string): string => {
  // Remove all punctuation marks, keep only letters, numbers and spaces
  return title.replace(/[^\w\s]/g, '').trim();
};

// Comprehensive filter to remove duplicates and synonyms
const filterUniqueKeywords = (keywords: string[]): string[] => {
  const synonymGroups = [
    ['bubble', 'bubbles', 'balloon', 'balloons'],
    ['dialogue', 'conversation', 'chat', 'talk', 'speaking', 'discussion', 'communication', 'comment'],
    ['message', 'messages', 'text', 'content'],
    ['graphic', 'graphics', 'design', 'artwork', 'illustration', 'visual', 'creative', 'art'],
    ['element', 'elements', 'component', 'components'],
    ['icon', 'icons', 'symbol', 'symbols', 'sign', 'signs'],
    ['box', 'boxes', 'container', 'containers'],
    ['template', 'templates', 'layout', 'layouts'],
    ['website', 'websites', 'web', 'site', 'sites'],
    ['shape', 'shapes', 'form', 'forms'],
    ['post', 'posts', 'posting', 'share'],
    ['presentation', 'presentations', 'slide', 'slides'],
    ['business', 'corporate', 'professional', 'commercial', 'enterprise', 'company'],
    ['modern', 'contemporary', 'current', 'new', 'fresh', 'trendy', 'stylish'],
    ['colorful', 'vibrant', 'bright', 'vivid', 'color', 'colour'],
    ['app', 'application', 'software', 'program', 'digital', 'online', 'internet'],
    ['social', 'media', 'network', 'networking'],
    ['marketing', 'branding', 'advertising', 'promotion'],
    ['banner', 'signage', 'poster', 'board'],
    ['interface', 'ui', 'ux', 'user'],
    ['vector', 'scalable', 'resolution'],
    ['flat', 'simple', 'minimal', 'clean'],
    ['abstract', 'geometric', 'pattern', 'texture'],
    ['background', 'backdrop', 'surface', 'base'],
    ['big', 'large', 'huge', 'small', 'tiny', 'mini', 'massive', 'enormous'],
    ['excellent', 'outstanding', 'premium', 'superior', 'top', 'best', 'perfect'],
    ['happy', 'joyful', 'cheerful', 'glad', 'pleased', 'excited'],
    ['create', 'make', 'build', 'produce', 'generate', 'develop'],
    ['style', 'styling', 'fashionable', 'trend'],
    ['beautiful', 'gorgeous', 'stunning', 'attractive', 'pretty'],
    ['fast', 'quick', 'rapid', 'speed']
  ];

  const filtered: string[] = [];
  const usedGroups = new Set<number>();

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    let isUnique = true;
    
    // Check against synonym groups
    for (let i = 0; i < synonymGroups.length; i++) {
      if (synonymGroups[i].some(syn => keywordLower.includes(syn) || syn.includes(keywordLower))) {
        if (usedGroups.has(i)) {
          isUnique = false;
          break;
        } else {
          usedGroups.add(i);
        }
      }
    }
    
    // Check for exact duplicates or very similar words
    if (isUnique) {
      const existsAlready = filtered.some(existing => {
        const existingLower = existing.toLowerCase();
        return existingLower === keywordLower || 
               existingLower.includes(keywordLower) || 
               keywordLower.includes(existingLower) ||
               // Check for plural/singular forms
               (existingLower + 's' === keywordLower) ||
               (keywordLower + 's' === existingLower);
      });
      
      if (!existsAlready) {
        filtered.push(keyword);
      }
    }
  }

  return filtered.slice(0, 50); // Ensure max 50 keywords
};

export const useGeminiApi = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateMetadata = async (imageFile: File, apiKey: string): Promise<MetadataResult | null> => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google Gemini API Key.",
        variant: "destructive",
      });
      return null;
    }

    const makeApiCall = async (retryCount = 0): Promise<any> => {
      try {
        // Convert image to base64
        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            // Remove data:image/...;base64, prefix
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(imageFile);
        });

        const prompt = `
          You are a professional Adobe Stock metadata generator. Analyze this image and provide:

          1. A primary professional title (6-12 words) for Adobe Stock submission
          2. Two alternative title variations (6-12 words each)  
          3. A detailed description (150-200 characters) for commercial use - if numbers are present, list them individually (1, 5, 10, 15...) not as ranges
          4. A specific category that best describes the main subject/theme of the image
          5. Exactly 50 COMPLETELY UNIQUE keywords in English for microstock sales

          IMPORTANT: First analyze the image carefully for any numbers (1, 2, 3, 4, 5) that appear in the image. If numbers are present, incorporate them naturally into the titles where relevant.

          Title requirements:
          - Professional, SEO-friendly titles for Adobe Stock
          - 6-12 words maximum
          - MUST use relevant keywords that accurately describe the image content
          - Title should precisely describe what is visible in the image
          - Use specific keywords related to the actual subject matter
          - If numbers (1, 2, 3, 4, 5) are visible in the image, include them naturally in the title
          - When multiple numbers appear, list them individually separated by commas (e.g., "1, 2, 3, 4, 5") rather than using ranges
          - NO COLONS (:) allowed in titles - use ONLY ONE hyphen (-) for meaningful separation
          - Use ONLY ONE hyphen (-) to separate main subject from style/purpose (Format: Main Subject – Style/Purpose)
          - PROHIBITED CHARACTERS in titles: & # @ ! % * () {} [] / + " ' > < (these cause SEO and search problems)
          - USE INSTEAD: "and" (not &), "to" (not /), comma (,) for lists, hyphen (-) for word joining
          - NO SPECIAL CHARACTERS allowed in titles except ONE hyphen (-), comma (,) and numbers if they appear in the image
          - Avoid keyword stuffing - use natural language
          - Must mention: Subject + Style + Content Type + Purpose
          - Content types: Logo, Poster, Seamless Pattern, Business Card, Infographic, Banner
          - Styles: Minimal, Modern, Hand-drawn, Flat, 3D, Vintage, etc.
          - Purposes: Branding, Print, Social Media, Fabric, Wallpaper, Marketing, etc.
          - Example: "Gold Anniversary Badges 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 Years – Vector Graphics for Print"
          - No generic words like "image", "photo", "picture"
          - Keywords must be relevant to actual image content, not generic terms

          Alternative titles should:
          - Offer different angles/perspectives of the same content
          - Maintain professional quality
          - Use different relevant keyword combinations for the same content
          - Follow same formatting rules (no special characters)

          KEYWORDS - ADOBE STOCK OPTIMIZATION:
          ⚠️ Generate exactly 50 COMMERCIALLY VALUABLE keywords ⚠️
          
          ADOBE STOCK KEYWORD STRATEGY:
          🎯 TARGET BUYER SEARCH BEHAVIOR: Use terms actual customers search for
          🎯 COMMERCIAL FOCUS: Prioritize business, marketing, design industry terms
          🎯 TRENDING TOPICS: Include current design trends and popular styles
          🎯 TECHNICAL TERMS: Use industry-specific vocabulary buyers recognize
          
          KEYWORD CATEGORIES (distribute across):
          📊 BUSINESS: startup, entrepreneur, finance, strategy, growth, success
          🎨 DESIGN: minimalist, typography, layout, composition, aesthetic, branding
          💼 INDUSTRY: healthcare, education, technology, retail, hospitality, legal
          🎭 EMOTION: confidence, trust, innovation, excitement, calm, energy
          📱 USAGE: mobile, responsive, interactive, user-friendly, dashboard, interface
          🌈 VISUAL: gradient, shadow, transparency, contrast, symmetry, balance
          🎪 STYLE: retro, futuristic, organic, geometric, hand-drawn, photorealistic
          📈 PURPOSE: presentation, infographic, logo, banner, advertisement, template

          VALIDATION CHECKLIST (MANDATORY):
          ✅ Check every keyword against all others
          ✅ Remove any word that could replace another in a search
          ✅ Ensure each represents COMPLETELY different concept
          ✅ No root word variations (design/designer)
          ✅ No conceptual overlaps (sunset/evening, car/vehicle)
          ✅ Maximum semantic diversity across all 50 words

          KEYWORD STRATEGY:
          - Use words from completely different industries and contexts
          - Include: materials (wood, metal, fabric), emotions (ONE only), actions (ONE only), objects, industries, purposes
          - Each keyword must target different buyer search intent
          - Spread across unrelated categories: food, travel, technology, nature, architecture, science, sports, etc.
          - Single words preferred, technical terms max 2 words

          Response format:
          TITLE- [primary professional title]
          ALT_TITLE_1- [alternative title variation 1]
          ALT_TITLE_2- [alternative title variation 2]
          DESCRIPTION- [description here]
          CATEGORY- [main category/theme like Business, Nature, Technology, People, Food, Travel, etc.]
          KEYWORDS- keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8, keyword9, keyword10, keyword11, keyword12, keyword13, keyword14, keyword15, keyword16, keyword17, keyword18, keyword19, keyword20, keyword21, keyword22, keyword23, keyword24, keyword25, keyword26, keyword27, keyword28, keyword29, keyword30, keyword31, keyword32, keyword33, keyword34, keyword35, keyword36, keyword37, keyword38, keyword39, keyword40, keyword41, keyword42, keyword43, keyword44, keyword45, keyword46, keyword47, keyword48, keyword49, keyword50

          🔥 FINAL WARNING: If ANY two keywords are similar, synonymous, or could be used interchangeably, you FAILED the task. Each must be semantically unique!
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: imageFile.type,
                    data: base64Image
                  }
                }
              ]
            }]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          
          // Check if it's a 503 error (service unavailable/overloaded)
          if (response.status === 503 && retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
            toast({
              title: "API Overloaded",
              description: `Google's API is busy. Retrying in ${delay/1000} seconds... (Attempt ${retryCount + 1}/3)`,
            });
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return makeApiCall(retryCount + 1);
          }
          
          throw new Error(`API Error: ${response.status} ${response.statusText}${errorData?.error?.message ? ` - ${errorData.error.message}` : ''}`);
        }

        return response.json();
      } catch (error) {
        if (retryCount < 3 && (error instanceof Error && error.message.includes('503'))) {
          const delay = Math.pow(2, retryCount) * 1000;
          toast({
            title: "API Overloaded",
            description: `Retrying in ${delay/1000} seconds... (Attempt ${retryCount + 1}/3)`,
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeApiCall(retryCount + 1);
        }
        throw error;
      }
    };

    try {
      const data = await makeApiCall();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from API');
      }

      // Parse the response
      const lines = text.split('\n');
      let title = '';
      let alternativeTitles: string[] = [];
      let description = '';
      let keywords: string[] = [];

      let category = '';

      lines.forEach((line: string) => {
        if (line.startsWith('TITLE-') || line.startsWith('TITLE:')) {
          title = cleanTitle(line.replace(/TITLE[-:]\s*/, '').trim());
        } else if (line.startsWith('ALT_TITLE_1-') || line.startsWith('ALT_TITLE_1:')) {
          alternativeTitles[0] = cleanTitle(line.replace(/ALT_TITLE_1[-:]\s*/, '').trim());
        } else if (line.startsWith('ALT_TITLE_2-') || line.startsWith('ALT_TITLE_2:')) {
          alternativeTitles[1] = cleanTitle(line.replace(/ALT_TITLE_2[-:]\s*/, '').trim());
        } else if (line.startsWith('DESCRIPTION-') || line.startsWith('DESCRIPTION:')) {
          description = line.replace(/DESCRIPTION[-:]\s*/, '').trim();
        } else if (line.startsWith('CATEGORY-') || line.startsWith('CATEGORY:')) {
          category = line.replace(/CATEGORY[-:]\s*/, '').trim();
        } else if (line.startsWith('KEYWORDS-') || line.startsWith('KEYWORDS:')) {
          const keywordText = line.replace(/KEYWORDS[-:]\s*/, '').trim();
          const rawKeywords = keywordText.split(',').map(k => k.trim()).filter(k => k.length > 0);
          
          // Clean symbols and punctuation from keywords
          const cleanedKeywords = cleanKeywords(rawKeywords);
          
          // Filter out duplicates and synonyms
          keywords = filterUniqueKeywords(cleanedKeywords);
        }
      });

      return { title, alternativeTitles: alternativeTitles.filter(t => t), description, keywords, category };

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error Occurred",
        description: error instanceof Error ? error.message : "API call failed",
        variant: "destructive",
      });
      return null;
    }
  };

  const generateBulkMetadata = async (imageFiles: File[], apiKey: string): Promise<MetadataResult[]> => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google Gemini API Key.",
        variant: "destructive",
      });
      return [];
    }

    setLoading(true);
    const results: MetadataResult[] = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        toast({
          title: "Processing...",
          description: `Processing image ${i + 1} of ${imageFiles.length}: ${imageFile.name}`,
        });

        const result = await generateMetadata(imageFile, apiKey);
        if (result) {
          results.push(result);
        }
      }

      toast({
        title: "Success!",
        description: `Generated metadata for ${results.length} images successfully.`,
      });

      return results;

    } catch (error) {
      console.error('Bulk processing error:', error);
      toast({
        title: "Error Occurred",
        description: error instanceof Error ? error.message : "Bulk processing failed",
        variant: "destructive",
      });
      return results; // Return partial results
    } finally {
      setLoading(false);
    }
  };

  return { generateMetadata, generateBulkMetadata, loading };
};