const nodemailer = require('nodemailer');

const sendMail = async options => {
    // 1). Crate transporter
    const transporter = nodemailer.createTransport({
        // service: 'Gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // aCTIVATE IN GMAIL 'LESS SECURE APP' OPTION
    });

    // 2). Define the email options
    const mailOptions = {
        from: 'Rakesh Vishwakarma <hello@rakeshv.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: 
    }
    // 3). Actually send the email
    await transporter.sendMail(mailOptions)
}

module.exports = sendMail;