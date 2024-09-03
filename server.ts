import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const EMAIL_USER = "aaronmiller+deno@gmail.com";
const EMAIL_PASS = Deno.env.get("EMAIL_PASS");

async function sendEmail(name: string, email: string, message: string) {
  const client = new SmtpClient();

  await client.connectTLS({
    hostname: "smtp.gmail.com",
    port: 465,
    username: EMAIL_USER,
    password: EMAIL_PASS,
  });

  await client.send({
    from: EMAIL_USER,
    to: EMAIL_USER, // or another recipient
    subject: `Message from ${name}`,
    content: message,
  });

  await client.close();

  console.log("Email sent successfully!");
}

const app = new Hono();

// CORS Middleware
app.use('*', async (c, next) => {
  c.header("Access-Control-Allow-Origin", "https://aaronhmiller.github.io");
  c.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (c.req.method === "OPTIONS") {
    return c.status(204).send(); // No content response for OPTIONS request
  }

  try {
    await next();
  } catch (error) {
    console.error("Error during request processing:", error);
    c.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// Main Handler for POST /send
app.post('/send', async (c) => {
  try {
    const { name, email, message } = await c.req.json();

    await sendEmail(name, email, message);

    return c.json({ status: "success", message: "Email sent!" });
  } catch (error) {
    console.error("Error occurred while sending email:", error);
    return c.json({ status: "error", message: "Internal Server Error" }, 500);
  }
});

// Handler for GET /
app.get('/', (c) => c.text('Hono Server Running'));

// Start the server
app.fire();
