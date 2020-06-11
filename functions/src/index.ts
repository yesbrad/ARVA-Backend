import * as admin from 'firebase-admin';
var serviceAccount = require("../arva-161d140f7f23.json");
const express = require('express');
var cors = require('cors')({ origin: true });
const app = express();
app.use(cors);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'arva-3193d.appspot.com',
});

export * from './api/stockists';
export * from './api/brands';