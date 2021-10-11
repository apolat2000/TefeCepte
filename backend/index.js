const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
global.schemas = require("./api/models/schemas");
const routes = require("./api/routes/routes");
const auth = require("./api/middlewares/authentication");
dotenv.config();

mongoose.Promise = global.Promise;
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.svqaz.mongodb.net/TefeCepte?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const port = process.env.PORT || 3000;
console.log("Port: " + port);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/loanSelfiles", express.static("loanSelfiles"));
app.use("/profilePhotos", express.static("profilePhotos"));

routes(app, auth.authenticateToken);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(auth.authenticateToken));

io.on("connection", (socket) => {
  const _id = String(socket.request.user._id);
  console.log(`User ${_id} connected`);
  socket.join(_id);
  console.log(`User ${_id} joined the allocated room.`);
});

httpServer.listen(port);

app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

console.log(`Server started on port ${port}`);
