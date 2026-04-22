import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: "smtp.phantom.co.za",
    port: 465,
    secure: true,
    auth: {
        user: "chandan@phantom.co.za",
        pass: "6f91w0TP97220U",
    },
});

export const sendEmail = async () => {
    try {
        await transporter.sendMail({
            from: "chandan@phantom.co.za",
            to: "aj257453@gmail.com",
            subject: "testing",
            text: "testing",
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};