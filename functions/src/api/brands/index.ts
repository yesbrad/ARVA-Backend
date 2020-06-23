import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UploadImagePNG, BearerToJWT } from '../../utill';
var cors = require('cors')({ origin: true });

export const getBrands = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			const res = await admin.firestore().collection('brands').get();
			const brands: any = [];
			res.docs.map((val) => { brands.push({ ...val.data() }) });
			response.setHeader("Access-Control-Allow-Origin", '*');
			response.send({ brands });
		} catch {
			console.log("Server Error Stockist")
			response.sendStatus(500);
		}
	})
});

export const addBrand = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}

		const { brandID, brandImage } = JSON.parse(request.body);
		
		if(brandID == null || brandImage == null) {
			console.log('Missing Stockist Data');
			response.status(500).send('Missing Stockist Data');
		}

		let imageURI= '';

		try {
			imageURI = await UploadImagePNG(brandImage, 'brands/' + brandID);
		} catch (err) {
			console.log("Image Upload Failed", err)
			response.status(500).send('Image Upload Failed');
		}

		try {
			await admin.firestore().collection('brands').doc(String(brandID)).set({
				brandID,
				brandImage: imageURI,
			});
			response.send('Finished Upload');
		} catch {
			console.log("Server Error Brands adding to storage");
			response.status(500).send('Server Error Brands adding to storage');
		}
	});
});

export const removeBrand = functions.https.onRequest(async (request, response) => {
	return cors(request, response, async () => {
		try {
			await admin.auth().verifyIdToken(BearerToJWT(request.headers.authorization))
		} catch {
			response.status(401).send('Invalid Token');
		}

		const { brandID } = JSON.parse(request.body);
	
		if (brandID == null) {
			response.status(500).send('Missing ID');
		}

		try {
			await admin.firestore().collection('brands').doc(String(brandID)).delete();
			response.send('Removed' + brandID);
		} catch {
			response.status(500).send('Removing Failed');
		}
	})
});