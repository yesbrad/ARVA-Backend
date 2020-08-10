import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BearerToJWT } from '../../utill';
var cors = require('cors')({ origin: true });

export const getBrochures = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			const res = await admin.firestore().collection('brochures').get();
			const newBrochures: any = [];
			res.docs.map((val) => { newBrochures.push({ ...val.data() }) });
			response.setHeader("Access-Control-Allow-Origin", '*');
			console.log(newBrochures);
			response.send({ newBrochures });
		} catch {
			console.log("Server Error Brochures")
			response.sendStatus(500);
		}
	})
});

export const addBrochure = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}

		const { brochureID, brochurePDFURL, brochureTitle, brochureDescription, brochureImageURL } = JSON.parse(request.body);
	
		if (brochureID == null || brochurePDFURL == null || brochureTitle == null || brochureDescription == null || brochureImageURL == null) {
			console.log('Missing Brochure Data');
			response.status(500).send('Missing Brochure Data');
		}

		try {
			await admin.firestore().collection('brochures').doc(String(brochureID)).set({
				brochureID,
				brochurePDFURL,
				brochureTitle,
				brochureDescription,
				brochureImageURL 
			});
			response.send('Finished Upload');
		} catch {
			console.log("Server Error brochure adding to storage");
			response.status(500).send('Server Error brochure adding to storage');
		}
	})
});

export const removeBrochure = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}

		const { brochureID } = JSON.parse(request.body);
	
		if (brochureID == null) {
			response.status(500).send('Missing Brochure ID');
		}

		try {
			await admin.firestore().collection('brochures').doc(String(brochureID)).delete();
			response.send('Removed' + brochureID);
		} catch {
			response.status(500).send('Removing Failed');
		}
	})
});