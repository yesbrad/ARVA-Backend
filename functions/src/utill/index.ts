import * as admin from 'firebase-admin';

export const UploadImagePNG = async (image64: string, path: string) => {
	console.log("Beginning Uploading Image");
	const bucket = admin.storage().bucket();
	const imageBuffer = Buffer.from(image64, 'base64')
	const imageByteArray = new Uint8Array(imageBuffer);
	const file = bucket.file(path + '.png');
	const options = { resumable: false, metadata: { contentType: "image/png" } }
	
	await file.save(imageByteArray, options);

	console.log("About to get URL");
	const url = await file.getSignedUrl({action: 'read', expires: '01-01-2222'})
	console.log("url", url)

	if(url[0] !== null){
		return url[0];
	} else {
		console.log("ImageURI was empty")
		throw new Error("ImageURI was empty");
	}
};

export const BearerToJWT = (bearer: any) => String(bearer).replace('Bearer ', '')