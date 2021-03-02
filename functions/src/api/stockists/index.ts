import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BearerToJWT } from '../../utill';
var cors = require('cors')({ origin: true });

const stockistCollectionID = 'stockists';

export const getStockistsAll = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			const res = await admin.firestore().collection(stockistCollectionID).get();
			let stockists: any = [];
			res.docs.map((val) => { stockists.push({ ...val.data() }) });
			response.send({ stockists });
		} catch (err) {
			console.log(err.message)
			response.sendStatus(500);
		}
	});
});

export const addStockist = functions.https.onRequest(async (request, response) => {
	response.setHeader("Access-Control-Allow-Origin", 'http://localhost:3000');
	response.setHeader('Access-Control-Allow-Credentials', 'true');

	if (request.method === 'OPTIONS') {
		response.set('Access-Control-Allow-Methods', 'POST');
		response.set('Access-Control-Allow-Headers', 'Authorization');
		response.set('Access-Control-Max-Age', '3600');
		response.status(204).send('');
	}

	const { ID, name, website, address, state} = JSON.parse(request.body);
	
	try {
		await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
	} catch {
		response.status(401).send('Invalid Token');
	}
	
	if(ID == null || name == null || website == null || state == null) {
		console.log('Missing Stockist Data');
		response.status(500).send('Missing Stockist Data');
	}

	try {
		await admin.firestore().collection(stockistCollectionID).doc(String(ID)).set({
			ID,
			website,
			name,
			address,
			state,
		});
		console.log('Finished Upload')
		response.send('Finished Upload');
	} catch {
		console.log("Server Error Stockist adding to storage");
		response.status(500).send('Server Error Stockist adding to storage');
	}
});

export const removeStockist = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}

		const { ID } = JSON.parse(request.body);
	
		if (ID == null) {
			response.status(500).send('Missing ID');
		}

		try {
			await admin.firestore().collection(stockistCollectionID).doc(String(ID)).delete();
			response.send('Removed' + ID);
		} catch {
			response.status(500).send('Removing Failed');
		}
	});
});

