
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
require('dotenv').config();
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app;
