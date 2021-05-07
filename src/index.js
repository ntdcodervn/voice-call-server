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
// token expire time, hardcode to 3600 seconds = 1 hour
var expirationTimeInSeconds = 3600;
var role = RtcRole.PUBLISHER;
app.get("/access-token", nocache, (req, resp) => {
  var currentTimestamp = Math.floor(Date.now() / 1000);
  var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  var channelName = req.query.channelName;
  // use 0 if uid is not specified
  var uid = req.query.uid || 0;
  if (!channelName) {
    return resp.status(400).json({ error: "channel name is required" }).send();
  }
  var key = RtcTokenBuilder.buildTokenWithUid(
    configs.APP_ID,
    configs.APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  resp.header("Access-Control-Allow-Origin", "*");
  //resp.header("Access-Control-Allow-Origin", "http://ip:port")
  console.log(key);

  return resp.json({ token: key }).send();
});

app.get("/access-token-rtm", nocache, (req, resp) => {
  var currentTimestamp = Math.floor(Date.now() / 1000);
  var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  var account = req.query.account;
  if (!account) {
    return resp.status(400).json({ error: "account is required" }).send();
  }

  var key = RtmTokenBuilder.buildToken(
    configs.APP_ID,
    configs.APP_CERTIFICATE,
    account,
    RtmRole,
    privilegeExpiredTs
  );

  resp.header("Access-Control-Allow-Origin", "*");
  //resp.header("Access-Control-Allow-Origin", "http://ip:port")
  return resp.json({ token: key }).send();
});
