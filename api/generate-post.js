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
    const { topic, content, result, tone } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Create the prompt for Gemini
    const prompt = createLinkedInPrompt(topic, content, result, tone);

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

function createLinkedInPrompt(topic, content, result, tone) {
  const toneInstructions = {
    professional: "professional, inspiring, and business-focused",
    personal: "personal, authentic, and relatable", 
    educational: "educational, informative, and value-driven",
    motivational: "motivational, energetic, and encouraging"
  };

  const currentTone = toneInstructions[tone] || "professional and engaging";

  return `You are an expert LinkedIn content creator. Create a highly engaging LinkedIn post using these specific strategies:

**MANDATORY STRATEGIES:**
1. **Open with a bold statement or confession** - Start with something attention-grabbing
2. **Break information into single lines** - Use short, punchy lines for readability
3. **Share personal insights and stories** - Make it relatable and valuable
4. **Close with a clear call to action** - Ask a question to encourage comments
5. **Use strategic formatting** - Use arrows (→), emojis, and line breaks

**INPUT DETAILS:**
- Topic: ${topic || 'Professional experience'}
- Story/Experience: ${content}
- Specific Result: ${result || 'Not specified'}
- Tone: ${currentTone}

**FORMATTING REQUIREMENTS:**
- Start with a bold, attention-grabbing opening line
- Use single lines separated by line breaks
- Include 2-3 relevant emojis (don't overuse)
- Use arrows (→) for key points
- End with an engaging question
- Add 3-5 relevant hashtags at the end
- Keep total length under 1300 characters

**EXAMPLE STRUCTURE:**
[Bold opening statement]

The situation:
→ [Context line 1]
→ [Context line 2]

What I learned:
→ [Key insight 1]  
→ [Key insight 2]
→ [Key insight 3]

The result:
→ [Outcome or impact]

[Engaging question for comments]

#Hashtag1 #Hashtag2 #Hashtag3

**IMPORTANT:** Make it authentic, valuable, and conversation-starting. Focus on the human element and practical insights others can use.

Generate the LinkedIn post now:`;
}
