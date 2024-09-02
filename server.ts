import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const router = new Router();
router.post("/send", async (ctx) => {
  const { name, email, message } = await ctx.request.body().value;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: Deno.env.get("EMAIL_USER") }] }],
      from: { email: "no-reply@yourdomain.com" },
      subject: `Message from ${name}`,
      content: [{ type: "text/plain", value: message }],
    }),
  });

  if (response.ok) {
    ctx.response.body = { status: "success" };
  } else {
    ctx.response.status = 500;
    ctx.response.body = { status: "error", error: "Failed to send email" };
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
