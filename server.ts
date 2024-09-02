import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const emailUser = Deno.env.get("EMAIL_USER");
const emailPass = Deno.env.get("EMAIL_PASS");

const router = new Router();
router.post("/send", async (ctx) => {
  try {
    // Manually read the request body as a Uint8Array
    const body = await Deno.readAll(ctx.request.body({ type: "reader" }).value);

    // Convert the Uint8Array to a string
    const bodyStr = new TextDecoder().decode(body);

    // Convert URL-encoded string to JSON-like object
    const params = new URLSearchParams(bodyStr);
    const value = Object.fromEntries(params.entries());

    console.log("Parsed Value:", value);

    const { name, email, message } = value;

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
