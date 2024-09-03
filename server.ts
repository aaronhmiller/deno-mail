const EMAIL_PASS = Deno.env.get("EMAIL_PASS");

async function sendEmail(name: string, email: string, message: string) {
  const emailData = [
    `Subject: Message from ${name}`,
    `From: ${email}`,
    "",
    message,
  ].join("\n");

  const response = await fetch("smtps://smtp.gmail.com:465", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Authorization": `Basic ${btoa("aaronmiller+deno@gmail.com:" + EMAIL_PASS)}`,
    },
    body: emailData,
  });

  if (response.ok) {
    console.log("Email sent successfully!");
  } else {
    console.error("Failed to send email:", response.statusText);
  }
}

import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use(async (ctx) => {
  if (ctx.request.method === "POST" && ctx.request.hasBody) {
    const body = ctx.request.body({ type: "json" });
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
