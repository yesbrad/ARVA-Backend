import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UploadImagePNG } from '../../utill';

export const getStockists = functions.https.onRequest(async (request, response) =>  {
	try {
		const res = await admin.firestore().collection('stockists').get();
		const stockists: any = [];
		res.docs.map((val) => { stockists.push({...val.data()})});
		response.setHeader("Access-Control-Allow-Origin", '*');
		response.send({ stockists });
	} catch {
		console.log("Server Error Stockist")
		response.sendStatus(500);
	}
});

export const addStockist = functions.https.onRequest(async (request, response) => {
	response.setHeader("Access-Control-Allow-Origin", '*');

	const { ID, image64, title} = JSON.parse(request.body);
	
	if(ID == null || image64 == null || title == null) {
		console.log('Missing Stockist Data');
		response.status(500).send('Missing Stockist Data');
	}

	let imageURI= '';

	try {
        imageURI = await UploadImagePNG(image64, 'stockist/' + ID);
	} catch (err) {
		console.log("Image Upload Failed", err)
		response.status(500).send('Image Upload Failed');
	}

	try {
		await admin.firestore().collection('stockists').doc(String(ID)).set({
			ID,
			imageURI,
			title
		});
		console.log('Finished Upload')
		response.send('Finished Upload');
	} catch {
		console.log("Server Error Stockist adding to storage");
		response.status(500).send('Server Error Stockist adding to storage');
	}
});

export const removeStockist = functions.https.onRequest(async (request, response) => {
	response.setHeader("Access-Control-Allow-Origin", '*');

	console.log(request.body);

	const { ID } = JSON.parse(request.body);
	
	if(ID == null) {
		response.status(500).send('Missing ID');
	}

	try {
		await admin.firestore().collection('stockists').doc(String(ID)).delete();
		response.send('Removed' + ID);
	} catch {
		response.status(500).send('Removing Failed');
	}
});