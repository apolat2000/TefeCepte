const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  phoneNumber: { type: String, unique: true },
  // givenLoans: [{ type: Schema.Types.ObjectId, ref: "Loans" }], //foreign key
  // receivedLoans: [{ type: Schema.Types.ObjectId, ref: "Loans" }], //foreign key
  profilePicturePath: { type: String },
});

const loansSchema = new Schema({
  creationIsComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  amount: { type: Number },
  receiver: { type: Schema.Types.ObjectId, ref: "Users" }, //foreign key
  giver: { type: Schema.Types.ObjectId, ref: "Users" }, //foreign key
  dueDate: { type: Date },
  selfiePath: { type: String },
});

const verificationsSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: 120 // 120 seconds
  },
  phone: { type: String },
  code: {
    type: Number,
  },
  token: { type: String },
  alreadyVerified: { type: Boolean, default: false },
});

const Users = mongoose.model("Users", usersSchema);
const Loans = mongoose.model("Loans", loansSchema);
const Verifications = mongoose.model("Verifications", verificationsSchema);

module.exports = {
  Users,
  Loans,
  Verifications,
};
