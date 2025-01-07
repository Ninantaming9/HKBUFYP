const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { MongoClient, ObjectId } = require("mongodb");  //从 mongodb 模块中导入 MongoClient 和 ObjectId 对象，用于原生 MongoDB 驱动程序的连接和操作
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();
const mongoUrl = process.env.db_url;
const multer = require('multer');
module.exports = { connectToDB };

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const jwt = require('jsonwebtoken');


app.listen(port, () => {
  console.log('Server running on port 3000');
});

const User = require('./models/user');
// const mongoUrl = "mongodb+srv://zmhaoo:001477@cluster0.jusax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// const stripe = require('stripe')(sk_test_51QdSLJGT44XrrjFfVpOWy3qowZsBnYSwYZRZLjaNJvLvhb5X5EtWbvrWxIGUpOEXhAU4FYoNPf6A2vnWXPQreVUU00LnxSQrgD)

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

//upload image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
};

// Initialize Multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter 
})

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





app.post('/uploadProfilePicture', upload.single('photo'), async (req, res) => {
  try {
    const db = await connectToDB(); // Connect to the database
    const userCollection = db.collection('users'); // Get users collection

    const userId = req.body.userId; // Get userId from request body
    const filePath = req.file.path; // Get uploaded file path

    // Check if user exists
    const existingUser = await userCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update user's profile picture URL in the database
    await userCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { profilePicture: filePath } } // Save file path to profilePicture field
    );

    res.status(200).json({ message: 'Profile picture uploaded successfully!', user: { ...existingUser, profilePicture: filePath } });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(200).json({ message: 'Login successful', userId: user._id,fullname: user.fullname });
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
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:', flightCount);
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

    const { fullName,dateBirth,nationality,passport,mobile, ticketType, flightNumber, date, departureTime, arrivalTime, departureLocation, arrivalLocation, cabinClass, ticketPrice,seat,totalPrice,userId } = req.body;
     
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
    await flightbookCollection.insertOne(flightbookData);

    res.status(200).json({ message: 'FlightBooking information created successfully' });
  } catch (error) {
    console.log('Error creating flight information', error);
    res.status(500).json({ error: 'Internal server error' });
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

    const { flightId } = req.body; 


    const deleteResult = await flightCollection.deleteOne({ _id: new ObjectId(flightId) });

    if (deleteResult.deletedCount > 0) {
      res.status(200).json({ message: 'Flight deleted successfully' });
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





