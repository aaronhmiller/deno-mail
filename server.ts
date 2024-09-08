import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
//import { load } from 'https://deno.land/std@0.212.0/dotenv/mod.ts'

//const env = await load();

// Environment variables
//const POSTMARK_API_KEY = env.API_KEY;
//const EMAIL_USER = env.EMAIL_USER;
const API_KEY = Deno.env.get("API_KEY");
const EMAIL_USER = Deno.env.get("EMAIL_USER");

const app = new Hono();


// CORS Middleware
app.use('*', async (c, next) => {
  // Set necessary CORS headers
  c.header("Access-Control-Allow-Origin", "https://aaronhmiller.github.io");
  c.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (c.req.method === "OPTIONS") {
    // Return a 204 status with no content for preflight OPTIONS requests
    return c.status(204).send();
  }

  await next();
});



app.post("/send", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return c.json({ status: "error", error: "Missing required fields" }, 400);
    }

    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: "no-reply@yourdomain.com",
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
