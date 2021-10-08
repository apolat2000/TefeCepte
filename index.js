const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
global.schemas = require("./api/models/schemas");
const routes = require("./api/routes/routes");
const auth = require("./api/middlewares/authentication");
dotenv.config();

const corsOptions = {
  exposedHeaders: "Client_Scope",
};

mongoose.Promise = global.Promise;
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.svqaz.mongodb.net/TefeCepte?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const port = process.env.PORT || 3000;
console.log("Port: " + port);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log(socket);
});

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/profilepics", express.static("profilepics"));
routes(app, auth.authenticateToken);
httpServer.listen(port);

app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

console.log(`Server started on port ${port}`);
