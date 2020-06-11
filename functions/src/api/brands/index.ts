import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UploadImagePNG, BearerToJWT } from '../../utill';

export const getBrands = functions.https.onRequest(async (request, response) =>  {
	try {
		const res = await admin.firestore().collection('brands').get();
		const brands: any = [];
		res.docs.map((val) => { brands.push({...val.data()})});
		response.setHeader("Access-Control-Allow-Origin", '*');
		response.send({ brands });
	} catch {
		console.log("Server Error Stockist")
		response.sendStatus(500);
	}
});

export const addBrand = functions.https.onRequest(async (request, response) => {
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

export const removeBrand = functions.https.onRequest(async (request, response) => {
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

	const { brandID } = JSON.parse(request.body);
	
	if(brandID == null) {
		response.status(500).send('Missing ID');
	}

	try {
		await admin.firestore().collection('brands').doc(String(brandID)).delete();
		response.send('Removed' + brandID);
	} catch {
		response.status(500).send('Removing Failed');
	}
});