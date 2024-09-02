import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const emailUser = Deno.env.get("EMAIL_USER");
const emailPass = Deno.env.get("EMAIL_PASS");

const router = new Router();
router.post("/send", async (ctx) => {
  try {
    console.log(ctx.request.body); // Debugging: Check what ctx.request.body is

    const body = ctx.request.body(); // No specific type; let's see the output
    console.log(body); // Debugging: Check the body object

    const value = await body.value;
    console.log(value); // Debugging: Check the extracted value

    ctx.response.body = { status: "debug", value }; // Temporarily return the value for inspection
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { status: "error", error: error.message };
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
