"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3_BUCKET_NAME = exports.s3Client = exports.dbPool = void 0;
var promise_1 = require("mysql2/promise");
var client_s3_1 = require("@aws-sdk/client-s3");
// Database configuration
exports.dbPool = (0, promise_1.createPool)({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// S3 configuration
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
exports.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
