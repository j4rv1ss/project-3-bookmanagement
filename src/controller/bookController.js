const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");

function isValid(value) {
  if (typeof value === "undefined" || typeof value === "null") return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
}
function isValidBody(body) {
  return Object.keys(body).length > 0;
}
const isValidArray = (value) => {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i].trim().length === 0 || typeof value[i] !== "string") {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

const createBook = async function (req, res) {
  try {
    let data = req.body;
    /*----------------------------VALIDATION STArTS------------------------*/
    if (!isValidBody(data))
      return res
        .status(400)
        .send({ status: false, message: "Please provide Details" });
    let {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      reviews,
      releasedAt,
    } = data;
    // Title
    if (!isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "Please provide Title" });
    let checkTitle = await bookModel.findOne({ title });
    if (checkTitle)
      return res
        .status(400)
        .send({ status: false, message: `${title} is already Taken` });
    //excerpt
    if (!isValid(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Please provide excerpt" });
    //UserID
    if (!isValid(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide userId" });
    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid userId" });
    //ISBN
    if (!isValid(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "Please provide ISBN" });
    
    if (ISBN.trim().length != 13)
      return res.status(400).send({
        status: false,
        message: ` ${ISBN.trim().length} ISBN number should be 13`,
      });
    if (!ISBN.match(/^[0-9 ]+$/))
      return res.status(400).send({
        status: false,
        message: `ISBN Should not contain Alphabets`,
      });
    let checkISBN = await bookModel.findOne({ ISBN });
    if (checkISBN)
      return res
        .status(400)
        .send({ status: false, message: `${ISBN} is already Taken!` });
    // category
    if (!isValid(category))
      return res
        .status(400)
        .send({ status: false, message: "Please provide category" });
    //subcategory
    if (!isValid(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "Please provide subcategory" });

    

    if (!isValidArray(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "Please prov54654" });
    //reviews
    // if (typeof reviews !== "number")return res

    // return res
    //   .status(400)
    //   .send({ status: false, message: "Please provide reviews in numbers" });

    let saveData = await bookModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createBook = createBook;

const getBooksDetails = async function (req, res) {
  try {
    let data = req.query;
    let search = await bookModel
      .find({ $and: [{ isDeleted: false }, data] })
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
      });
    return res
      .status(200)
      .send({ status: true, message: "Books list", data: search });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.getBooksDetails = getBooksDetails;

const getBookById = async function (req, res) {
  try {
    const bookid = req.params.bookId;

    if (String(bookid).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Book Id" });
    const searchBook = await bookModel.findOne({
      _id: bookid,
      isDeleted: false,
    });
    // console.log(searchBook);
    if (!searchBook)
      return res.status(404).send({ status: false, message: "Not Found" });

    const reviewData = await reviewModel.find({ bookId: bookid });
    const finalRespose = {
      searchBook,
      reviewsData: reviewData,
    };

    return res
      .status(200)
      .send({ status: true, message: "Books list", data: finalRespose });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.getBookById = getBookById;

const updateBookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let temp = req.body;
    // console.log(bookId)
    if (!mongoose.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, msg: "Invalid Book objectId." });

    let searchBook = await bookModel.findOne({ _id: bookId, isDeleted: false });

    // console.log(searchBook)
    if (!searchBook)
      return res
        .status(404)
        .send({ status: false, message: "Not Found or deleted" });

    /*---------------------FOR UNIQUE ITEMS-------------------------*/
    if (!isValidBody(temp))
      return res
        .status(400)
        .send({ status: false, message: "Provide something to Update!" });

    let uniqueTitle = await bookModel.findOne({ title: temp.title });
    if (uniqueTitle)
      return res.status(400).send({
        status: false,
        message: `${temp.title} is already present You can't Update it`,
      });
    let uniqueISBN = await bookModel.findOne({ ISBN: temp.ISBN });
    if (uniqueISBN)
      return res.status(400).send({
        status: false,
        message: `${temp.ISBN} is already present You can't Update it`,
      });
    /////////////////////////////////////////////////////////////////////////////
    let finalUpdate = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      {
        $set: {
          excerpt: temp.excerpt,
          releasedAt: temp.releasedAt,
          title: temp.title,
          ISBN: temp.ISBN,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "Success", data: finalUpdate });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
module.exports.updateBookById = updateBookById;

const deleteBookbyId = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    if (!bookId)
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Book Id" });
    const searchBook = await bookModel.findOne({ bookId, isDeleted: false });
    if (!searchBook)
      return res
        .status(404)
        .send({ status: false, message: "Not Found or deleted" });
    const final = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Success", data: final });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.deleteBookbyId = deleteBookbyId;
