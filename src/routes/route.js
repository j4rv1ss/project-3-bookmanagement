const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const bookController = require("../controller/bookController");
const verify = require("../middleware/auth");
const reviewController=require("../controller/reviewController")

//-----------------------USER-----------------------------//
router.post("/register", userController.createUser);
router.post("/login", userController.login);

//------------------------BOOK-------------------------------//
router.post("/books",verify.authentication,verify.authorizationByBody,bookController.createBook);
router.get("/books", verify.authentication, bookController.getBooksDetails);
router.get("/books/:bookId", verify.authentication, bookController.getBookById);
router.put("/books/:bookId",verify.authentication,verify.authorizationByParams,bookController.updateBookById);
router.delete("/books/:bookId",verify.authentication,verify.authorizationByParams,bookController.deleteBookbyId);

//-------------------------Review---------------------------//
router.post("/books/:bookId/review",verify.authentication,reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",verify.authentication,reviewController.updateReviews)
router.delete("/books/:bookId/review/:reviewId",verify.authentication,reviewController.deleteReview)

//Global API for not giving bookid in params
router.all("/**", function (req, res) {
    res.status(400).send({status: false,msg: "The api you request is not available"})});

module.exports = router;
