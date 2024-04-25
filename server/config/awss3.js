const AWS = require('aws-sdk');

// AWS 설정
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRECT_KEY,
  region: 'ap-southeast-1'
});

// S3 객체 생성
const s3 = new AWS.S3();
module.exports = s3;