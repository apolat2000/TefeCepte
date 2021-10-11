const mongoose = require("mongoose");
const Verification = mongoose.model("Verifications");
const User = mongoose.model("Users");
const crypto = require("crypto");

exports.verify_code = (req, res) => {
  // /verify/:code/:phone
  const reqCode = req.params.code;
  if (!reqCode) {
    res.status(400).send({ message: "Expected first route parameter: code." });
    return;
  }
  const reqPhone = req.params.phone;
  if (!reqPhone) {
    res
      .status(400)
      .send({ message: "Expected second route parameter: phoneNumber." });
    return;
  }
  Verification.findOne({ phone: reqPhone, code: reqCode }, (err, ver) => {
    if (err) {
      res.send(err);
      return;
    }
    if (!ver) {
      res.status(200).send({ verified: false, message: "Wrong code." });
      return;
    }
    if (ver.alreadyVerified) {
      res.status(200).send({ verified: false, message: "Already verified." });
      return;
    }
    const verificationCreatedAt = ver.createdAt;
    const diff = Date.now() - verificationCreatedAt;
    if (diff > 120000) {
      // if more than 120 seconds
      res.status(200).send({ verified: false, message: "Too late." });
      return;
    }
    User.findOne({ phoneNumber: reqPhone }, (err, user) => {
      if (err) {
        res.send(err);
        return;
      }
      const token = crypto.randomBytes(30).toString("hex");
      Verification.findOneAndUpdate(
        { phone: reqPhone, code: reqCode },
        { token, alreadyVerified: true },
        { new: true },
        (err) => {
          if (err) res.send(err);
          res.status(200).send({
            message: "Successfully verified.",
            verified: true,
            user,
            token,
          });
        }
      );
    });
  });
};
