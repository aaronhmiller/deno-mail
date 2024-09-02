import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";

// Environment variables
const POSTMARK_API_KEY = Deno.env.get("POSTMARK_API_KEY");
const EMAIL_USER = Deno.env.get("EMAIL_USER");

const app = new Hono();

app.post("/send", async (c) => {
  try {
    const { name, email, message } = await c.req.parseBody<{ name: string; email: string; message: string }>();

    if (!name || !email || !message) {
      return c.json({ status: "error", error: "Missing required fields" }, 400);
    }

    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${POSTMARK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: "no-reply@yourdomain.com",
        To: EMAIL_USER,
        Subject: `Message from ${name}`,
        TextBody: message,
      }),
    });

    if (response.ok) {
      return c.json({ status: "success" });
    } else {
      const errorData = await response.json();
      return c.json({ status: "error", error: errorData }, 500);
    }
  } catch (error) {
    return c.json({ status: "error", error: error.message }, 500);
  }
});

app.get("/", (c) => c.text("Hono Server Running"));

app.fire();
