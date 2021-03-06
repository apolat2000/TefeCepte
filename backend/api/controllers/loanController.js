const mongoose = require("mongoose");
const Loan = mongoose.model("Loans");
const User = mongoose.model("Users");

exports.read_loans_of_user = (req, res) => {
  const _idUser = req.user._id;
  let givenLoans = [];
  let receivedLoans = [];
  Loan.find({ giver: _idUser }, (err, loansGiver) => {
    if (err) {
      res.send(err);
      return;
    }
    givenLoans = loansGiver;

    Loan.find({ receiver: _idUser }, (err, loansReceiver) => {
      if (err) {
        res.send(err);
        return;
      }
      receivedLoans = loansReceiver;
    });
    res.status(200).send({ givenLoans, receivedLoans });
  });
};

exports.read_a_loan = (req, res) => {
  const _idOfRequestingUser = req.user._id;
  const _idLoan = req.params._id;
  if (!_idLoan) {
    res.status(400).send({ message: "Expected route parameter: _id." });
    return;
  }
  Loan.findById(_idLoan, (err, loan) => {
    if (err) {
      res.send(err);
      return;
    }
    if (!loan)
      res.send(200).message({
        found: false,
        message: `Loan with _id ${_idLoan} not found.`,
      });
    if (
      loan.giver.toString() == _idOfRequestingUser ||
      loan.receiver.toString() == _idOfRequestingUser
    ) {
      res.status(200).send({ found: true, loan });
    }
    res.status(401).send({
      message: "Unauthorized. It is forbidden to access loans of other users.",
    });
  });
};

exports.receive_a_loan = (req, res) => {
  const _idOfRequestingUser = req.user._id;
  const loan = new Loan({
    amount: req.body.amount,
    receiver: _idOfRequestingUser,
  });
  loan.save((err, loan) => {
    if (err) res.send(err);
    res.status(200).send({ successful: true, _idLoan: loan._id });
  });
};

exports.give_a_loan = (req, res) => {
  const _idOfRequestingUser = req.user._id;
  const _idLoan = req.params._idLoan;
  if (!req.file) {
    res.status(400).send({ message: "Must upload a selfie!" });
    return;
  }
  const loanAmend = {
    giver: _idOfRequestingUser,
    dueDate: req.body.dueDate,
    selfiePath: req.file.path,
    creationIsComplete: true,
  };
  Loan.findByIdAndUpdate(_idLoan, loanAmend, { new: true }, (err, loan) => {
    if (err) res.send({ err, found: false });
    if (!loan)
      res.send({ found: false, message: `No loan with _id ${_idLoan} found.` });
    res
      .status(200)
      .send({ found: true, message: "Successfully created loan." });
  });
};
