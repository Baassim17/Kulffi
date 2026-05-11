import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactEmail = process.env.CONTACT_EMAIL || "hello@kulffi.com";

    // Escape user inputs for safe HTML email rendering
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    // If SMTP is not configured, log and return success (for dev/demo)
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("[Contact Form Submission]");
      console.log("From:", email);
      console.log("Name:", name);
      console.log("Message:", message);
      console.log("Note: Configure SMTP env vars to send real emails");

      return NextResponse.json(
        { success: true, message: "Message received (demo mode — SMTP not configured)" },
        { status: 200 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"Kulffi Contact Form" <${smtpUser}>`,
      to: contactEmail,
      replyTo: safeEmail,
      subject: `New message from ${safeName}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #A31D1D; margin-bottom: 16px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2A1810; width: 80px;">Name:</td>
              <td style="padding: 8px 0; color: #2A1810;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2A1810;">Email:</td>
              <td style="padding: 8px 0; color: #2A1810;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2A1810; vertical-align: top;">Message:</td>
              <td style="padding: 8px 0; color: #2A1810; white-space: pre-wrap;">${safeMessage}</td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
