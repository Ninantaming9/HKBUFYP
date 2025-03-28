const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io'); // 确保在使用之前导入 socket.io
const io = socketIo(server);
const nodemailer = require('nodemailer');
const { MongoClient, ObjectId } = require("mongodb"); 
const stripe = require('stripe')('sk_test_51R02UUR3E9eq8yl0fVUX2ckqB0nJFktPNpOs1rXtZ7di4ylA1jssHwgw5oyj8xLdHzEXj2vdxv5a1NqBCJwL551u00oav1f1ki');



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






const upload = multer(); 



app.post('/uploadPhoto', upload.single('photo'), async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('users');

    const { userId } = req.body;
    const fileBuffer = req.file.buffer; 


    const existingUser = await flightCollection.findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (existingUser.photoPath) {

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

    const { userId } = req.params; 
    const existingUser = await flightCollection.findOne({ _id: new ObjectId(userId) });

    if (!existingUser || !existingUser.photo) {
      return res.status(404).json({ message: 'User not found or no photo available' });
    }


    const photoBase64 = existingUser.photo.toString('base64');
    const photoPath = `data:image/jpeg;base64,${photoBase64}`; 

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

    
    const existingUser = await userCollection.findOne({ email: userData.email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    

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

    if (!userId || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match' });
    }

    
    const user = await userCollection.findOne({ _id: new ObjectId(userId)});

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    
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

  
  let flightNumber = '';
  for (let i = 0; i < 3; i++) {
    flightNumber += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  
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

    
    const flightNumber = generateFlightNumber();

    // Create economy class fligh
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



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zmhaoo2@gmail.com', 
    pass: 'yjzj xdme bovq ouua' 
  }
});


const mailOptions = {
  from: 'zmhaoo2@gmail.com',
  to: 'zmhaoo@gmail.com', 
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

app.post('/findFriends', async (req, res) => {
  try {
    const db = await connectToDB();
    const flightCollection = db.collection('friends');
    const { friendId } = req.body; 
    console.log('Received friendId:', friendId); // Debugging line

    const friend = await flightCollection.findOne({ _id: new ObjectId(friendId) });
    if (friend) {

      const response = {
        userEmail: friend.userEmail, // 这里可以根据需要动态获取
        friendEmail: friend.friendEmail, // 假设 friend 对象中有 email 字段
        fullname: friend.fullname,
        photo: friend.photo,
      };
      res.status(200).json(response); 
    } else {
      res.status(404).json({ message: 'Friend not found.' });
    }
  } catch (error) {
    console.log('Error finding friend', error);
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

    const { flightId, email, fullName, flightNumber } = req.body; 

  
    const deleteResult = await flightCollection.deleteOne({ _id: new ObjectId(flightId) });

    if (deleteResult.deletedCount > 0) {
   
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'zmhaoo2@gmail.com', 
          pass: 'yjzj xdme bovq ouua' 
        }
      });

      const mailOptions = {
        from: 'zmhaoo2@gmail.com',
        to: 'zmhaoo@gmail.com', 
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
    user: 'zmhaoo2@gmail.com', 
    pass: 'yjzj xdme bovq ouua' 
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
    to: 'zmhaoo@gmail.com', 
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

      await flightCollection.updateOne({ email }, { $set: { password: newPassword } });
      delete confirmationCodes[email];

      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      console.error('Error updating password:', error); 
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

  
    const discount = await discountCollection.findOne({ code: discountValue }); 


    if (!discount) {
      return res.status(400).json({ error: 'Invalid discount code' });
    }


    if (discount.isUsed) {
      return res.status(400).json({ error: 'This discount code has already been used' });
    }

    const discountPercentage = parseFloat(discount.discountValue); 
    const discountAmount = (discountPercentage / 100) * originalPrice; 


    const discountedPrice = originalPrice - discountAmount;

    res.status(200).json({ discountedPrice });
  } catch (error) {
    console.log('Error applying discount code', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/addDiscountCode', async (req, res) => {
  const db = await connectToDB();
  const discountCodesCollection = db.collection('discount'); 

  const { code, discountValue, isUsed } = req.body; 

  try {
    
    if (!code || discountValue === undefined || isUsed === undefined) {
      return res.status(400).json({ error: 'Code, discount value, and usage status are required.' });
    }

    
    await discountCodesCollection.insertOne({
      code,            
      discountValue,  
      isUsed,         
      createdAt: new Date() 
    });

    res.status(200).json({ message: 'Discount code added successfully.' });
  } catch (error) {
    console.error('Error adding discount code:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


app.post('/validateTicketQRCode', async (req, res) => {
  const db = await connectToDB();
  const ticketsCollection = db.collection('tickets'); 

  const { qrCode } = req.body; 

  try {
    
    if (!qrCode) {
      return res.status(400).json({ error: 'QR code is required.' });
    }

    
    const ticket = await ticketsCollection.findOne({ qrCode });

    
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

    
    const email = req.body.email ? req.body.email.toString() : '';

    
    if (email.trim() === '') {
      return res.status(400).json({ message: 'Email is required.' });
    }

    
    const query = {
      email: { $regex: email, $options: 'i' } 
    };

    
    console.log('Query:', JSON.stringify(query, null, 2));

    
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


app.post('/addFriend', async (req, res) => {
  let db;
  try {
    db = await connectToDB();
    const friendsCollection = db.collection('friends');

    const { userEmail, friendEmail } = req.body;

    if (!userEmail || !friendEmail) {
      return res.status(400).json({ message: 'User email and friend email are required.' });
    }

    // 查找要添加的好友是否存在
    const friend = await db.collection('users').findOne({ email: friendEmail });

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found.' });
    }

    // 检查用户是否已经是好友
    const existingFriendship = await friendsCollection.findOne({
      $or: [
        { userEmail: userEmail, friendEmail: friendEmail },
        { userEmail: friendEmail, friendEmail: userEmail }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'You are already friends.' });
    }
    
    const user = await db.collection('users').findOne({ email: userEmail });
    // 添加好友关系
    const newFriendship1 = {
      userEmail: userEmail,
      friendEmail: friendEmail,
      fullname: friend.fullname, // 存储好友的全名
      photo: friend.photo, // 存储好友的头像二进制数据
      createdAt: new Date()
    };

    const newFriendship2 = {
      userEmail: friendEmail,
      friendEmail: userEmail,
      fullname: user.fullname, // 存储用户的全名
      photo: user.photo, // 存储用户的头像二进制数据
      createdAt: new Date()
    };

    // 插入两条好友关系
    await friendsCollection.insertOne(newFriendship1);
    await friendsCollection.insertOne(newFriendship2);
    
    // 返回成功响应
    return res.status(201).json({ message: 'Friend added successfully.', friendships: [newFriendship1, newFriendship2] });
  } catch (error) {

    return res.status(500).json({ error: 'Internal server error' });
  } 
  
});


app.get('/getFriends', async (req, res) => {
  try {
    const db = await connectToDB();
    const friendsCollection = db.collection('friends');

    // 从查询参数中获取 userEmail
    const userEmail = req.query.userEmail ? req.query.userEmail.toString() : '';

    // 检查 userEmail 是否为空
    if (userEmail.trim() === '') {
      return res.status(400).json({ message: 'User email is required.' });
    }

    // 使用 JSON 查询
    const query = {
      userEmail: userEmail // 直接使用 userEmail 进行精确匹配
    };

    console.log('Query:', JSON.stringify(query, null, 2));

    const friends = await friendsCollection.find(query).toArray();

    if (friends.length > 0) {
      res.status(200).json({ friends });
    } 
  } catch (error) {
    console.log('Error retrieving friends', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 发送聊天消息
app.post('/chatMessage', async (req, res) => {
  try {
    const { senderemail, receiveremail, content } = req.body;

    // 检查必需的字段是否存在
    if (!senderemail || !receiveremail || !content) {
      return res.status(400).json({ message: 'Sender email, receiver email, and content are required.' });
    }

    // 插入消息到数据库
    const db = await connectToDB();
    await db.collection('messages').insertOne({
      senderemail,
      receiveremail,
      content,
      timestamp: new Date(),
    });

    // 通过 Socket.IO 发送消息
    io.emit('chatMessage', { senderemail, receiveremail, content });

    // 发送成功响应
    res.status(201).json({ message: 'Message sent successfully', data: { senderemail, receiveremail, content } });
  } catch (error) {
    console.log('Error sending chat message', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO 连接
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


app.post('/chathistory', async (req, res) => {
  try {
    const { useremail, receiveremail } = req.body; // 从请求体中获取数据

    // 检查必需的字段是否存在
    if (!useremail || !receiveremail) {
      return res.status(400).json({ message: 'User email and receiver email are required.' });
    }

    console.log('Received body:', req.body); // 添加日志

    // 连接到数据库
    const db = await connectToDB();
    
    // 从数据库中查询与特定用户相关的消息
    const messages = await db.collection('messages').find({
      $or: [
        { senderemail: useremail, receiveremail: receiveremail },
        { senderemail: receiveremail, receiveremail: useremail }
      ]
    }).toArray();

    console.log('Retrieved messages:', messages); // 添加日志

    // 发送成功响应
    res.status(200).json({ message: 'Messages retrieved successfully', data: messages });
  } catch (error) {
    console.log('Error retrieving chat messages', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.post('/paymentshow', async (req, res) => {
  const { amount } = req.body; // 从前端获取金额等参数

  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2020-08-27' }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // 以分为单位
      currency: 'usd',
      customer: customer.id,
    });

    res.send({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});




app.post('/paymentsheet', async (req, res) => {
  try {
    // 从请求体中获取金额并转换为数字
    const amountInYuan = parseFloat(req.body.amount); // 将字符串转换为数字

    // 检查金额是否有效
    if (isNaN(amountInYuan) || amountInYuan <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const amountInCents = Math.round(amountInYuan * 100); // 转换为分并四舍五入

    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-12-18.acacia' }
    );
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // 使用转换后的金额
      currency: 'hkd', // 使用港元
      customer: customer.id,
      payment_method_types: ['card'], // 确保使用支持 HKD 的支付方式
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: 'pk_test_51R02UUR3E9eq8yl01jM5teLmWAuzcpgOPGejTtWoc55HasvWOOGSCbLZ34btPh6VOEIYksP5yoCzeDQYuWgx5rlm00GbVcrOjt'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



app.post('/getLastMessages', async (req, res) => {
  const db = await connectToDB();
  const messagesCollection = db.collection('messages'); 

  const { userEmail } = req.body; // 从请求体中获取 userEmail

  try {
    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required.' }); // 不需要 JSON.stringify
    }

    // 获取所有与该用户的好友的最后一条消息
    const lastMessages = await messagesCollection.aggregate([
      {
        $match: {
          $or: [
            { senderemail: userEmail },
            { receiveremail: userEmail }
          ]
        }
      },
      {
        $sort: { _id: -1 } // 按照消息 ID 降序排序
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderemail', userEmail] },
              '$receiveremail',
              '$senderemail'
            ]
          },
          content: { $first: '$content' } // 获取每个好友的最后一条消息内容
        }
      }
    ]).toArray();

    if (lastMessages.length > 0) {
      return res.status(200).json(lastMessages); // 不需要 JSON.stringify
    } else {
      return res.status(404).json({ error: 'No messages found for the user.' }); // 不需要 JSON.stringify
    }
  } catch (error) {
    console.error('Error retrieving last messages:', error);
    res.status(500).json({ error: 'Internal server error.' }); // 不需要 JSON.stringify
  }
});
