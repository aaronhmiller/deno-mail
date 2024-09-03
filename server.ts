import { Application } from "https://deno.land/x/oak/mod.ts";
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

const app = new Application();

// CORS middleware
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "https://aaronhmiller.github.io"); // Allow your specific origin
  ctx.response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }

  try {
    await next();
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { status: "error", message: "Internal Server Error" };
    console.error("Error occurred:", err);
  }
});

// Main handler
app.use(async (ctx) => {
  if (ctx.request.method === "POST" && ctx.request.hasBody) {
    const body = ctx.request.body({ type: "json" }); // Explicitly state that the body is JSON
    const data = await body.value;

    const { name, email, message } = data;

    // Call the sendEmail function with the form data
    await sendEmail(name, email, message);

    ctx.response.status = 200;
    ctx.response.body = { status: "success", message: "Email sent!" };
  } else {
    ctx.response.status = 404;
    ctx.response.body = { status: "error", message: "Not Found" };
  }
});

await app.listen({ port: 8000 });
