const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");
        
function isValid(value) {
  if (typeof value === "undefined" || typeof value === "null") return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
}
function isValidBody(body) {return Object.keys(body).length > 0}

const dateRegex=/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/

const createBook = async function (req, res) {
  try {
   
    let data = req.body;
    /*----------------------------VALIDATION STArTS------------------------*/
    if (!isValidBody(data))return res.status(400).send({ status: false, message: "Please provide Details" });
    let {title,excerpt,userId,ISBN,category,subcategory,reviews,releasedAt,} = data;

    // Title
    if (!isValid(title))return res.status(400).send({ status: false, message: "Please provide Title" });
    let checkTitle = await bookModel.findOne({ title });
    if (checkTitle)return res.status(400).send({ status: false, message: `titile is already Taken` });

    
    //excerpt
    if (!isValid(excerpt))return res.status(400).send({ status: false, message: "Please provide excerpt" });

    //UserID
    const checkUserId = await userModel.findOne({ _id: userId });
    if (!checkUserId)return res.status(400).send({ status: false, message: `userId is not present` });

    //ISBN
    if (!isValid(ISBN))return res.status(400).send({ status: false, message: "Please provide ISBN" });
    if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())) {
      return res.status(400).send({ status: false, message: "Please Enter valid ISBN number" })}
    let checkISBN = await bookModel.findOne({ ISBN });
    if (checkISBN)return res.status(400).send({ status: false, message: `${ISBN} is already Taken!` });

    // category
    if (!isValid(category))return res.status(400).send({ status: false, message: "Please provide category" });

    //subcategory
    if (!isValid(subcategory))return res.status(400).send({ status: false, message: "Please provide subcategory" });
    let arr = subcategory.split(',')
    data['subcategory']= arr
 
    if(!isValid(releasedAt))return res.status(400).send({ status: false, message: "Please provide releasedAt Date " });
    if(!releasedAt.match(dateRegex))return res.status(400).send({ status: false, message: "Please provide releasedAt in correct Date (YYYY-MM-DD)" });
    
    // reviews
    if(reviews){
      if (typeof reviews !== "number")return res.status(400).send({ status: false, message: "Please provide reviews in numbers" })}
/*----------------------------VALIDATION ENDS----------------------------------*/
       

    let saveData = await bookModel.create(data);
    return res.status(201).send({ status: true, message: "Success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }};


const getBooksDetails = async function (req, res) {
  try {
    let data = req.query;
    if(data.title||data.excerpt||data.ISBN||data.reviews||data.releasedAt||data._id)return res.status(400).send({ Status: false, message: " You can't get data with given filter" })
//-----------------------------QUERY VALIDATION--------------------------------//

    if(data.userId){
      if(!mongoose.isValidObjectId(data.userId))return res.status(400).send({ Status: false, message: "UserId is in Invalid Format " })
    }
//-----------------------------------------------------------------------------//

    let search = await bookModel.find({ $and: [{ isDeleted: false }, data] }).select({_id: 1,title: 1,excerpt: 1,userId: 1,category: 1,releasedAt: 1,reviews:1}).collation().sort({title:1});
    if(search.length==0)return res.status(404).send({ Status: false, message: "Not found" })
    return res.status(200).send({ status: true, message: "Books list", data: search });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }};


const getBookById = async function (req, res) {
  try {
    const bookId = req.params.bookId
   
    if (!mongoose.isValidObjectId(bookId)) {return res.status(400).send({ status: false, message: "Invalid Book Id" })}

    const searchBook = await bookModel.findOne({_id: bookId,isDeleted: false,});
    if (!searchBook) {
      return res.status(404).send({ status: false, message: "Sorry Book Id is not Found" })}

    const review = await reviewModel.find({ bookId: bookId,isDeleted:false });
    
    const reviewBook=searchBook.toObject()
      reviewBook.reviewData=review
   
    return res.status(200).send({ status: true, message: "Books list", data: reviewBook });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }};


const updateBookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let temp = req.body;
    
    /*---------------------------VALIDATION----------------------------*/
    if (!mongoose.isValidObjectId(bookId))return res.status(400).send({ status: false, msg: "Invalid Book objectId." });

    let searchBook = await bookModel.findOne({ _id: bookId, isDeleted: false });

    if (!searchBook)return res.status(404).send({ status: false, message: "Not Found or deleted" });

    
    if (!isValidBody(temp))return res.status(400).send({ status: false, message: "Provide something to Update!" });
    
    let uniqueTitle = await bookModel.findOne({ title: temp.title });
    if (uniqueTitle)return res.status(400).send({status: false,message: `Title is already taken`,
      });
      
      let uniqueISBN = await bookModel.findOne({ ISBN: temp.ISBN });
      if (uniqueISBN)return res.status(400).send({status: false,message: `ISBN is already present `});
      
   
    //---------------------------------------------------------------------------//
    let finalUpdate = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted:false },{$set: {excerpt: temp.excerpt,releasedAt: temp.releasedAt,title: temp.title,ISBN: temp.ISBN}},{ new: true }).select({__v:0});

    return res.status(200).send({ status: true, message: "Success", data: finalUpdate });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })}};


const deleteBookbyId = async function (req, res) {
  try {
    const data = req.params.bookId;
    
    const searchBook = await bookModel.findOne({_id:data});
    if (!searchBook)return res.status(404).send({ status: false, message: "Not Found...cool" });
    if (searchBook.isDeleted == true)return res.status(404).send({ status: false, message: "Already deleted" });
    // let date=moment().format('MMMM Do YYYY, h:mm:ss a')
    const final = await bookModel.findOneAndUpdate({_id: data},{$set:{ isDeleted: true, deletedAt: new Date()}},{ new: true }).select({__v:0});

    return res.status(200).send({ status: true, message: "Success", data: final });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })}};

module.exports={createBook,getBooksDetails,getBookById,updateBookById,deleteBookbyId}
