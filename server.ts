import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const emailUser = Deno.env.get("EMAIL_USER");
const emailPass = Deno.env.get("EMAIL_PASS");

const router = new Router();
router.post("/send", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "form" }); // Expect form-encoded data
    const value = await body.value; // This will be a URLSearchParams object

    const name = value.get("name");
    const email = value.get("email");
    const message = value.get("message");

    if (!name || !email || !message) {
      ctx.response.status = 400;
      ctx.response.body = { status: "error", error: "Missing required fields" };
      return;
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
