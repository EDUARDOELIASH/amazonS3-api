require('dotenv').config();
const expres = require('express');
const app = expres();
const cors = require('cors');

app.listen(80);
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,
});

const bucket = process.env.BUCKET;
const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        bucket: bucket,
        s3: s3,
        key: (req, file, cb) => {
            console.log(file);
            cb(null, file.originalname);
        },
    }),
});

app.post("/upload", upload.single("file"), (req, res) => {
    res.send('Archivo subido correctamente' + req.file.location + ' ubicacion');
});

app.get('/list', async (req, res) => {
    let r = await s3.listObjectsV2({
        Bucket: bucket,
    }).promise();
    let x = r.Contents.map(item => item.Key);
    res.send(x);
});

const corsOptions = {
    origin: 'http://localhost:8668', // or any other origin you want to allow
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.get('/download/:filename', cors(corsOptions), async (req, res) => {
    // your code here
    let x = await s3.getObject({
        Bucket: bucket,
        Key: req.params.filename,
    }).promise();
    res.send(x.Body);
});

app.delete('/delete/:filename',async(req,res)=>{
    await s3.deleteObject({Bucket:bucket, Key:req.params.filename}).promise();
    res.send("deleted");
});
