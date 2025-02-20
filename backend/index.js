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
    res.status(200).json({ message: 'Login successful', userId: user._id,fullname: user.fullname,role:user.role, email: user.email  });
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


function generateFlightNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  // 生成前三位大写字母
  let flightNumber = '';
  for (let i = 0; i < 3; i++) {
    flightNumber += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // 生成后三位数字
  for (let i = 0; i < 3; i++) {
    flightNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return flightNumber;
}

app.post('/createFlight', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flight'); 

    const { ticketType, date, departureTime, arrivalTime, departureLocation, arrivalLocation, economyClassPrice, businessClassPrice } = req.body;

    // 生成航班号
    const flightNumber = generateFlightNumber();

    // Create economy class flight data
    const economyFlightData = {
      ticketType,
      flightNumber,
      date,
      departureTime,
      arrivalTime,
      departureLocation,
      arrivalLocation,
      cabinClass: 'Economy Class',
      ticketPrice: economyClassPrice
    };

    // Create business class flight data
    const businessFlightData = {
      ticketType,
      flightNumber,
      date,
      departureTime,
      arrivalTime,
      departureLocation,
      arrivalLocation,
      cabinClass: 'Business Class',
      ticketPrice: businessClassPrice
    };

    // Insert economy class flight data
    await flightCollection.insertOne(economyFlightData);
    // Insert business class flight data
    await flightCollection.insertOne(businessFlightData);

    res.status(200).json({ message: 'Flight information created successfully for both classes' });
  } catch (error) {
    console.log('Error creating flight information', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.post('/searchFlight', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flight');

    const { ticketType, date, departureLocation, arrivalLocation, cabinClass, priceRange } = req.body;

    // Parse the price range
    let priceQuery = {};
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      priceQuery = {
        $expr: {
          $and: [
            { $gte: [{ $toDouble: "$ticketPrice" }, minPrice] },
            { $lte: [{ $toDouble: "$ticketPrice" }, maxPrice] }
          ]
        }
      };
    }

    // Log the query for debugging
    const query = {
      ticketType,
      date,
      departureLocation,
      arrivalLocation,
      cabinClass,
      ...priceQuery
    };
    console.log('Search Query:', query);

    const flightData = await flightCollection.find(query).toArray(); 

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
    const discountCollection = db.collection('discount');

    const { fullName, dateBirth, nationality, passport, mobile, ticketType, flightNumber, date, departureTime, arrivalTime, departureLocation, arrivalLocation, cabinClass, ticketPrice, seat, totalPrice, userId, email,discountValue,isUsed } = req.body;
     
    const flightbookData = {
      userId,
      email,
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
      totalPrice,
      discountValue,
      isUsed
    };
    console.log('Flightbook data:', flightbookData);
    await flightbookCollection.insertOne(flightbookData);
    await discountCollection.updateOne({ code: discountValue }, { $set: { isUsed: true } });


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
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.4;">
      <h2 style="font-size: 18px;">Dear ${fullName},</h2>
      <p>Your flight booking has been confirmed!</p>
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
        <tr>
          <th style="border: 1px solid #dddddd; padding: 4px; text-align: left; font-size: 14px;">Flight Number</th>
          <td style="border: 1px solid #dddddd; padding: 4px; font-size: 14px;">${flightNumber}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #dddddd; padding: 4px; text-align: left; font-size: 14px;">Date</th>
          <td style="border: 1px solid #dddddd; padding: 4px; font-size: 14px;">${date}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #dddddd; padding: 4px; text-align: left; font-size: 14px;">Departure</th>
          <td style="border: 1px solid #dddddd; padding: 4px; font-size: 14px;">${departureLocation} at ${departureTime}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #dddddd; padding: 4px; text-align: left; font-size: 14px;">Arrival</th>
          <td style="border: 1px solid #dddddd; padding: 4px; font-size: 14px;">${arrivalLocation} at ${arrivalTime}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #dddddd; padding: 4px; text-align: left; font-size: 14px;">Seat</th>
          <td style="border: 1px solid #dddddd; padding: 4px; font-size: 14px;">${seat}</td>
        </tr>
        <tr>
          <th style="border: 1px solid #dddddd; padding: 4px; text-align: left; font-size: 14px;">Total Price</th>
          <td style="border: 1px solid #dddddd; padding: 4px; font-size: 14px;">${totalPrice}</td>
        </tr>
      </table>
      <p>Thank you for booking with us!</p>
      <p>Best regards,<br>Airplane Company</p>
    </div>
  `
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
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.4;">
            <h2 style="font-size: 18px;">Dear ${fullName},</h2>
            <p>Your flight booking has been cancelled.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
              <tr>
                <th style="border: 1px solid #dddddd; padding: 4px; text-align: left; font-size: 14px;">Flight Number</th>
                <td style="border: 1px solid #dddddd; padding: 4px; font-size: 14px;">${flightNumber}</td>
              </tr>
            </table>
            <p>Thank you for using our service!</p>
            <p>Best regards,<br>Airplane Company</p>
          </div>
        `
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


const confirmationCodes = {};

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zmhaoo2@gmail.com', // 您的 Gmail 地址
    pass: 'yjzj xdme bovq ouua' // 您的 Gmail 密码或应用专用密码
  }
});

// Route to request a password reset
app.post('/requestPasswordReset', async (req, res) => {
  const { email } = req.body;

  // Generate a random confirmation code
  const confirmationCode = crypto.randomBytes(3).toString('hex'); // Generates a 6-character hex code

  // Store the confirmation code (you should store it in a database with an expiration time)
  confirmationCodes[email] = confirmationCode;

  // Send the confirmation code to the user's email
  const mailOptions = {
    from: 'zmhaoo2@gmail.com',
    to: 'zmhaoo@gmail.com', // 使用用户的邮箱
    subject: 'Password Reset Confirmation Code',
    text: `Your confirmation code is: ${confirmationCode}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Confirmation code sent to your email.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send confirmation code.' });
  }
});

app.post('/resetPassword', async (req, res) => {
  const db = await connectToDB();
  const flightCollection = db.collection('users');

  const { email, confirmationCode, newPassword } = req.body;

  // Check if the confirmation code is valid
  if (confirmationCodes[email] && confirmationCodes[email] === confirmationCode) {
    try {
      // 直接将新密码存储到数据库中（不使用 bcrypt）
      await flightCollection.updateOne({ email }, { $set: { password: newPassword } });

      // 移除确认代码
      delete confirmationCodes[email];

      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      console.error('Error updating password:', error); // 打印完整的错误信息
      res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    res.status(400).json({ error: 'Invalid confirmation code.' });
  }
});

app.post('/applyDiscountCode', async (req, res) => {
  try {
    const { discountValue, originalPrice } = req.body;

    const db = await connectToDB();
    const discountCollection = db.collection('discount');

    // 查找折扣码
    const discount = await discountCollection.findOne({ code: discountValue }); // 使用 code 查找

    // 检查折扣码是否存在
    if (!discount) {
      return res.status(400).json({ error: 'Invalid discount code' });
    }

    // 检查折扣码是否已被使用
    if (discount.isUsed) {
      return res.status(400).json({ error: 'This discount code has already been used' });
    }

    // 获取折扣值并转换为数字
    const discountPercentage = parseFloat(discount.discountValue); // 将 "10%" 转换为 10
    const discountAmount = (discountPercentage / 100) * originalPrice; // 计算折扣金额

    // 计算折扣后的价格
    const discountedPrice = originalPrice - discountAmount;

    // 更新折扣码为已使用
   // await discountCollection.updateOne({ code: discountValue }, { $set: { isUsed: true } });

    // 返回折扣后的价格
    res.status(200).json({ discountedPrice });
  } catch (error) {
    console.log('Error applying discount code', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/addDiscountCode', async (req, res) => {
  const db = await connectToDB();
  const discountCodesCollection = db.collection('discount'); // 存储折扣码的集合

  const { code, discountValue, isUsed } = req.body; // 从请求体中提取折扣码信息

  try {
    // 检查折扣码信息是否完整
    if (!code || discountValue === undefined || isUsed === undefined) {
      return res.status(400).json({ error: 'Code, discount value, and usage status are required.' });
    }

    // 将折扣码存储到 discountCodes 集合中
    await discountCodesCollection.insertOne({
      code,            // 折扣码
      discountValue,  // 折扣优惠价
      isUsed,         // 是否使用过
      createdAt: new Date() // 可选：记录创建时间
    });

    res.status(200).json({ message: 'Discount code added successfully.' });
  } catch (error) {
    console.error('Error adding discount code:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


app.post('/validateTicketQRCode', async (req, res) => {
  const db = await connectToDB();
  const ticketsCollection = db.collection('tickets'); // 存储机票信息的集合

  const { qrCode } = req.body; // 从请求体中提取二维码信息

  try {
    // 检查二维码是否提供
    if (!qrCode) {
      return res.status(400).json({ error: 'QR code is required.' });
    }

    // 查询数据库中是否存在该二维码对应的机票信息
    const ticket = await ticketsCollection.findOne({ qrCode });

    // 如果找到机票信息，返回 true；否则返回 false
    if (ticket) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(200).json({ valid: false });
    }
  } catch (error) {
    console.error('Error validating ticket QR code:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/searchBookbyadmin', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('flightbook');

    // 从请求体中提取电子邮件并转换为字符串
    const email = req.body.email ? req.body.email.toString() : '';

    // 如果没有提供电子邮件，返回 400 错误
    if (email.trim() === '') {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // 构建查询条件
    const query = {
      email: { $regex: email, $options: 'i' } // 使用正则表达式进行不区分大小写的匹配
    };

    // 打印查询条件以进行调试
    console.log('Query:', JSON.stringify(query, null, 2));

    // 查询数据库
    const flights = await flightCollection.find(query).toArray();

    if (flights.length > 0) {
      res.status(200).json(flights);
    } else {
      res.status(404).json({ message: 'No flight bookings found.' });
    }
  } catch (error) {
    console.log('Error finding flight bookings', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



