import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});
export const searchTermHighlight = (query, value) => {
  const result = value.replace(
    new RegExp(query, "gi"),
    (match) => `<strong>${match}</strong>`
  );
  console.log(result, "result");
  return result;
};
export default transporter
