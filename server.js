require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const utils = require("./utils");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const user = require("./controllers/User/user.controller");

mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

const userData = {
  userId: "1",
  password: "Password@123",
  name: "Mitesh kaliya",
  username: "mitesh",
  isAdmin: true,
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/create-user", user.create);
app.get("/get-users", user.findAll);
app.get("/user/:id", user.findOne);
app.put("/user/:id", user.update);
app.delete("/user/:id", user.delete);

app.use((req, res, next) => {
  var token = req.headers["authorization"];
  if (!token) return next(); //if no token, continue

  token = token.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user.",
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});

app.get("/", (req, res) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: "Invalid user to access it." });
  res.send("Welcome to the Node.js - " + req.user.name);
});

app.post("/users/signin", (req, res) => {
  const user = req.body.username;
  const pwd = req.body.password;

  if (!user || !pwd) {
    return res.status(400).json({
      error: true,
      message: "Username or Password required.",
    });
  }

  if (user !== userData.username || pwd !== userData.password) {
    return res.status(401).json({
      error: true,
      message: "Username or Password is Wrong.",
    });
  }

  const token = utils.generateToken(userData);
  const userObj = utils.getCleanUser(userData);
  return res.json({ user: userObj, token });
});

app.get("/verifyToken", (req, res) => {
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required.",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(401).json({
        error: true,
        message: "Invalid token.",
      });

    // return 401 status if the userId does not match.
    if (user.userId !== userData.userId) {
      return res.status(401).json({
        error: true,
        message: "Invalid user.",
      });
    }
    // get basic user details
    var userObj = utils.getCleanUser(userData);
    return res.json({ user: userObj, token });
  });
});

app.listen(port, () => {
  console.log("Server started on: " + port);
});
