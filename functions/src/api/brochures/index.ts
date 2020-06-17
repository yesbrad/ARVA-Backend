import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BearerToJWT } from '../../utill';

export const getBrochures = functions.https.onRequest(async (request, response) =>  {
	try {
		const res = await admin.firestore().collection('brochures').get();
		const newBrochures: any = [];
		res.docs.map((val) => { newBrochures.push({...val.data()})});
		response.setHeader("Access-Control-Allow-Origin", '*');
		response.send({ newBrochures });
	} catch {
		console.log("Server Error Brochures")
		response.sendStatus(500);
	}
});

export const addBrochure = functions.https.onRequest(async (request, response) => {
	response.setHeader("Access-Control-Allow-Origin", 'http://localhost:3000');
	response.setHeader('Access-Control-Allow-Credentials', 'true');

	if (request.method === 'OPTIONS') {
		response.set('Access-Control-Allow-Methods', 'POST');
		response.set('Access-Control-Allow-Headers', 'Authorization');
		response.set('Access-Control-Max-Age', '3600');
		response.status(204).send('');
	}

	try {
		await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
	} catch {
		response.status(401).send('Invalid Token');
	}

	const { brochureID, brochurePDFURL } = JSON.parse(request.body);
	
	if(brochureID == null || brochurePDFURL == null) {
		console.log('Missing Brochure Data');
		response.status(500).send('Missing Brochure Data');
	}

	try {
		await admin.firestore().collection('brochures').doc(String(brochureID)).set({
			brochureID,
			brochurePDFURL,
		});
		response.send('Finished Upload');
	} catch {
		console.log("Server Error brochure adding to storage");
		response.status(500).send('Server Error brochure adding to storage');
	}
});

export const removeBrochure = functions.https.onRequest(async (request, response) => {
	response.setHeader("Access-Control-Allow-Origin", 'http://localhost:3000');
	response.setHeader('Access-Control-Allow-Credentials', 'true');

	if (request.method === 'OPTIONS') {
		response.set('Access-Control-Allow-Methods', 'POST');
		response.set('Access-Control-Allow-Headers', 'Authorization');
		response.set('Access-Control-Max-Age', '3600');
		response.status(204).send('');
	}

	try {
		await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
	} catch {
		response.status(401).send('Invalid Token');
	}

	const { brochureID } = JSON.parse(request.body);
	
	if(brochureID == null) {
		response.status(500).send('Missing Brochure ID');
	}

	try {
		await admin.firestore().collection('brochures').doc(String(brochureID)).delete();
		response.send('Removed' + brochureID);
	} catch {
		response.status(500).send('Removing Failed');
	}
});