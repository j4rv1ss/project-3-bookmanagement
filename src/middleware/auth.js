const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

let authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["x-Api-Key"];
    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "Please provide token" });

    let decodeToken = jwt.decode(token);
    if (decodeToken) {
      try {
        jwt.verify(token, "Book-Management-Project-3");
        next();
      } catch (err) {
        return res.status(400).send({ status: false, msg: err.message });
      }
    } else
      return res.status(400).send({ status: false, msg: "token is invalid" });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports.authentication = authentication;

let authorization = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["x-Api-Key"];
    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "Please provide token" });

    let decodeToken = jwt.verify(token, "Book-Management-Project-3");
    if (!decodeToken) {
      return res.status(404).send({ status: false, msg: "Not Found" });
    }
    if (decodeToken.userId !== req.body.userId)
      return res.status(403).send({
        status: false,
        msg: "You are not allowed to Modify",
      });
    next();
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports.authorization = authorization;
