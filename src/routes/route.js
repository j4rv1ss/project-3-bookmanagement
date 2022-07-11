const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const bookController = require("../controller/bookController");
const verify = require("../middleware/auth");
const reviewController=require("../controller/reviewController")


router.post("/register", userController.createUser);
router.post("/login", userController.login);

router.post("/books",verify.authentication,verify.authorizationByBody,bookController.createBook);

router.get("/books", verify.authentication, bookController.getBooksDetails);

router.get("/books/:bookId", verify.authentication, bookController.getBookById);

router.put("/books/:bookId",verify.authentication,verify.authorizationByParams,bookController.updateBookById);

router.delete("/books/:bookId",verify.authentication,verify.authorizationByParams,bookController.deleteBookbyId);

//---------------Create Review-------------//
router.post("/books/:bookId/review",reviewController.createReview)

//---------------Updating reviews-----------//
router.put("/books/:bookId/review/:reviewId",reviewController.updateReviews)

//---------------delete reviews---------------//
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)

//Global middleware for not giving bookid in params
router.all("/**", function (req, res) {
    res.status(400).send({status: false,msg: "The api you request is not available"})});

module.exports = router;
