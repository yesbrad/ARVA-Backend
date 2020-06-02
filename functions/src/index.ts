import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
var serviceAccount = require("../arva-161d140f7f23.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'arva-3193d.appspot.com',
});

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

	console.log(request.body);

	const { ID, image64, title} = JSON.parse(request.body);
	
	if(ID == null || image64 == null || title == null) {
		console.log('Missing Stockist Data');
		response.status(500).send('Missing Stockist Data');
	}

	let imageURI= '';

	try {
        console.log("Beginning Up;loading Imaage");
		const bucket = admin.storage().bucket();
		const imageBuffer = Buffer.from(image64, 'base64')
        const imageByteArray = new Uint8Array(imageBuffer);
        const file = bucket.file('stockist/' + ID + '.png');
		const options = { resumable: false, metadata: { contentType: "image/png" } }
		
		await file.save(imageByteArray, options);

        console.log("About to get URL");
		const url = await file.getSignedUrl({action: 'read', expires: '01-01-2222'})
        console.log("url", url)

		if(url[0] !== null){
            console.log(" url[0]",  url[0])
			imageURI = url[0];
		} else {
            console.log("ImageURI was empty")
			response.status(500).send('ImageURI was empty!');
		}
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