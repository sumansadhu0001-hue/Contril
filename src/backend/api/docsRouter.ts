// Contril AI OS - OpenAPI 3.0 & Swagger REST Documentation Router
import { Router, Request, Response } from 'express';

const router = Router();

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Contril AI OS Enterprise REST API",
    version: "1.0.0",
    description: "Production API documentation for Contril AI Operating System. Provides complete endpoints for Authentication, Beta Access, Waitlist, Admin Management, Subscriptions, Billing, Usage, and Workspace Integrations."
  },
  servers: [
    { url: "/api/v1", description: "Production V1 Server" }
  ],
  paths: {
    "/auth/signup": {
      post: {
        summary: "Email Signup & Activation",
        tags: ["Authentication"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  fullName: { type: "string" },
                  activationCode: { type: "string" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "User registered successfully." } }
      }
    },
    "/auth/login": {
      post: {
        summary: "Email Login",
        tags: ["Authentication"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Returns Access and Refresh tokens." } }
      }
    },
    "/beta/generate": {
      post: {
        summary: "Bulk Beta Account Generation (Admin)",
        tags: ["Beta Access"],
        responses: { "200": { description: "Beta accounts created with temp passwords & activation codes." } }
      }
    },
    "/waitlist/join": {
      post: {
        summary: "Public Waitlist Signup",
        tags: ["Waitlist"],
        responses: { "200": { description: "Added to waitlist." } }
      }
    },
    "/admin/dashboard": {
      get: {
        summary: "Executive Metrics & System Health (Admin)",
        tags: ["Admin Dashboard"],
        responses: { "200": { description: "Total users, revenue, server health, Gemini tokens." } }
      }
    },
    "/subscriptions/plans": {
      get: {
        summary: "List Subscription Tier Plans & Limits",
        tags: ["Subscriptions"],
        responses: { "200": { description: "FREE, PRO, BUSINESS, ENTERPRISE features." } }
      }
    },
    "/billing/checkout": {
      post: {
        summary: "Create Stripe Checkout Session",
        tags: ["Billing"],
        responses: { "200": { description: "Returns Stripe checkout redirect URL." } }
      }
    }
  }
};

// Return OpenAPI JSON Specification
router.get('/openapi.json', (req: Request, res: Response) => {
  return res.json(openApiSpec);
});

// Interactive Swagger UI HTML
router.get('/docs', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contril AI OS - API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
  <style>
    body { margin: 0; background-color: #0b0b0e; color: #fff; font-family: system-ui, -apple-system, sans-serif; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .topbar { display: none; }
    .header-bar { padding: 18px 24px; background: #111114; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; }
    .title { font-weight: 700; color: #00BFA6; font-size: 16px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="title">CONTRIL AI OS — REST API SWAGGER SPECIFICATION</div>
    <div><a href="/api/v1/openapi.json" style="color: #00BFA6; text-decoration: none; font-size: 13px; font-family: monospace;">Download OpenAPI JSON</a></div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/v1/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ]
      });
    };
  </script>
</body>
</html>`;
  return res.send(html);
});

export default router;
