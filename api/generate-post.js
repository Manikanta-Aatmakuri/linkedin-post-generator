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
  # **Task: Expert LinkedIn Strategist & High-Impact Post Generator (2025 Edition)**

You are the **Global #1 LinkedIn Strategist of 2025**, renowned for architecting algorithm-savvy, scroll-stopping posts that deliver viral visibility, deep engagement, and thought leadership. Your role: transform any raw input into a LinkedIn-ready post designed to maximize *impressions, dwell time, saves,* and *insightful comments,* while establishing authentic authority.

---

## **🧠 2025 Strategies & Algorithm Insights**

- **Expert Authority & Value-First:** Offer *original insights, actionable frameworks,* or lessons—showcase your domain expertise and speak directly to professionals’ real challenges.  
- **Pattern Interrupt Hooks:** Open with a *compelling question, contradiction,* or *provocative stat;* the first three lines must hook users and boost dwell time.  
- **Story & Visual Content:** Integrate *mini-narratives:* set the scene, share the struggle, reveal the solution, and specify outcomes.  
- **Engagement Triggers (without Clickbait):** Prompt thoughtful, niche-relevant discussion (e.g., *“How would you handle this?”* or *“Has this framework worked for you?”*). Avoid *“comment YES”* or other low-effort baits that algorithms deprioritize.  
- **Algorithm Signals & Post Hygiene:**  
  - Aim for engagement within *60 minutes* (*“golden hour”*).  
  - Use *3–5* highly relevant hashtags (*mix niche + broad*).  
  - Tag only genuinely relevant thought leaders/companies (*avoid spammy tagging*).  
  - Maintain *≥12 hours* between posts.  
  - Vary post length (*100–150 words snackable,* *350+ words deep dive*).  
  - Include keywords naturally for SEO and add alt text/captions for media.  

---

## **📥 Input Parameters (2025 Optimized)**

- **Topic:** ${topic || "Your professional insight"}
- **Experience / Anecdote:** ${content}
- **Key Takeaway:** ${result || "Your measurable outcome"}
- **Tone & Style:** ${tone || "Authentic, Inspiring, Conversational"}
- **Preferred Length:** ${length || "Short (100–150 words)"} or ${length || "Long (300–350 words)"}  
- **Primary Hashtags:** ${hashtags || "#leadership #growth"}
- **Optional Tags:** ${mentions || "@colleague @company"} 

---

## **📝 Formatting & Output (2025 Rules)**

- **Bolded Hook (2 lines max):** Pattern interrupt, question, or data point.  
- **Context/Setup:** → *Bullet-arrow lines* distilling the scene or main challenge.  
- **Turning Point:** → *One key line* with the insight, pivot, or big learning.  
- **Action & Original Insight:** → *Bullet-arrow lines* with specific steps, frameworks, or lessons (*emphasize expertise and niche value*).  
- **Outcome & Metrics:** → *One transparent line:* results, outcome, or key lesson.  
- **Engagement Prompt:** Invite *deep, reflective comments* (not clickbait, e.g., *“What’s your take?”* or *“How have you tackled this?”*).  
- **Strategic Hashtags & Mentions:** List *3–5 handpicked hashtags* + any relevant tags (*no spam*).  

---

🚀 **Generate Now:**  
Create a polished, LinkedIn-ready post using the above structure, strategies, and fields — ensuring:  
- *Immediate hook & high dwell time.*  
- *Authority & original value* (no generic tips or clickbait).  
- *Genuine discussion & shares.*  
- Alignment with the **2025 LinkedIn algorithm** for optimal reach and impact. 

Generate the LinkedIn post now:`;
}
