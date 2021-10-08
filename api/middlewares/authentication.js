const mongoose = require("mongoose");
const Verification = mongoose.model("Verifications");
const User = mongoose.model("Users");

exports.authenticateToken = (req, res, next) => {
  const tokenOfRequest = req.headers.token;
  if (!tokenOfRequest) return res.sendStatus(401); // if there isn't any token (also to cover for potential undefined)

  Verification.findOne({ token: tokenOfRequest }, (err, ver) => {
    if (err) return res.sendStatus(403);
    if (!ver) return res.status(403).send({ message: "No such session." });
    User.findOne({ phoneNumber: ver.phone }, (err, user) => {
      if (err) return res.sendStatus(403);
      if (!user) return res.status(404).send({ message: "No such user." });
      req.user = user;
      next();
    });
  });
};
