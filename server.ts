import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";

// Environment variables
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const EMAIL_USER = Deno.env.get("EMAIL_USER");

const app = new Hono();

app.post("/send", async (c) => {
  try {
    const { name, email, message } = await c.req.parseBody<{ name: string; email: string; message: string }>();

    if (!name || !email || !message) {
      return c.json({ status: "error", error: "Missing required fields" }, 400);
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: EMAIL_USER }] }],
        from: { email: "no-reply@yourdomain.com" },
        subject: `Message from ${name}`,
        content: [{ type: "text/plain", value: message }],
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
