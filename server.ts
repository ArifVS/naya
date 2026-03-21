import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { UserRepository } from "./src/modules/user/repository";
import { QueryRepository } from "./src/modules/query/repository";
import { z } from "zod";

const AskSchema = z.object({
  input: z.object({
    type: z.enum(["text", "voice"]),
    text: z.string().min(3).max(500).optional(),
    audio_url: z.string().url().optional(),
  }),
  context: z.object({
    persona: z.string(),
    state: z.string().length(2),
    session_id: z.string().optional(),
  }),
});

import { QueryService } from "./src/modules/query/service";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Auth Middleware
  app.use((req, res, next) => {
    (req as any).user = { id: "mock-user-id", tier: "FREE" };
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.0" });
  });

  app.post("/api/ask", async (req, res) => {
    try {
      const body = AskSchema.parse(req.body);
      const user = (req as any).user;

      const response = await QueryService.ask(
        user.id,
        body.input.text || "Voice input",
        "hi", // Default to Hindi for now
        body.context.persona,
        body.context.state
      );

      res.json({ success: true, data: response });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: error.message } });
      }
      console.error("Ask error:", error);
      res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
    }
  });

  app.post("/api/misinformation-check", async (req, res) => {
    try {
      const { claim, language, state } = req.body;
      const user = (req as any).user;

      const response = await QueryService.misinformationCheck(
        user.id,
        claim,
        language || "hi",
        state
      );

      res.json({ success: true, data: response });
    } catch (error) {
      console.error("Misinfo error:", error);
      res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
