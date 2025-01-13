// const express = require('express');
// const router = express.Router();
// const { connectToDB } = require('../db');
// const User = require('../models/User'); // 假设有一个 User 模型来表示用户
// const express = require('express');
// const cors = require('cors');
// const app = express();
// app.use(cors());
// router.use(express.json());


// router.post('/register', async (req, res) => {
//     const { username, password, email, mobile } = req.body;

//     try {
//         const db = await connectToDB();
//         const userCollection = db.collection('users');

//         // 检查用户名是否已存在
//         const existingUser = await userCollection.findOne({ username: username });
//         if (existingUser) {
//             return res.status(400).json({ message: 'Username already exists' });
//         }

//         // 创建新用户
//         const newUser = {
//             username: username,
//             email: email,
//             password: password,
//             mobile: mobile
//         };

//         // 插入新用户到数据库
//         await userCollection.insertOne(newUser);
//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while registering user' });
//     }
// });

// module.exports = router;