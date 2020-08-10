import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BearerToJWT } from '../../utill';
var cors = require('cors')({ origin: true });
// var csv = require('csv');

export const getStockistsAll = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		// response.send("CUNT");
		try {
			const res = await admin.firestore().collection('Stockists').doc('StockistArray').get();
			// let stockists: any = [];
			// res.docs.map((val) => { stockists.push({ ...val.data() }) });
			// stockists =	res.docs[0].data;
			// response.setHeader("Access-Control-Allow-Origin", '*');
			// console.log("Get Stockist Data: ", res.data);
			response.send({ stockists: res.data() });
		} catch {
			console.log("Server Error Stockist")
			response.sendStatus(500);
		}
	});
});

export const addStockist = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {

		const { stockists } = JSON.parse(request.body);
	
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}
	
		if (stockists == null) {
			console.log('Missing Stockist Data');
			response.status(500).send('Missing Stockist Data');
		}

		try {	
			await admin.firestore().collection('Stockists').doc('StockistArray').delete();
			await admin.firestore().collection('Stockists').doc('StockistArray').set({ stockists });
			console.log('Finished Upload')
			response.send('Finished Upload');
		} catch {
			console.log("Server Error Stockist adding to storage");
			response.status(500).send('Server Error Stockist adding to storage');
		}

		// await deleteCollection(admin.firestore(), 'stockists', 1000);

		// try {
		// 	await admin.firestore().collection('stockists').doc(String(ID)).set({
		// 		ID,
		// 		imageURI,
		// 		title
		// 	});
		// 	console.log('Finished Upload')
		// 	response.send('Finished Upload');
		// } catch {
		// 	console.log("Server Error Stockist adding to storage");
		// 	response.status(500).send('Server Error Stockist adding to storage');
		// }
	});
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
			await admin.firestore().collection('stockists').doc(String(ID)).delete();
			response.send('Removed' + ID);
		} catch {
			response.status(500).send('Removing Failed');
		}
	});
});