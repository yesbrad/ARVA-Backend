import * as admin from 'firebase-admin';
var serviceAccount = require("../arva-161d140f7f23.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'arva-3193d.appspot.com',
});

export * from './api/stockists';