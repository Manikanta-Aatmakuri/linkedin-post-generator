🚀 LinkedIn Post Generator with AI
A powerful LinkedIn post generator that uses Google Gemini AI to create engaging, professional posts optimized for maximum engagement.

✨ Features
AI-Powered Generation: Uses Google Gemini 2.0 Flash for cutting-edge content creation
Multiple Tones: Professional, Personal, Educational, and Motivational
Engagement Optimized: Follows proven LinkedIn engagement strategies
One-Click Copy: Easy copy-to-clipboard functionality
Mobile Responsive: Works perfectly on all devices
Fast & Reliable: Deployed on Vercel's global CDN
🛠️ Deployment Instructions
Prerequisites
Google Cloud account with Gemini API access
Vercel account (free)
GitHub account
Step 1: Get Gemini API Key
Go to Google AI Studio
Create a new API key
Copy the API key (keep it secure!)
Step 2: Prepare Your Files
Create a new folder with these files:

linkedin-generator/
├── index.html          (Main frontend file)
├── api/
│   └── generate-post.js (Serverless function)
├── package.json        (Dependencies)
├── vercel.json         (Vercel config)
└── README.md           (This file)
Step 3: Deploy to Vercel
Option A: GitHub Deployment (Recommended)
Create a new GitHub repository
Upload all the files to your repository
Go to vercel.com and sign up/login
Click "New Project"
Import your GitHub repository
Add Environment Variable:
Name: GEMINI_API_KEY
Value: Your Gemini API key
Click "Deploy"
Option B: Direct Upload
Install Vercel CLI: npm i -g vercel
Run vercel in your project folder
Follow the prompts
Add environment variable:
bash
vercel env add GEMINI_API_KEY
Then paste your API key
Step 4: Configure Environment Variables
In your Vercel dashboard:

Go to your project
Click "Settings" tab
Click "Environment Variables"
Add: GEMINI_API_KEY = your-actual-api-key
Redeploy the project
🔧 Local Development
Clone the repository
Install dependencies: npm install
Create .env.local file:
GEMINI_API_KEY=your-api-key-here
Run development server: vercel dev
Open http://localhost:3000
📁 File Structure
index.html: Frontend interface with modern UI
api/generate-post.js: Serverless function handling Gemini API calls
vercel.json: Vercel configuration for deployment
package.json: Project dependencies and scripts
🎯 LinkedIn Strategies Implemented
Bold Opening Statements: Attention-grabbing first lines
Single Line Formatting: Easy-to-read structure
Personal Insights: Authentic storytelling
Clear Call-to-Actions: Encourages engagement
Strategic Hashtags: Improves discoverability
🔒 Security Features
API keys stored securely in environment variables
CORS properly configured
Input validation and sanitization
Error handling for all API calls
💡 Usage Tips
Be Specific: Provide detailed context in your input
Include Results: Mention specific outcomes when possible
Choose Right Tone: Match the tone to your audience
Edit if Needed: Use the generated post as a starting point
📊 API Limits
Google Gemini 2.0 Flash Free Tier:

15 requests per minute
1 million tokens per day
Enhanced reasoning and creativity
Perfect for thousands of high-quality posts daily
🐛 Troubleshooting
Post not generating?

Check if GEMINI_API_KEY is set correctly
Verify API key is valid in Google AI Studio
Check browser console for errors
Deployment issues?

Ensure all files are in correct folders
Verify environment variables are set
Check Vercel function logs
🚀 Going Live
Your app will be available at: https://your-project-name.vercel.app

You can also add a custom domain in Vercel settings.

🤝 Contributing
Feel free to submit issues and enhancement requests!

📄 License
MIT License - feel free to use this for your projects!

Built with ❤️ using Google Gemini 2.0 Flash AI and Vercel

