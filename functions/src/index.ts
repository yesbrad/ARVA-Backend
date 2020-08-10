import * as admin from 'firebase-admin';
var serviceAccount = require("../arva-161d140f7f23.json");
import * as functions from 'firebase-functions';
var cors = require('cors')({ origin: true });

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
		// const { message } = JSON.parse(request.body);
	
		// if ( message == null) {
		// 	console.log('Missing Email Data');
		// 	response.status(500).send('Missing Email Data');
		// }

		try {
			await admin.firestore().collection('mail').add({
				to: 'b.bradfrancis@gmail.com',//'award32@bigpond.com',
				message: {
				  subject: 'Hello from Firebase!',
				  html: 'This is an <code>HTML</code> email body.',
				},
			});
			response.send('Finished Sending');
		} catch {
			console.log("Server Error Failed Email");
			response.status(500).send('Server Error Failed Email');
		}
	})
});