const user = require("../../models/user");
const User = require("../../models/user");

exports.create = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({
      message: "email can not be empty",
    });
  }
  try {
    const userData = new User({
      name: req.body.name,
      username: "miteshkaliya",
      password: "Password@123",
      email: req.body.email,
      isAdmin: false,
    });

    const user = await userData.save();
    if (user) {
      return res.send(user);
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while creating the user.",
    });
  }
};
exports.findAll = (req, res) => {
  User.find()
    .then((user) => {
      res.send({ user: user });
    })
    .catch((err) => {
      res.status(500).send({
        message: "error",
      });
    });
};
exports.findOne = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "user not found with given id" + req.params.id,
        });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Error retrieving note with id " + req.params.id,
      });
    });
};
exports.update = (req, res) => {
  console.log(req.body);

  if (!req.body.name) {
    return res.status(400).send({
      message: "user name can not be empty",
    });
  }
  User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send("not found with given id");
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "error while updating",
      });
    });
};
exports.delete = (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.ud,
        });
      }
      res.send({ message: "user deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "User not found with id " + req.params.id,
        });
      }
      return res.status(500).send({
        message: "Could not delete user with id " + req.params.id,
      });
    });
};
