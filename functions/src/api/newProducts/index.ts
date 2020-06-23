import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UploadImagePNG, BearerToJWT } from '../../utill';
var cors = require('cors')({ origin: true });

export const getProducts = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			const res = await admin.firestore().collection('newProducts').get();
			const newProducts: any = [];
			res.docs.map((val) => { newProducts.push({ ...val.data() }) });
			response.setHeader("Access-Control-Allow-Origin", '*');
			response.send({ newProducts });
		} catch {
			console.log("Server Error NewProducts")
			response.sendStatus(500);
		}
	});
});

export const addProduct = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}

		const { newProductID, newProductImage, newProductName, newProductDescription } = JSON.parse(request.body);
	
		if (newProductID == null || newProductImage == null || newProductName == null || newProductDescription == null) {
			console.log('Missing New Product Data');
			response.status(500).send('Missing New Product Data');
		}

		let imageURI = '';

		try {
			imageURI = await UploadImagePNG(newProductImage, 'newProducts/' + newProductID);
		} catch (err) {
			console.log("Image Upload Failed", err)
			response.status(500).send('Image Upload Failed');
		}

		try {
			await admin.firestore().collection('newProducts').doc(String(newProductID)).set({
				newProductID,
				newProductImage: imageURI,
				newProductName,
				newProductDescription
			});
			response.send('Finished Upload');
		} catch {
			console.log("Server Error New Product adding to storage");
			response.status(500).send('Server Error New Product adding to storage');
		}
	})
});

export const removeProducts = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}

		const { newProductID } = JSON.parse(request.body);
	
		if (newProductID == null) {
			response.status(500).send('Missing NewProductID');
		}

		try {
			await admin.firestore().collection('newProducts').doc(String(newProductID)).delete();
			response.send('Removed' + newProductID);
		} catch {
			response.status(500).send('Removing Failed');
		}
	});
});