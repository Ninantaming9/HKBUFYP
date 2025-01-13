const mongoose = require("mongoose");
const mongoUrl = "mongodb+srv://zmhaoo:001477@cluster0.jusax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const { MongoClient, ObjectId } = require("mongodb");  //从 mongodb 模块中导入 MongoClient 和 ObjectId 对象，用于原生 MongoDB 驱动程序的连接和操作
const dotenv = require("dotenv");
const url = mongoUrl || " ";
dotenv.config();





mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log("database connected");
    })
    .catch((e) => {
        console.log(e);
    }); 

async function connectToDB() {
    const client = await MongoClient.connect(url);
    const db = client.db('hkbufypsql');
    db.client = client;
    return db;
}

module.exports = { connectToDB };