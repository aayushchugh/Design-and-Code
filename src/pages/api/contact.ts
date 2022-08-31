import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { google } from "googleapis";

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
const REFRESH_TOKEN = process.env.NEXT_PUBLIC_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		try {
			const { name, email, subject, message } = req.body;
			const accessToken = await oAuth2Client.getAccessToken();

			const transporter = nodemailer.createTransport({
				service: "Gmail",
				host: "smtp.gmail.com",
				auth: {
					type: "OAuth2",
					user: "ayushchugh2006@gmail.com",
					clientId: CLIENT_ID,
					clientSecret: CLIENT_SECRET,
					refreshToken: REFRESH_TOKEN,
					accessToken: accessToken,
				},
				tls: {
					rejectUnauthorized: false,
				},
				secure: false,
				requireTLS: true,
			});

			const mailOptions = {
				from: process.env.NEXT_PUBLIC_EMAIL_FROM,
				to: process.env.NEXT_PUBLIC_EMAIL_TO,
				subject: `Message From ${name}`,
				text: message,
			};

			await transporter.sendMail(mailOptions);

			return res.status(200).json({
				message: "Email sent successfully",
			});
		} catch (err) {
			console.error(err);

			res.status(500).json({
				error: "internal server error",
			});
		}
	}
}
