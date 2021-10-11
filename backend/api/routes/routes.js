const userController = require("../controllers/userController");
const loanController = require("../controllers/loanController");
const verificationController = require("../controllers/verificationController");
const authenticationController = require("../controllers/authenticationController");

const multer = require("multer");

const imageFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const ppStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./profilePhotos/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now().toString() + "_" + file.originalname.replace(/ +/g, "")
    );
  },
});

const uploadPp = multer({
  storage: ppStorage,
  limits: {
    fileSize: 1024 * 1024 * 5, //5mb
  },
  imageFilter,
});

const selfieStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./loanSelfies/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now().toString() + "_" + file.originalname.replace(/ +/g, "")
    );
  },
});

const uploadSelfie = multer({
  storage: selfieStorage,
  limits: {
    fileSize: 1024 * 1024 * 5, //5mb
  },
  imageFilter,
});

module.exports = (app, guard) => {
  app
    .route("/get-verification-code/:phoneNumber")
    .post(userController.create_verification_code);

  app.route("/logout").delete(guard, userController.delete_session);

  app
    .route("/user/:_id")
    .get(guard, userController.read_a_user)
    .put(guard, uploadPp.single("profilePhoto"), userController.update_a_user);

  app.route("/verify/:code/:phone").post(verificationController.verify_code);

  app.route("/loans").get(guard, loanController.read_loans_of_user);
  app.route("/receive-loan").post(guard, loanController.receive_a_loan);
  app
    .route("/give-loan/:_idLoan")
    .put(guard, uploadSelfie.single("selfie"), loanController.give_a_loan);
  app.route("/loan/:_id").get(guard, loanController.read_a_loan);
};
