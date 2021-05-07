require('dotenv').config()

const config = {
  APP_ID: process.env.APP_ID,
  APP_CERTIFICATE: process.env.APP_CERTIFICATE,
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
};

module.exports = config;
