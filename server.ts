import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const emailUser = Deno.env.get("EMAIL_USER");
const emailPass = Deno.env.get("EMAIL_PASS");

const router = new Router();
router.post("/send", async (ctx) => {
  try {
    // Retrieve the body object
    const body = ctx.request.body();

    // Debugging: Check body type and status
    console.log("Body Type:", body.type);
    console.log("Body Content:", body);

    let value;

    // Handle different types of body content
    if (body.type === "json") {
      value = await body.value;
    } else if (body.type === "form") {
      value = {};
      for (const [key, val] of await body.value) {
        value[key] = val;
      }
    } else if (body.type === "form-data") {
      value = await body.value.read(); // Reads and parses form data
    } else {
      ctx.response.status = 400;
      ctx.response.body = { status: "error", error: "Unsupported content type" };
      return;
    }

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
