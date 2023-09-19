const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

//* Const that hold .env variables
const db_name = process.env.DB_NAME;
const db_user = process.env.DB_USER;
const db_pw = process.env.DB_PASSWORD;

//* Const that holds port number connection
const PORT = process.env.PORT || 3001;
const app = express();

//*
const db = mysql.createConnection(
  {
    host: '127.0.0.1',
    user: db_user,
    password: db_pw,
    database: db_name,
  },
  console.log(`Connected to the movies_db database.`)
);

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
