const mongoose = require("mongoose");
const User = mongoose.model("Users");
// const Tutorial = mongoose.model("Tutorials");
const fs = require("fs");
const Verification = mongoose.model("Verifications");
const http = require("http");

// Access database from here, CRUD (Create, Read, Update, Delete) operations

function sendVerificationSMS(phoneNumber, verificationCode) {
  const now = new Date().toISOString();

  const body = `<?xml version='1.0'?><BILGI><KULLANICI_ADI>${
    process.env.SMS_USERNAME
  }</KULLANICI_ADI><SIFRE>${process.env.SMS_PASSWORD}</SIFRE><GONDERIM_TARIH>${
    now.substring(0, 10) + " " + now.substring(11, 16)
  }</GONDERIM_TARIH><BASLIK>BEHLULBOZAL</BASLIK></BILGI><ISLEM><YOLLA><MESAJ>${verificationCode}</MESAJ><NO>${phoneNumber}</NO></YOLLA></ISLEM>`;

  const postRequest = {
    host: "www.cenkarbilisim.net",
    path: "/services/api.php?islem=sms",
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const req = http.request(postRequest);

  req.on("error", function (e) {
    console.log("Problem with request: " + e.message);
  });

  req.write(body);
  req.end();
}

exports.create_verification_code = (req, res) => {
  // /get-verification-code/:phoneNumber
  const phoneNumber = req.params.phoneNumber;
  if (!phoneNumber) {
    res.status(400).send({ message: "Expected route parameter: phoneNumber." });
    return;
  }
  const nKeysOfReqBody = Object.keys(req.params).length;
  if (nKeysOfReqBody > 1) {
    res
      .status(400)
      .send({ message: "The only expected route parameter: phoneNumber." });
    return;
  }
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const verificationDTO = new Verification({
    phone: phoneNumber,
    code: verificationCode,
  });
  verificationDTO.save((err) => {
    if (err) {
      res.send(err);
    }
    // sendVerificationSMS(phoneNumber, verificationCode);
    User.findOne({ phoneNumber }, (err, user) => {
      if (err) {
        res.send(err);
      }
      if (!user) {
        const userDTO = new User({
          phoneNumber,
          firstName: "",
          lastName: "",
          givenLoans: [],
          receivedLoans: [],
          profilePicturePath: "",
        });
        userDTO.save();
      }
    });
    res.status(200).send({
      message: `Verification code for phone number ${phoneNumber} created in the database.`,
    });
  });
};

exports.delete_session = (req, res) => {
  const token = req.headers.token;
  const phoneNumberOfRequestingUser = req.user.phoneNumber;
  if (!token) {
    res.status(400).send({ message: "Expected route parameter: token." });
    return;
  }
  Verification.deleteOne({ token, phone: phoneNumberOfRequestingUser }).then(
    (del) => {
      if (del.deletedCount !== 1) {
        res
          .status(404)
          .send({ message: "Couldn't find the session of the given token." });
        return;
      }
      res.status(200).send({ message: "Successfully deleted session." });
    }
  );
};

exports.update_a_user = (req, res) => {
  const _id = req.params._id;
  if (!_id) {
    res.status(400).send({ message: "Expected _id as route parameter." });
    return;
  }
  const _idOfRequestingUser = req.user._id.toString();
  if (_idOfRequestingUser !== _id) {
    res.status(401).send({
      message: "Unauthorized: Forbidden to update profiles of other users.",
    });
    return;
  }
  const userObject = {
    firstName: req.body.firstName || "",
    lastName: req.body.lastName || "",
    profilePicturePath: req.body.profilePicturePath || "",
  };
  User.findOneAndUpdate(
    { _id: _idOfRequestingUser },
    userObject,
    { new: true },
    (err, updatedUser) => {
      if (err) res.send(err);
      res
        .status(200)
        .send({ message: "User successfully updated.", updatedUser });
    }
  );
};

exports.read_a_user = (req, res) => {
  const _id = req.params._id;
  if (!_id) {
    res.status(400).send({ message: "Expected _id as route parameter." });
    return;
  }
  User.findById(_id, (err, user) => {
    if (err) {
      res.send(err);
      return;
    }
    if (!user) {
      res
        .status(200)
        .send({ found: false, message: `User with the _id ${_id} not found.` });
      return;
    }
    res
      .status(200)
      .send({ found: true, message: `User ${_id} successfully read.`, user });
  });
};

exports.read_a_user = (req, res) => {
  const _id = req.params._id;
  User.findById(_id, (err, user) => {
    if (err) {
      res.send(err);
      return;
    }
    res.status(200).send({ message: "User succesfully read.", user });
  });
};

// function findByToken(token) {
//   Verification.findOne({ token }, (err, ver) => {
//     if (err) {
//       res.send(err);
//       return;
//     }
//     return User.findOne({ phoneNumber: ver.phone });
//   });
// }

// exports.list_all_users = (req, res) => {
//   var query = User.find();

//   if (req.params.fields) {
//     const wantedFields = req.params.fields.replace(/-/g, " ");
//     query.select(wantedFields + " -_id");
//   }

//   query.exec((err, users) => {
//     if (err) {
//       res.send(err);
//       return;
//     } else if (!users) {
//       res.status(404).send();
//       return;
//     } else {
//       res.json(users);
//     }
//   });
// };

// exports.create_a_user = async (req, res) => {
//   if (req.params.params) {
//     res.status(400).send({ message: "No params expected." });
//   }

//   const userFound = await findByToken(req.headers.token);
//   console.log("userFound = " + userFound);
//   if (userFound) {
//     res.status(400).send({ message: "User already exists." });
//     return;
//   }
//   userToCreate
//     .save()
//     .then((user) => {
//       const userDTO = {
//         userID: user._id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         email: user.email,
//       };
//       var jwt_token = jwt.sign(userDTO, process.env.TOKEN_SECRET, {
//         expiresIn: "1800s",
//       });
//       res.status(200).send({
//         message: "User successufily registered!",
//         jwt_token,
//         userID: user._id,
//         first_name: user.first_name,
//         img_path: user.img_path,
//       });
//     })
//     .catch((error) => {
//       res.status(400).send({
//         message: "An error occured!",
//         error: error.message,
//       });
//       if (req.file) fs.unlink(req.file.path, () => {});
//     });
// };

// exports.delete_a_user = (req, res) => {
//   //var userInToken = req.user.userID;
//   User.findById(req.params.id, (err, user) => {
//     if (err) {
//       res.send(err);
//       return;
//     }
//     if (!user) {
//       res.status(404).send();
//       return;
//     }
//     if (user._id != userInToken) {
//       res.status(401).send({ message: "Unauthorized access" });
//       return;
//     }
//     User.deleteOne({ _id: user._id }, (err) => {
//       if (err) res.send(err);
//       else {
//         let refErr = removeRefTut(user._id);
//         if (refErr) {
//           res.send(errrefErr);
//           return;
//         }
//         res.json({
//           message: "user successfully deleted.",
//           _id: req.params.id,
//         });
//       }
//     });
//   });
// };

// exports.search_users = (req, res) => {
//   const query = req.params.query;

//   if (!query) {
//     next();
//   } else {
//     User.find({ $text: { $search: query } }).exec((err, users) => {
//       if (err) {
//         res.send(err);
//         return;
//       } else if (!users) {
//         res.status(404).send();
//         return;
//       } else {
//         console.log(users);
//         res.json(users);
//       }
//     });
//   }
// };
