const aws = require('aws-sdk');
aws.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});
const s3 = new aws.S3({ params: { Bucket: process.env.S3_BUCKET } });

module.exports = s3;
