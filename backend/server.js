const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // 使用CORS中间件
app.use(bodyParser.json());

app.post('/log', (req, res) => {
  const message = req.body.message;
  console.log('Received message:', message);
  res.send('Message received by server');
});

app.listen(port, () => {
  console.log(`Server running on http://192.168.1.100:${port}`);
});