import * as admin from 'firebase-admin';
var serviceAccount = require("../arva-161d140f7f23.json");
import * as functions from 'firebase-functions';
var cors = require('cors')({ origin: true });
require('dotenv').config()
const sgMail = require('@sendgrid/mail')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'arva-3193d.appspot.com',
});

export * from './api/stockists';
export * from './api/brands';
export * from './api/newProducts';
export * from './api/brochures';

export const sendMail = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		const { message, email, subject, name } = JSON.parse(request.body);
	
		if ( message == null || email == null || subject == null || name == null) {
			console.log('Missing Email Data');
			response.status(500).send('Missing Email Data');
		}

		sgMail.setApiKey(process.env.SENDGRID_API_KEY)
		console.log(process.env.SENDGRID_API_KEY)

		const msg = {
			to: 'b.bradfrancis@gmail.com', // Change to your recipient
			from: email, // Change to your verified sender
			subject,
			text: `Message on Australian RV from ${name}: \n ${message}`,
		}
		
		sgMail.send(msg).then(() => {
			console.log('Email sent')
			response.send("Email Sent");
		}).catch((error: Error) => {
			console.log(error.message);
			console.log(error.name);
			response.sendStatus(500);
		})

	})
});