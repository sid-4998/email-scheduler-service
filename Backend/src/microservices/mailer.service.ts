import nodemailer from 'nodemailer';
import { ScheduledEmail, EmailSender } from "../../generated/prisma/client";

type MailerResult = {
  messageId: string;
  previewUrl?: string;
};

function createTransport(sender: EmailSender) {
  return nodemailer.createTransport({
    host: sender.smtpHost,
    port: sender.smtpPort,
    secure: false,
    requireTLS: true,
    auth: {
      user: sender.smtpUsername,
      pass: sender.smtpPassword,
    },
  });
}

export async function sendEmail(
  email: ScheduledEmail & { sender: EmailSender }
): Promise<MailerResult> {
  const transporter = createTransport(email.sender);

  const info = await transporter.sendMail({
    from: `"${email.sender.name}" <${email.sender.email}>`,
    to: email.to,
    subject: email.subject,
    html: email.body,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

  if (previewUrl) {
    console.log("Ethereal Preview:", previewUrl);
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
}