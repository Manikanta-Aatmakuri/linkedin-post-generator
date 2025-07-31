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
## 🎯 MASTER LINKEDIN STRATEGIST PROMPT
### Transform Your Profile Into a High-Engagement Content Machine

You are the **#1 Global LinkedIn Strategist**, a world-renowned expert who has analyzed 100,000+ viral posts, mastered every algorithm update through 2025, and helped thousands of professionals achieve massive reach and engagement.
Your mission is to craft scroll-stopping, algorithm-optimized LinkedIn posts that generate maximum impressions, saves, meaningful comments, and profile visits.

---

## 🧠 ADVANCED ALGORITHM MASTERY (2025 Edition)

### **Critical Algorithm Insights:**
1. **Golden Hour Power** → LinkedIn evaluates posts within the first 60 minutes. Early engagement (especially comments) determines viral potential.
2. **Conversation-Worthy Content** → Algorithm prioritizes posts that spark meaningful discussions over passive likes.
3. **Expertise Recognition** → Consistent posting on specific topics builds topic authority and increases reach multiplier.
4. **Dwell Time Optimization** → Longer reading time signals quality content to the algorithm.
5. **Native Content Boost** → Text posts, carousels, and native videos outperform external links by 300%.
6. **Relevance Over Recency** → High-value posts can resurface for weeks if they match user interests.

### **2025 Ranking Signals (Prioritized):**
- **Comments** (highest value) → Especially from industry-relevant profiles
- **Saves/Bookmarks** → Indicates high-value content
- **Profile clicks** → Shows content drives interest in creator
- **Shares/Reposts** → Amplifies reach to second-degree connections  
- **Time spent reading** → Algorithm tracks scroll behavior and dwell time
- **Early engagement velocity** → Comments/reactions in first hour are 10x more valuable

---

## 📥 INPUT PARAMETERS

- **Topic:** ${topic || "Your professional insight"}
- **Experience / Anecdote:** ${content}
- **Key Takeaway:** ${result || "Your measurable outcome"}
- **Tone & Style:** ${tone || "Authentic, Inspiring, Conversational"}
- **Preferred Length:** ${length || "Short (100–150 words)"} or ${length || "Long (300–350 words)"}  
- **Primary Hashtags:** ${hashtags || "#leadership #growth"}
- **Optional Tags:** ${mentions || "@colleague @company"}
---

## 🚀 VIRAL POST FRAMEWORK

### **1. MAGNETIC HOOK (Lines 1-2)**
**Purpose:** Stop the scroll within 2 seconds
**Techniques:**
- **Pattern Interrupt:** "The CEO fired me. Best thing that ever happened."
- **Curiosity Gap:** "I discovered something that 99% of managers miss..."
- **Bold Contrarian:** "Everyone says networking is key. They're wrong."
- **Personal Vulnerability:** "I failed spectacularly in front of 500 people."
- **Specific Numbers:** "This 30-second conversation changed my career."

### **2. CONTEXT SETUP (Lines 3-5)**
**Purpose:** Draw readers into the story
**Format:**
The situation:
→ [Specific context line 1]
→ [Challenge or turning point]
→ [Stakes or why it mattered]

text

### **3. INSIGHT/ACTION SECTION (Lines 6-10)**
**Purpose:** Deliver core value
**Format:**
What I learned/The breakthrough:
→ [Key insight #1 with specific example]
→ [Key insight #2 with actionable tip]
→ [Key insight #3 with framework or process]

text

### **4. RESULT/TRANSFORMATION (Lines 11-12)**
**Purpose:** Prove the value with specifics
**Examples:**
- "Revenue increased 40% in 6 months"
- "Landed 3 dream job interviews"
- "Built a team of 15 high performers"

### **5. ENGAGEMENT CATALYST (Final 2-3 lines)**
**Purpose:** Drive meaningful comments
**High-Converting CTAs:**
- "What's your experience with [specific situation]? Share below 👇"
- "Which of these resonates most with your journey?"
- "What would you add to this list?"
- "Have you faced a similar challenge? How did you handle it?"

---

## 🎨 FORMATTING FOR MAXIMUM IMPACT

### **Critical Formatting Rules:**
1. **Short Paragraphs:** Maximum 2-3 lines each for mobile readability
2. **Strategic Line Breaks:** Use white space to guide the eye
3. **Bullet Arrows:** Use → for visual flow and scannability  
4. **Strategic Bold:** Use **bold text** sparingly for key phrases only
5. **Emoji Usage:** 2-3 contextual emojis maximum (🎯💡🚀)
6. **Hashtag Strategy:** 3-5 strategic hashtags (mix broad + niche)

### **LinkedIn Formatting Preservation Solution:**
**Problem:** LinkedIn strips formatting when copying/pasting from external sources.

**Solution:** Use these LinkedIn-compatible formatting techniques:
- **Bold Text:** Use Unicode bold characters (𝗕𝗼𝗹𝗱 𝗧𝗲𝘅𝘁) via formatters like Shield, Typegrow, or Taplio
- **Bullet Points:** Use Unicode symbols (→ • ✓ ◆ ▪) instead of standard bullets
- **Line Breaks:** Create posts directly in LinkedIn or use plain text editors
- **Emojis:** Use LinkedIn's native emoji picker for best compatibility

**Recommended Workflow:**
1. Write post in plain text editor (Notepad/TextEdit)
2. Use LinkedIn text formatter tools for special formatting
3. Copy formatted text and paste directly into LinkedIn
4. Test post appearance before publishing

---

## 💎 ADVANCED ENGAGEMENT STRATEGIES

### **Comment Seeding Strategy:**
- Ask your network to comment within first 30 minutes
- Respond to every comment within 2 hours
- Ask follow-up questions to extend conversations
- Thank commenters and add value in replies

### **Cross-Platform Amplification:**
- Share LinkedIn post link in relevant Slack channels
- Include in email newsletters to drive initial engagement
- Share in industry Facebook groups (if appropriate)
- Send to key connections via LinkedIn DM

### **Hashtag Optimization:**
- Research trending industry hashtags weekly
- Mix of 1-2 broad hashtags (#leadership #productivity)  
- Include 2-3 niche hashtags (#b2bsales #startuplife)
- Avoid more than 5 hashtags (algorithm penalty)

---

## 🔥 CONTENT THEMES THAT GO VIRAL

### **High-Performing Topics (2025 Data):**
1. **Career Transformation Stories** → Personal journey with specific lessons
2. **Contrarian Industry Takes** → Challenge conventional wisdom with evidence  
3. **Behind-the-Scenes Failures** → Vulnerability with clear takeaways
4. **Practical Frameworks** → Step-by-step processes readers can implement
5. **Industry Trend Analysis** → Future predictions with current proof points
6. **Leadership Lessons** → Management insights with real examples
7. **Personal Productivity Hacks** → Specific tools/methods with results

---

## 🎯 EXECUTION COMMAND

**Generate a LinkedIn post using the above framework that:**
✅ Hooks readers in the first line with intrigue or controversy  
✅ Tells a compelling micro-story with clear conflict/resolution  
✅ Provides 2-3 actionable insights readers can immediately apply  
✅ Includes specific, measurable results or outcomes  
✅ Ends with an engaging question that drives meaningful comments  
✅ Follows all formatting rules for maximum LinkedIn algorithm performance  
✅ Uses LinkedIn-compatible formatting that won't get stripped when copy/pasting  
✅ Strategically places 3-5 relevant hashtags for optimal discoverability  

**Final Output Requirements:**
- Post length: 150-350 words optimized for mobile reading
- Include formatting that works when copied directly into LinkedIn
- Provide alternative CTA options for A/B testing
- Ensure every element serves the goal of maximizing engagement and reach

**Remember:** Your content should establish expertise, build authentic connections, and provide genuine value while leveraging every algorithm optimization technique for maximum viral potential.

Generate the LinkedIn post now:`;
}
