import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import { cors } from "https://deno.land/x/hono@v3.3.0/middleware.ts";

const API_KEY = Deno.env.get("API_KEY");
const EMAIL_USER = Deno.env.get("EMAIL_USER");
const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

const app = new Hono();

// CORS Middleware
app.use('*', cors({
  origin: 'https://aaronhmiller.github.io',
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.post("/send", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, message, recaptchaToken } = body;

    if (!name || !email || !message || !recaptchaToken) {
      return c.json({ status: "error", error: "Missing required fields" }, 400);
    }

    // Verify reCAPTCHA token
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`, {
      method: "POST",
    });

    const recaptchaResult = await recaptchaResponse.json();

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      console.error("reCAPTCHA verification failed. Score: " + recaptchaResult.score);
      return c.json({ status: "error", error: "reCAPTCHA verification failed" }, 400);
    }

    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: `no-reply@demojoyto.win`,
        To: EMAIL_USER!,
        Subject: `Message from ${name}`,
        TextBody: message,
        ReplyTo: email,
      }),
    });
    
    if (response.ok) {
      return c.json({ status: "success" });
    } else {
      const errorData = await response.json();
      console.error("Postmark API error:", errorData);
      return c.json({ status: "error", error: "Failed to send email" }, 500);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return c.json({ status: "error", error: "Internal server error" }, 500);
  }
});

app.get("/", (c) => c.text("Hono Server Running"));

export default app;
