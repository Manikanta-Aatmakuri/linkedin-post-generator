// api/generate-post.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, content, result, tone, length, hashtags, mentions } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Create the prompt for Gemini
    const prompt = createLinkedInPrompt(topic, content, result, tone, length, hashtags, mentions);

    // Call Gemini 2.0 Flash API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return res.status(500).json({ error: 'Failed to generate post' });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return res.status(500).json({ error: 'Invalid response from AI' });
    }

    const generatedPost = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ 
      post: generatedPost,
      success: true 
    });

  } catch (error) {
    console.error('Error in generate-post:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

function createLinkedInPrompt(topic, content, result, tone, length, hashtags, mentions) {
  const toneInstructions = {
    professional: "professional, inspiring, and business-focused",
    personal: "personal, authentic, and relatable", 
    educational: "educational, informative, and value-driven",
    motivational: "motivational, energetic, and encouraging"
  };

  const lengthInstructions = {
    short: "100-150 words (concise and punchy)",
    medium: "200-250 words (balanced detail)",
    long: "300-350 words (comprehensive and detailed)"
  };

  const currentTone = toneInstructions[tone] || "professional and engaging";
  const currentLength = lengthInstructions[length] || "200-250 words (balanced detail)";

  return `
## 🎯 Task: Expert LinkedIn Strategist & High-Impact Post Generator

You are **Global #1 LinkedIn Strategist**, renowned for crafting scroll-stopping, algorithm-optimized posts that drive massive impressions, saves, and comments. 
Your mission is to transform my raw input into compelling LinkedIn content that hooks readers in the first two seconds, leverages LinkedIn's latest ranking signals, and sparks meaningful conversations.

---

**🧠 STRATEGIES & ALGORITHM INSIGHTS**  
1. **Hook & Pattern Interrupt** – Begin with a striking question, bold fact, or paradox.  
2. **Story-Driven Structure** – Use mini narratives: set the scene, reveal conflict, share insight, and close with a clear result.  
3. **Value-First Format** – Embed actionable tips, frameworks, or hacks readers can apply immediately.  
4. **Engagement Triggers** – End with an open-ended question or "share your story" call-to-action.  
5. **Algorithm Signals**  
   - Encourage early comments within the first 60 minutes.  
   - Use 3–5 relevant hashtags (mix of niche + broad).  
   - Tag one or two influencers or companies when appropriate.  
   - Vary post length: 100–150 words for quick reads; 300–350+ words for deep dives.  
6. **Readability & Emojis** – Short paragraphs, bullet arrows (→), line breaks, and 2–3 contextual emojis to guide the eye.

---

**📥 INPUT PARAMETERS**  
- **Topic:** ${topic || "Your professional insight"}  
- **Experience / Anecdote:** ${content}  
- **Key Takeaway:** ${result || "Your measurable outcome"}  
- **Tone & Style:** ${currentTone}  
- **Preferred Length:** ${currentLength}  
- **Primary Hashtags:** ${hashtags || "#leadership #growth"}  
- **Optional Tags:** ${mentions || "@colleague @company"}  

---

**📝 FORMATTING & OUTPUT**  
1. **Bold Opening Hook** (≤ two lines)  
2. **Context / Setup**  
   → One or two bullet-arrow lines describing the scenario.  
3. **Challenge or Turning Point**  
   → One line that highlights the obstacle or insight trigger.  
4. **Action & Insight**  
   → Two to three bullet-arrow lines with clear, actionable advice or frameworks.  
5. **Result & Impact**  
   → One line with metrics or specific outcome.  
6. **Engagement Prompt**  
   - Ask a reflective or opinion-driven question.  
7. **Hashtags & Mentions**  
   - List 3–5 strategic hashtags.  
   - Include any tags beneath.

---

**🚀 IMPORTANT**  
Produce a polished LinkedIn post using the above structure, strategies, and inputs. Ensure it:  
- Hooks in the first 2 seconds.  
- Balances authenticity with practical value.  
- Drives saves, shares, and comments.  
- Aligns with LinkedIn's evolving algorithm for maximum reach.

Generate the LinkedIn post now:`;
}
