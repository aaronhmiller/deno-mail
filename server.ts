import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const emailUser = Deno.env.get("EMAIL_USER");
const emailPass = Deno.env.get("EMAIL_PASS");

async function handler(req: Request): Promise<Response> {
  try {
    if (req.method === "POST" && req.url.endsWith("/send")) {
      const body = await req.text(); // Directly read the body as text
      const params = new URLSearchParams(body); // Parse as form data
      const name = params.get("name");
      const email = params.get("email");
      const message = params.get("message");

      if (!name || !email || !message) {
        return new Response(JSON.stringify({ status: "error", error: "Missing fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const client = new SmtpClient();
      await client.connectTLS({
        hostname: "smtp.gmail.com",
        port: 465,
        username: emailUser,
        password: emailPass,
      });

      await client.send({
        from: email,
        to: emailUser!,
        subject: `Message from ${name}`,
        content: message,
      });

      await client.close();
      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response("Not Found", { status: 404 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

serve(handler, { port: 8000 });
