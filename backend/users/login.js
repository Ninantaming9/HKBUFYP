
const express = require('express');
const router = express.Router();
const { connectToDB } = require('./db'); // 假设您已经定义了连接到数据库的函数


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = await connectToDB(); // 连接到数据库
        const userCollection = db.collection('users');

        // 查找用户
        const user = await userCollection.findOne({ username: username, password: password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while logging in' });
    }
});

module.exports = router;