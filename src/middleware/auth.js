const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const mongoose = require("mongoose");

function isValid(value) {
  if (typeof value === "undefined" || typeof value === "null") return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
}
let authentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["x-Api-Key"];
    if (!token)return res.status(401).send({ status: false, msg: "Please provide token" });

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

let authorizationByParams = async function (req, res, next) {
  try {
    const bookId = req.params.bookId;
    if (!bookId)return res.status(400).send({ status: false, message: "Please Provide Book Id" });
    if (!mongoose.isValidObjectId(bookId))return res.status(400).send({ status: false, message: "Please Provide Valid Book Id " });
    const checkBook = await bookModel.findOne({ _id: bookId });
    if(!checkBook)return res.status(400).send({ status: false, msg: "Book Id is not found" });
   
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["x-Api-Key"];
    if (!token)return res.status(401).send({ status: false, msg: "Please provide token" });

    let decodeToken = jwt.verify(token, "Book-Management-Project-3");
    if (!decodeToken) {return res.status(404).send({ status: false, msg: "Please give coorect ID" });}
   
    
    if (decodeToken.userId != checkBook.userId)
      return res.status(403).send({status: false,msg: "You are not allowed to Modify"});

    next();
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message })}};

const authorizationByBody = async function (req, res, next) {
  try {
    let userId = req.body.userId;
    if (!isValid(userId))return res.status(400).send({ status: false, message: "Please provide userId" });
    if (!mongoose.isValidObjectId(userId))return res.status(400).send({ status: false, message: "Please provide valid userId" });
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["x-Api-Key"];
    if (!token)return res.status(401).send({ status: false, msg: "Please provide token" });

    let decodeToken = jwt.verify(token, "Book-Management-Project-3");
    if (!decodeToken) {return res.status(404).send({ status: false, msg: "Not Found" });}
    if (decodeToken.userId != userId)
      return res.status(403).send({status: false,message: "Please authorize to create Book",});
      
    next();
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};
module.exports = { authorizationByBody, authorizationByParams, authentication };
