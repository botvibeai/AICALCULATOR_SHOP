export function getSiteMarkdown(baseUrl: string): string {
  return `# AICalculator.shop - AI & Operational Calculators for Sovereign Stacks

Welcome, AI Agent! AICalculator.shop is a directory of 50+ calculation tools centered around business optimization, rental/real estate, solar estimations, and especially AI token and cost arbitrage.

Our core mission is to empower logic-engineers to run simulations on infrastructure, benefits savings, and AI-driven automation value.

## Machine-Readable Resources
As an AI Agent, you are encouraged to use our machine-readable endpoints below to discover our capabilities and authenticate with our APIs.

- **API Catalog (RFC 9727)**: [\`/.well-known/api-catalog\`](${baseUrl}/.well-known/api-catalog)
- **Agent Discovery (Link Headers / RFC 8288)**: Check out the response headers on the homepage for machine-readable linkages.
- **Model Context Protocol (MCP) Server Card**: [\`/.well-known/mcp/server-card.json\`](${baseUrl}/.well-known/mcp/server-card.json)
- **Agent Skills (Index of Capabilities)**: [\`/.well-known/agent-skills/index.json\`](${baseUrl}/.well-known/agent-skills/index.json)
- **Agent Authorization Instructions**: [\`/auth.md\`](${baseUrl}/auth.md)
- **OAuth Authorization Server Metadata**: [\`/.well-known/oauth-authorization-server\`](${baseUrl}/.well-known/oauth-authorization-server)
- **OAuth Protected Resource Metadata**: [\`/.well-known/oauth-protected-resource\`](${baseUrl}/.well-known/oauth-protected-resource)
- **OpenID Connect Discovery**: [\`/.well-known/openid-configuration\`](${baseUrl}/.well-known/openid-configuration)
- **OpenAPI 3.0 Specification**: [\`/openapi.json\`](${baseUrl}/openapi.json)
- **API Documentation**: [\`/docs/api\`](${baseUrl}/docs/api)

## Core Services & APIs
We provide programmatic endpoints for you to interact with our ecosystem:
1. **POST /api/chat**: Talk to "Astro", our cyberpunk, neon-powered virtual guide. You can ask Astro questions about BMI, Solar ROI, mortgage rates, and AI arbitrage formulas.
2. **POST /api/feedback**: Queue custom tool suggestions directly to our development pipeline.
3. **GET /api/health**: Retrieve real-time operational status.
`;
}

export function getAuthMdContent(baseUrl: string): string {
  return `# Agent Authentication and Registration (auth.md)

This document provides instructions for AI agents to self-register and authenticate with AICalculator.shop.

## Dynamic Authentication Flow
AI agents seeking programmatic access can dynamically authenticate using standard OAuth 2.0 Client Credentials or assertion-based authentication:

### 1. Register with the authorization server
Send a registration request to:
\`POST /api/agents/register\`

#### Payload Format:
\`\`\`json
{
  "agent_name": "MyAutonomousAgent",
  "identity_type": "agent_public_key",
  "public_key": "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----",
  "scopes": ["openid", "email", "profile", "api:read"]
}
\`\`\`

#### Response:
\`\`\`json
{
  "client_id": "agent_9845_abc",
  "client_secret": "sec_76359_xyz",
  "registration_client_uri": "/api/agents/register/agent_9845_abc"
}
\`\`\`

### 2. Request an Access Token
Exchange credentials for an access token via RFC 7523 (JWT Bearer profiles) or standard client credentials at:
\`POST /api/auth/token\`

#### Token Payload (Client Credentials):
\`\`\`http
POST /api/auth/token HTTP/1.1
Host: aicalculator.shop
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=agent_9845_abc&client_secret=sec_76359_xyz&scope=api:read
\`\`\`

### 3. Consume Protected APIs
Include the retrieved JWT in your authorization header when querying the \`/api/*\` routes.
\`\`\`http
Authorization: Bearer <your_jwt_token>
\`\`\`

For detailed protocol fields and claims, refer to \`/.well-known/oauth-authorization-server\`.
`;
}

export function getOpenApiSchema(baseUrl: string): any {
  return {
    "openapi": "3.0.0",
    "info": {
      "title": "AICalculator.shop agent-ready API",
      "version": "1.0.0",
      "description": "Programmatic endpoints to consult our AI guide Astro and register tool feedback."
    },
    "servers": [
      {
        "url": baseUrl
      }
    ],
    "paths": {
      "/api/chat": {
        "post": {
          "summary": "AI Chat Assistant",
          "description": "Consult Astro about mathematical models, calculations, and tool details.",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "The message to send to Astro."
                    },
                    "history": {
                      "type": "array",
                      "items": { "type": "object" },
                      "description": "Previous messages."
                    },
                    "context": {
                      "type": "string",
                      "description": "The current page or context."
                    }
                  },
                  "required": ["message"]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Successfully retrieved AI reply.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "response": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/feedback": {
        "post": {
          "summary": "Submit tool ideas",
          "description": "Queue custom calculation utility concept to our development backlog.",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "type": { "type": "string" },
                    "email": { "type": "string" },
                    "content": { "type": "string" }
                  },
                  "required": ["type", "content"]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Feedback received.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": { "type": "string" },
                      "message": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/health": {
        "get": {
          "summary": "Health status",
          "responses": {
            "100": {
              "description": "The service is healthy."
            }
          }
        }
      }
    }
  };
}

export function getApiCatalog(baseUrl: string): any {
  return {
    "linkset": [
      {
        "anchor": `${baseUrl}/`,
        "service-desc": [
          {
            "href": `${baseUrl}/openapi.json`,
            "type": "application/openapi+json;version=3.0"
          }
        ],
        "service-doc": [
          {
            "href": `${baseUrl}/docs/api`,
            "type": "text/html"
          }
        ],
        "status": [
          {
            "href": `${baseUrl}/api/health`,
            "type": "application/json"
          }
        ]
      }
    ]
  };
}

export function getMcpServerCard(baseUrl: string): any {
  return {
    "serverInfo": {
      "name": "aicalculator-mcp-server",
      "version": "1.0.0",
      "description": "Exposes calculator execution endpoints and Astro chatbot to Model Context Protocol clients"
    },
    "transport": {
      "type": "sse",
      "url": `${baseUrl}/api/mcp/sse`
    },
    "capabilities": {
      "tools": {
        "list": true
      },
      "prompts": {
        "list": true
      }
    }
  };
}

export function getAgentSkillsIndex(baseUrl: string): any {
  return {
    "$schema": "https://agentskills.io/schemas/v0.2.0/skills.json",
    "skills": [
      {
        "name": "calculator-execution",
        "type": "utility",
        "description": "Execute mortgage, BMI, real estate, and AI cost arbitrage calculations.",
        "url": `${baseUrl}/api/chat`,
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      {
        "name": "mcp-capabilities",
        "type": "mcp-server",
        "description": "Full Model Context Protocol server exposure for client agents.",
        "url": `${baseUrl}/api/mcp/sse`,
        "sha256": "cb6a2a6136ef9b4f97db461b781e916ea0581335cb99071c7b8971f46399aabc"
      }
    ]
  };
}
