const express = require('express');
const cookieParser = require('cookie-parser');
// const auth = require('../middlewares/auth');
const cors = require('cors');
const whitelist=['https://eun.manoit.kr','https://d5sii0aelmrln.cloudfront.net','http://eun.manoit.kr.s3-website-ap-southeast-1.amazonaws.com','http://localhost:3000'];
module.exports = (app) => {
    app.use(cors({origin: whitelist, credentials: true}));
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use(cookieParser());
    // app.use(auth);
};