import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const model = "gemini-3-flash-preview";

      const tools: Tool[] = [{
        functionDeclarations: [{
          name: "log_tool_request",
          description: "Logs a request from a user for a new calculator or tool to be added to the directory.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              toolName: { type: SchemaType.STRING, description: "The name of the requested tool." },
              description: { type: SchemaType.STRING, description: "What the tool should do." }
            },
            required: ["toolName", "description"]
          }
        }]
      }];
      
      const modelInstance = genAI.getGenerativeModel({
        model: model,
        systemInstruction: `You are "Astro", the official AI guide for AICalculator.shop. 
          Your mission is three-fold:
          1. Q&A: Explain how our various calculators work (BMI, Mortgage, LLM Arbitrage, etc.). Help users interpret results.
          2. CUSTOMER SERVICE: Assist with Pro subscription questions, points system, and troubleshooting.
          3. LEAD GEN & FEEDBACK: Proactively ask users what new tools or logic they want added to the directory. If they have a request, call log_tool_request and acknowledge it enthusiastically.

          Tone: Cyberpunk, tech-forward, helpful, and energetic. Use terms like "Sovereign stack", "Arbitrage", "Inference", "Neon-ready".
          
          Context about the current page: ${context || 'General Site'}.
           AICalculator.shop is a directory of 50+ free utilities with a focus on AI cost reduction via CostImplodeAI.
          `,
        tools: tools,
      });
      
      const chat = modelInstance.startChat();
      const sendResult = await chat.sendMessage(message);
      const response = sendResult.response;

      // Check for function calls
      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === "log_tool_request") {
            const { toolName, description } = call.args as any;
            console.log(`[USER REQUEST] New Tool Request: ${toolName} - ${description}`);
            
            // Execute the tool response in the chat
            const toolResponseResult = await chat.sendMessage([{
              functionResponse: {
                name: "log_tool_request",
                response: { status: "logged", message: "Tool request successfully queued for logic-engineers." }
              }
            }]);
            
            return res.json({ response: toolResponseResult.response.text(), requestLogged: true, toolName });
          }
        }
      }

      res.json({ response: response.text() });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
  });

  // Feedback Collection Route (Lead Gen)
  app.post("/api/feedback", async (req, res) => {
    try {
      const { type, content, email } = req.body;
      console.log(`[FEEDBACK] Type: ${type}, Email: ${email}, Content: ${content}`);
      // In a real app, this would save to a database.
      res.json({ status: "success", message: "Feedback received. Our logic-engineers are on it." });
    } catch (error) {
      res.status(500).json({ error: "Failed to process feedback" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
