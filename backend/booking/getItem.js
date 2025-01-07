var express = require('express');
var router = express.Router();
const { connectToDB, ObjectId } = require('../db');

// router.get('/fbooking', async (req, res) => {
//     const db = await connectToDB();
//     try {
//         let booking = await db.collection("booking").find().toArray();
//         console.log(booking); // 輸出資料到控制台
//         res.status(200).json(booking); // 將資料作為 JSON 回應返回
//     } catch (e) {
//         res.status(500).json({ error: 'An error occurred while fetching bookings.' });
//     }
// });

router.get('/booking', async (req, res) => {
    const { district, location, partition, date, type } = req.query;

    try {
        const db = await connectToDB(); // 使用 connectToDB 函数连接数据库

        let booking = await db.collection("booking").find({ 
            type: type,
            district: district,
            location: location,
            partition: partition,
            date: date
        }).toArray();

        console.log(type);
        console.log(booking);
        res.status(200).json(booking); 
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'An error occurred while fetching bookings.' });
    }
});

module.exports = router;//用于导出router对象，
//以便其他模块可以引入该模块并访问其中定义的路由,在您的情况下，这行代码表明您的API路由已经配置在router对象中，通过导出router对象，其他模块（比如您的应用主文件）就可以使用这些定义好的路由。