import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

// Environment variables for email credentials
const emailUser = Deno.env.get("EMAIL_USER");
const emailPass = Deno.env.get("EMAIL_PASS");

const router = new Router();
router.post("/send", async (ctx) => {
  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = { status: "error", error: "Invalid content type" };
    return;
  }

  const body = ctx.request.body({ type: "json" }); // Use the correct method to get the body as JSON
  const value = await body.value;

  const { name, email, message } = value;

  const client = new SmtpClient();

  try {
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
    ctx.response.body = { status: "success" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { status: "error", error: error.message };
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
