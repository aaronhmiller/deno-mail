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

  // Parse the body based on the content type
  const body = ctx.request.body();
  let value;

  if (body.type === "json") {
    value = await body.value;
  } else if (body.type === "form") {
    value = {};
    for (const [key, val] of await body.value) {
      value[key] = val;
    }
  } else if (body.type === "form-data") {
    value = {};
    const formData = await body.value.read();
    formData.fields.forEach((val, key) => {
      value[key] = val;
    });
  } else {
    ctx.response.status = 400;
    ctx.response.body = { status: "error", error: "Unsupported content type" };
    return;
  }

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
