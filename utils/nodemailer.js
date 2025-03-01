import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import smtpTransport from 'nodemailer-smtp-transport';

const transporter = nodemailer.createTransport(smtpTransport({
    host: `${process.env.SMTP_HOST}`,
    port:  `${process.env.SMTP_PORT}`,
    secure: false,
    auth: {
      user: `${process.env.SMTP_MAIL}`,
      pass: `${process.env.SMTP_PASSWORD}`,
    },
    tls:{
        rejectUnauthorized: false,
    }
  }));

export const sendWelcomeEmail = async (userName, toEmail, password ) => {
    const mailOptions = {
        from: `${process.env.SMTP_MAIL}`,
        to: toEmail,
        subject: "Welcome to Sevya!",
        text: `Hello ${userName || "User"},
        \nThank you for joining Sevya!.
        \n Here is your user email : ${toEmail}
        \n Here is your password : ${password}
        \n\n We are excited to have you.\n\nBest Regards,\nThe Sevya Team`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    }catch (error) {
        console.error("Error sending email:", error);
    }
};

