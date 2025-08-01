/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import path from "path";
import ejs from "ejs";
import { AppError } from "../errorHelpers/AppError";

interface SendEmailOption {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

const transport = nodemailer.createTransport({
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  host: envVars.EMAIL_SENDER.SMTP_HOST,
});

// eslint-disable-next-line no-console
console.log({
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  host: envVars.EMAIL_SENDER.SMTP_HOST
});

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOption) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    await transport.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        fileName: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.log("Sending mail error", err)
    throw new AppError(401, "Email Sending Failed", err);
  }
};
