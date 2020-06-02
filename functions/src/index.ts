import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
var serviceAccount = require("../arva-161d140f7f23.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'arva-3193d.appspot.com',
});

const imgSix = 'iVBORw0KGgoAAAANSUhEUgAAAD0AAAA8CAYAAADVPrJMAAAACXBIWXMAAAsSAAALEgHS3X78AAABlElEQVRoge2arU4DQRSFDwRMDaYGU4OpwaDRmBo0b8BLABKN4BHQCBSGNKnBYGpqMDWYGkwNAnLILpBAZxb2TFNy7pc0TTqbmfn23vnZ7qy9Ht+cATiFD8N1I9kPQtqFkHYhpF0IaRcspTdWoA+fHO0C+73F5aMpcDVu3Uyktwsh7UJIuxDSLoS0CyHtQki7ENIuhLQLmr+LLgfp8pM7YDZfmVsa6e1CSLuwHOnOpqae+YukGo10bmbud5vVk7vuX0mn3lrU7G0D3U67dhqikZ4+p8spw1c2i+htpctRRXkyk3RXszl5eAIOdtLXMNqU4/soflCNdf5+2G/Whii9NdKMNKOQG5N1RHNR/QlKi9DN3rePsqq+QWFRakMqzU6VEGdKX0+kVWrXaXZOGJF3Lu7lDyv6zQk7qRJnXbmV4Q+U2ZGxs21SnaLnI33WVJQ7fsFU5wTE5ajpjozjlzer5KRY/MwJI8aoc3PCHReXLH5/pRbluBUuSymWc9CGQoWj9xvi0dKFkHYhpF0IaRdC2gU/aQBvCrhnlpN89O4AAAAASUVORK5CYII=';

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