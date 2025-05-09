import resend from "@config/resend";
import env from "./env";

type MailParams = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const getFromEmail = () => {
  return env.NODE_ENV === "development"
    ? "onboarding@resend.dev"
    : env.EMAIL_SENDER;
};

const getToEmail = (to: string) => {
  return env.NODE_ENV === "development" ? "delivered@resend.dev" : to;
};

export const sendMail = async ({ to, subject, text, html }: MailParams) => {
  return await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(to),
    subject,
    text,
    html,
  });
};
