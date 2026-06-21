import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize server-side Gemini client securely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  });
});

// secure endpoint for AI Assistance using official @google/genai SDK
app.post('/api/ai/process', async (req, res) => {
  const { type, args } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    return res.status(200).json({ 
      error: 'API key not configured in secrets. Falling back to native client-side AI simulations.',
      result: null 
    });
  }

  try {
    const comName = args?.companyName || 'the assigned company';
    const docName = args?.documentName || 'Attachment document';
    const investorName = args?.investorName || 'the Investor';
    const caseTitle = args?.caseTitle || '';
    const caseId = args?.caseId || '';

    let prompt = '';
    
    switch (type) {
      case 'summarize':
        prompt = `You are "Wakeel AI Assistant" configured for a premium UAE Local Service Agent CRM platform. 
Summarize are relevant administrative risk points, liabilities and compliance clauses of a UAE corporate establishment document called "${docName}" for the company: "${comName}". 
Keep the summary to 3-4 professional bullet points, using bold text, structured with beautiful visual spacing. Focus on LSA financial liability and trade licensing rules.`;
        break;

      case 'dates':
        prompt = `You are a compliance AI assistant. Extract the license expiry date or document expiry date from general document parameters. 
Based on today's baseline date of 2026-06-20, if a license has 14 days left or expires soon, suggest and format the extracted date in "YYYY-MM-DD" format. 
Also supply the LSA renewal date (typically 30-60 days before license expiry). Formulate the responses in short, neat text with bold dates.`;
        break;

      case 'remind_ar':
        prompt = `اكتب رسالة تذكير احترافية ورسمية باللغة العربية موجهة للمستثمر "${investorName}" بخصوص اقتراب موعد انتهاء رخصة شركة "${comName}" بتاريخ انتهاء تجريبي هو ${new Date().toISOString().split('T')[0]}.
اطلب منه بأدب وسرعة تزويد مكتب وكيل الخدمات المحلي بالأوراق المطلوبة (عقد الإيجار الموثق أو الهويات المحدثة) لتوقيع الأوراق الإجرائية وتجنب غرامات بلدية دبي ومخالفات الهوية والجنسية.`;
        break;

      case 'remind_en':
        prompt = `Write a formal, premium, and direct business email reminder in English to the investor "${investorName}" regarding their company "${comName}" whose trade license is expiring soon inside the next 14 days. 
Request them politely to submit the updated tenancy contract / Ejari and partner passports to avoid municipal penalties or immigration locks. Label it as coming from the compliance office of their Local Service Agent (LSA).`;
        break;

      case 'risk_summary':
        prompt = `Perform a rules-based compliance audit analysis of company "${comName}" which has trade license, service agent relations, other records. 
Detail why this company is listed with compliance risks, specifically if their investor has not responded or has overdue annual fees. Structure it with absolute clarity, highlighting actionable items to protect the Local Service Agent from government regulatory citations.`;
        break;

      case 'missing_docs':
        prompt = `Draft a checklist of recommended corporate documents to request from a newly onboarded UAE company "${comName}" of legal form "${args?.legalForm || 'LLC'}" operating in Emirate "${args?.emirate || 'Dubai'}" to secure compliance. 
Include standards like Ejari, MOA amendments, Corporate Tax Registration copy, and Ultimate Beneficial Owner (UBO) list.`;
        break;

      case 'unresponsive_msg':
        prompt = `Draft an escalative, firm, yet legally compliant warning message in both English and Arabic (parallel paragraphs) to be sent to investor "${investorName}" of "${comName}". 
The message notifies them that they have not responded for more than 14 days to urgent renewal requests and that the Local Service Agent (LSA) intends to initiate formal retirement/withdrawal procedures via the Department of Economy and Tourism (DET) portal to release themselves of legal liability.`;
        break;

      case 'offboard_report':
        prompt = `Generate a formal LSA administrative offboarding review report for the case: "${caseTitle}" (ID: ${caseId}) of company "${comName}". 
Structure the report with a clean letterhead feel, stating the main cause: investor unresponsive or fee dispute or business liquidation. Itemize 4 procedural steps already completed to secure our liability records before legal representative transfer.`;
        break;

      default:
        prompt = 'Provide a general helpful UAE company compliance tip for local service agents.';
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are 'Wakeel AI', the secure compliance intelligence assistant embedded inside 'Wakeel Aman (وكيل آمن)', a UAE platform for Local Service Agents (LSA). Your tone is highly professional, respectful, administrative, accurate, and structured. You must always explicitly state that AI-generated dates and records require human verification, you never provide official legal conclusions, and you comply with UAE data minimizing best practices."
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Gemini processing collapsed:', error);
    res.status(500).json({ error: error?.message || 'Internal AI service error.' });
  }
});

// Configure Vite or production static serving
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wakeel Aman running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
