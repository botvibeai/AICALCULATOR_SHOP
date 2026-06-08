import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import { 
  getSiteMarkdown, 
  getAuthMdContent, 
  getOpenApiSchema, 
  getApiCatalog, 
  getMcpServerCard, 
  getAgentSkillsIndex 
} from "./src/services/agentDiscovery";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // RFC 8288 Link response headers and Markdown content negotiation middleware
  app.use((req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader(
      "Link", 
      `</.well-known/api-catalog>; rel="api-catalog", </auth.md>; rel="registration", </.well-known/mcp/server-card.json>; rel="mcp-server-card"`
    );
    
    // Markdown Negotiation: If agent accepts text/markdown, serve page in Markdown format
    if (req.headers.accept && req.headers.accept.includes("text/markdown") && (req.path === "/" || req.path === "/index.html")) {
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("x-markdown-tokens", "1200");
      return res.send(getSiteMarkdown(baseUrl));
    }
    next();
  });

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

  // --- START AGENT-READINESS AND DISCOVERY ENDPOINTS ---

  // Standard health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Catalog (RFC 9727) returning application/linkset+json
  app.get("/.well-known/api-catalog", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "application/linkset+json; charset=utf-8");
    res.json(getApiCatalog(baseUrl));
  });

  // OpenID Connect (OIDC) Discovery Metadata
  app.get("/.well-known/openid-configuration", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/api/auth/authorize`,
      token_endpoint: `${baseUrl}/api/auth/token`,
      userinfo_endpoint: `${baseUrl}/api/auth/userinfo`,
      jwks_uri: `${baseUrl}/api/auth/certs`,
      response_types_supported: ["code", "token", "id_token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "email", "profile"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
      claims_supported: ["iss", "sub", "aud", "exp", "iat", "name", "email"]
    });
  });

  // OAuth 2.0 Authorization Server Metadata
  app.get("/.well-known/oauth-authorization-server", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/api/auth/authorize`,
      token_endpoint: `${baseUrl}/api/auth/token`,
      jwks_uri: `${baseUrl}/api/auth/certs`,
      scopes_supported: ["openid", "email", "profile", "api:read"],
      response_types_supported: ["code", "token"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
      agent_auth: {
        register_uri: `${baseUrl}/api/agents/register`,
        identity_types: ["agent_public_key", "assertion"],
        credential_types: ["jwt_bearer_token"],
        claims_supported: ["iss", "sub", "aud", "exp"]
      }
    });
  });

  // OAuth Protected Resource Metadata
  app.get("/.well-known/oauth-protected-resource", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({
      resource: `${baseUrl}/api/`,
      authorization_servers: [baseUrl],
      scopes_supported: ["openid", "email", "profile", "api:write", "api:read"]
    });
  });

  // MCP Server Card (SEP-1649)
  app.get("/.well-known/mcp/server-card.json", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(getMcpServerCard(baseUrl));
  });

  // Agent Skills Index
  app.get("/.well-known/agent-skills/index.json", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(getAgentSkillsIndex(baseUrl));
  });

  // auth.md instructions
  app.get("/auth.md", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(getAuthMdContent(baseUrl));
  });

  // OpenAPI spec
  app.get("/openapi.json", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(getOpenApiSchema(baseUrl));
  });

  // HTML API Documentation
  app.get("/docs/api", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AICalculator.shop - API Reference</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f1f5f9; padding: 2.5rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    h1 { color: #38bdf8; font-weight: 800; border-bottom: 2px solid #1e293b; padding-bottom: 1rem; }
    h2 { color: #f472b6; margin-top: 2rem; }
    code { background: #1e293b; padding: 0.2rem 0.4rem; rounded: 4px; font-family: monospace; font-size: 0.9em; }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .card { background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: 1.5rem; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <h1>AICalculator.shop Agent-Ready API Guide</h1>
  <p>Our platform is meticulously constructed with dynamic links, structured content negotiation, and discovery manifests specifically engineered to allow AI Agents to interact with our resources programmatically.</p>
  
  <div class="card">
    <h2>Available Endpoints</h2>
    <ul>
      <li><strong>API Catalog (RFC 9727):</strong> <a href="/.well-known/api-catalog">/.well-known/api-catalog</a></li>
      <li><strong>OIDC Configuration:</strong> <a href="/.well-known/openid-configuration">/.well-known/openid-configuration</a></li>
      <li><strong>OAuth Auth Server:</strong> <a href="/.well-known/oauth-authorization-server">/.well-known/oauth-authorization-server</a></li>
      <li><strong>OAuth Protected Resource:</strong> <a href="/.well-known/oauth-protected-resource">/.well-known/oauth-protected-resource</a></li>
      <li><strong>MCP Server Card (SEP-1649):</strong> <a href="/.well-known/mcp/server-card.json">/.well-known/mcp/server-card.json</a></li>
      <li><strong>Agent Skills Index:</strong> <a href="/.well-known/agent-skills/index.json">/.well-known/agent-skills/index.json</a></li>
      <li><strong>Agent Registration (auth.md):</strong> <a href="/auth.md">/auth.md</a></li>
      <li><strong>OpenAPI Spec (JSON):</strong> <a href="/openapi.json">/openapi.json</a></li>
    </ul>
  </div>
</body>
</html>`);
  });

  // Dynamic placeholders for OAuth/OIDC Client endpoints to complete the flow
  app.post("/api/agents/register", (req, res) => {
    res.json({
      client_id: "agent_9845_abc",
      client_secret: "sec_76359_xyz",
      registration_client_uri: `${req.protocol}://${req.get("host")}/api/agents/register/agent_9845_abc`
    });
  });

  app.post("/api/auth/token", (req, res) => {
    res.json({
      access_token: "mock_jwt_access_token_for_ai_agents",
      token_type: "Bearer",
      expires_in: 3600,
      scope: req.body.scope || "api:read"
    });
  });

  app.get("/api/auth/userinfo", (req, res) => {
    res.json({
      sub: "agent_9845_abc",
      name: "Autonomous Agent Evaluator",
      email: "agent@aicalculator.shop"
    });
  });

  // MCP JSON-RPC over HTTP/SSE support
  const mcpSessions = new Map<string, any>();

  app.get("/api/mcp/sse", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    const sessionId = Math.random().toString(36).substring(2, 15);
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    
    // Server-Sent Event for MCP dynamic endpoint routing
    res.write(`event: endpoint\ndata: ${baseUrl}/api/mcp/message?id=${sessionId}\n\n`);

    mcpSessions.set(sessionId, res);

    req.on("close", () => {
      mcpSessions.delete(sessionId);
    });
  });

  app.post("/api/mcp/message", (req, res) => {
    const sessionId = req.query.id as string;
    const body = req.body;
    
    if (body && body.jsonrpc === "2.0") {
      const { id, method } = body;
      
      if (method === "tools/list") {
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: [
              {
                name: "calculate_ai_savings",
                description: "Calculate employee vs AI agent savings based on hourly rate, employees, and work hours.",
                inputSchema: {
                  type: "object",
                  properties: {
                    hourlyRate: { type: "number", description: "Hourly wage cost per employee in USD" },
                    hoursPerWeek: { type: "number", description: "Average work hours per week" },
                    employees: { type: "number" },
                    benefits: { type: "number" }
                  },
                  required: ["hourlyRate", "hoursPerWeek", "employees"]
                }
              }
            ]
          }
        });
      }
      
      if (method === "tools/call") {
        const { name, arguments: args } = body.params || {};
        if (name === "calculate_ai_savings") {
          const rate = Number(args.hourlyRate || 0);
          const hours = Number(args.hoursPerWeek || 0);
          const num = Number(args.employees || 0);
          const extra = Number(args.benefits || 25);
          const baseHumanCost = rate * hours * num * 52;
          const loadedHumanCost = baseHumanCost * (1 + extra / 100);
          const aiMonthlySubscription = 20 * num;
          const aiYearlyCost = aiMonthlySubscription * 12;
          const yearlySavings = loadedHumanCost - aiYearlyCost;
          
          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: `Estimated human yearly cost is $${loadedHumanCost.toFixed(2)}. Estimated AI agent yearly cost is $${aiYearlyCost.toFixed(2)}. Yearly savings: $${yearlySavings.toFixed(2)}.`
                }
              ]
            }
          });
        }
      }

      return res.json({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
    }

    res.status(400).json({ error: "Invalid JSON-RPC request" });
  });

  // --- END AGENT-READINESS AND DISCOVERY ENDPOINTS ---

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
