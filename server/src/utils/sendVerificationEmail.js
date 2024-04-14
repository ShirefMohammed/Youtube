const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationEmail = async (destEmail, verificationToken) => {
  const verificationLink = `${process.env.SERVER_URL}/api/auth/verifyAccount?verificationToken=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_SERVICE_USER,
    to: destEmail,
    subject: "Youtube Account Verification",
    html: `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff !important;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hi there,</p>
        <p>Please verify your account by clicking on the following link:</p>
        <a href="${verificationLink}" class="button">Verify Account</a>
        <p>Note: this link will be expired after 15 minutes</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Thanks,</p>
        <p>Youtube Clone App</p>
      </div>
    </body>
  </html>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Verification Email sent: " + info.response);
    }
  });
};

module.exports = sendVerificationEmail;
