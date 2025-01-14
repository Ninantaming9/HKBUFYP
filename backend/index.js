const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');

const nodemailer = require('nodemailer');
const { MongoClient, ObjectId } = require("mongodb");  //从 mongodb 模块中导入 MongoClient 和 ObjectId 对象，用于原生 MongoDB 驱动程序的连接和操作
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();
const mongoUrl = process.env.db_url;
const fs = require('fs');
module.exports = { connectToDB };
const path = require('path');
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const multer = require('multer');
const jwt = require('jsonwebtoken');

app.listen(port, () => {
  console.log('Server running on port 3000');
});

mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log("database connected");
    })
    .catch((e) => {
        console.log(e);
    }); 

async function connectToDB() {
    const client = await MongoClient.connect(mongoUrl);
    const db = client.db('hkbufypsql');
    db.client = client;
    return db;
}






const upload = multer(); // 不指定存储位置，使用内存存储
// 上传照片的 API

// 上传照片的 API
app.post('/uploadPhoto', upload.single('photo'), async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('users');

    const { userId } = req.body; // 从请求体中获取 userId
    const fileBuffer = req.file.buffer; // 获取文件的二进制数据

    // 检查用户是否存在
    const existingUser = await flightCollection.findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    // 如果用户已有照片，删除原来的照片（如果需要）
    if (existingUser.photoPath) {
      // 这里可以选择是否删除原来的照片
      // 例如，如果你将照片存储在 GridFS 中，可以在这里删除
    }


    await flightCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { photo: fileBuffer } } 
    );

    res.status(200).json({ message: 'Photo uploaded successfully' });
  } catch (error) {
    
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


app.get('/getPhoto/:userId', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('users');

    const { userId } = req.params; // 从请求参数中获取 userId
    const existingUser = await flightCollection.findOne({ _id: new ObjectId(userId) });

    if (!existingUser || !existingUser.photo) {
      return res.status(404).json({ message: 'User not found or no photo available' });
    }

    // 将二进制数据转换为 Base64 字符串
    const photoBase64 = existingUser.photo.toString('base64');
    const photoPath = `data:image/jpeg;base64,${photoBase64}`; // 根据实际的 MIME 类型设置

    res.status(200).json({ photoPath });
  } catch (error) {
    console.error('Error fetching user photo:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});



app.post('/register', async (req, res) => {
  try {
    const db = await connectToDB();
    const userCollection = db.collection('users');
    
    const userData = req.body;

    if (!userData.fullname || !userData.email || !userData.password || !userData.confirmPassword) {
       return res.status(400).json({ message: 'Please fill in all fields' });

    }

    if (userData.password !== userData.confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });

    }

    // 检查数据库中是否已存在相同邮箱账号
    const existingUser = await userCollection.findOne({ email: userData.email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    
    // 如果邮箱账号不存在冲突且密码匹配，则插入新用户数据
    await userCollection.insertOne(userData);
    
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log('Error creating user', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/login', async (req, res) => {
  try {
    const db = await connectToDB();
    const userCollection = db.collection('users'); 

    const { email, password } = req.body;

    const user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    res.status(200).json({ message: 'Login successful', userId: user._id,fullname: user.fullname,role:user.role });
  } catch (error) {
    console.log('Error logging in', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});




app.put('/changePassword', async (req, res) => {
  try {
    const db = await connectToDB();
    const userCollection = db.collection('users');

    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    // 检查请求体中的必需字段
    if (!userId || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 检查新密码和确认密码是否匹配
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match' });
    }

    // 检查用户是否存在
    const user = await userCollection.findOne({ _id: new ObjectId(userId)});

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 检查旧密码是否匹配
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    // 更新用户密码（直接使用明文密码）
    await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { password: newPassword } });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/createFlight', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flight'); 

    const { ticketType, flightNumber, date, departureTime, arrivalTime, departureLocation, arrivalLocation, cabinClass, ticketPrice } = req.body;

    const flightData = {
      ticketType,
      flightNumber,
      date,
      departureTime,
      arrivalTime,
      departureLocation,
      arrivalLocation,
      cabinClass,
      ticketPrice
    };

    await flightCollection.insertOne(flightData);

    res.status(200).json({ message: 'Flight information created successfully' });
  } catch (error) {
    console.log('Error creating flight information', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/searchFlight', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flight');

    const { ticketType, date, departureLocation, arrivalLocation, cabinClass } = req.body;


    const flightData = await flightCollection.find({
      ticketType,
      date,
      departureLocation,
      arrivalLocation,
      cabinClass
    }).toArray(); 
    if (flightData.length > 0) {
      const flightCount = flightData.length; 
      res.status(200).json({ flightCount, flights: flightData }); 
    } else {
      res.status(404).json({ message: 'No matching flights found. Please try again.' });
    }
  } catch (error) {
    console.log('Error searching for flight', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/getAllFlightBookings', async (req, res) => {
  try {
      const db = await connectToDB();
      const flightBookingCollection = db.collection('flightbook');
      const userId = req.query.userId; // Get userId from query parameters

      const bookingsData = await flightBookingCollection.find({ userId }).toArray();

      if (bookingsData.length > 0) {
          res.status(200).json({ bookingCount: bookingsData.length, bookings: bookingsData });
      } else {
          res.status(404).json({ message: 'No flight bookings found for this user.' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/createFlightbook', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightbookCollection = db.collection('flightbook'); 

    const { fullName, dateBirth, nationality, passport, mobile, ticketType, flightNumber, date, departureTime, arrivalTime, departureLocation, arrivalLocation, cabinClass, ticketPrice, seat, totalPrice, userId, email } = req.body;
     
    const flightbookData = {
      userId,
      fullName,
      dateBirth,
      nationality,
      passport,
      mobile,
      ticketType,
      flightNumber,
      date,
      departureTime,
      arrivalTime,
      departureLocation,
      arrivalLocation,
      cabinClass,
      ticketPrice,
      seat,
      totalPrice
    };
    console.log('Flightbook data:', flightbookData);
    await flightbookCollection.insertOne(flightbookData);


// 创建邮件发送器
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zmhaoo2@gmail.com', // 您的 Gmail 地址
    pass: 'yjzj xdme bovq ouua' // 您的 Gmail 密码或应用专用密码
  }
});


const mailOptions = {
  from: 'zmhaoo2@gmail.com',
  to: 'zmhaoo@gmail.com', // 您要发送的目标邮箱
      subject: 'Flight Booking Confirmation',
      text: `Dear ${fullName},\n\nYour flight booking has been confirmed!\n\nFlight Number: ${flightNumber}\nDate: ${date}\nDeparture: ${departureLocation} at ${departureTime}\nArrival: ${arrivalLocation} at ${arrivalTime}\nSeat: ${seat}\nTotal Price: ${totalPrice}\n\nThank you for booking with us!\n\nBest regards,\nAirplane Company`
    };

    // 等待邮件发送完成
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'FlightBooking information created successfully and email sent' });
  } catch (mailError) {
    console.log('Error sending email:', mailError);
  return res.status(500).json({ error: 'Failed to send email' });
  }
});



//find flight id
app.post('/findFlightId', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flight');

    const { flightId } = req.body; 



    const flight = await flightCollection.findOne({ _id: new ObjectId(flightId) });
    if (flight) {
      res.status(200).json(flight); 
    } else {
      res.status(404).json({ message: 'Flight not found.' });
    }
  } catch (error) {
    console.log('Error booking flight', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/findFlightBookId', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flightbook');

    const { flightId } = req.body; 

    

    const flight = await flightCollection.findOne({ _id: new ObjectId(flightId) });
    if (flight) {
      res.status(200).json(flight);
    } else {
      res.status(404).json({ message: 'Flight not found.' });
    }
  } catch (error) {
    console.log('Error booking flight', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









app.post('/findUserID', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('users');

    const { userId } = req.body; 

  
    const UserId = await flightCollection.findOne({ _id: new ObjectId(userId) });
    if (UserId) {
      res.status(200).json(UserId);
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.log('Error booking flight', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/getSelectedSeatsByFlight', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightbookCollection = db.collection('flightbook');
    const { flightId, flightNumber, departureTime, arrivalTime, departureLocation, arrivalLocation, ticketPrice } = req.body;

    // 在 flightbook 表中搜索匹配的数据
    const selectedSeats = await flightbookCollection.distinct('seat', {
      flightId,
      flightNumber,
      departureTime,
      arrivalTime,
      departureLocation,
      arrivalLocation,
      ticketPrice
    });
    res.status(200).json({ selectedSeats });
  } catch (error) {
    console.log('Error retrieving selected seats by flight', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/deleteFlightById', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flightbook');

    const { flightId, email, fullName, flightNumber } = req.body; // 从请求体中获取用户信息

    // 删除机票
    const deleteResult = await flightCollection.deleteOne({ _id: new ObjectId(flightId) });

    if (deleteResult.deletedCount > 0) {
      // 创建邮件发送器
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'zmhaoo2@gmail.com', // 您的 Gmail 地址
          pass: 'yjzj xdme bovq ouua' // 您的 Gmail 密码或应用专用密码
        }
      });

      const mailOptions = {
        from: 'zmhaoo2@gmail.com',
        to: 'zmhaoo@gmail.com', // 使用用户的邮箱
        subject: 'Flight Cancellation Confirmation',
        text: `Dear ${fullName},\n\nYour flight booking has been cancelled.\n\nFlight Number: ${flightNumber}\n\nThank you for using our service!\n\nBest regards,\nAirplane Company`
      };

      // 等待邮件发送完成
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'Flight deleted successfully and cancellation email sent' });
    } else {
      res.status(404).json({ message: 'Flight not found.' });
    }
  } catch (error) {
    console.log('Error deleting flight', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/payment', async (req, res) => {
  try {
      
  } catch (error) {
    console.log('Error deleting flight', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





