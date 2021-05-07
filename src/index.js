const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const configs = require("./config");

const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const app = express();

app.listen(configs.PORT, () => {
  console.log("server run on port " + configs.PORT);
});

app.use(bodyParser.json({ type: "application/*+json" }));
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    `Origin, X-Requested-With, Content-Type, Accept, Authorization`
  );

  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});

const nocache = (req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
};

app.get("/access-token", nocache, (req, res) => {
  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(500).json({ error: "channel is required" });
  }

  // get uid
  let phone = req.query.phone;
  if (!phone || phone == "") {
    phone = 0;
  }
  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == "publisher") {
    role = RtcRole.PUBLISHER;
  }
  // get the expire time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    configs.APP_ID,
    configs.APP_CERTIFICATE,
    channelName,
    phone,
    role,
    privilegeExpireTime
  );
  res.json({ token: token });
});
