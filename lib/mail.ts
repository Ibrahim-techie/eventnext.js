import nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure:process.env.SMTP_PORT === '465', 
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})




interface SendMailOptions {
    to: string;
    subject: string;
    html: string;

}


export async function sendMail({
  to,
  subject,
  html,
}: SendMailOptions) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
}