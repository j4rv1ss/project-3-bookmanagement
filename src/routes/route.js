const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const bookController = require("../controller/bookController");
const verify = require("../middleware/auth");

router.post("/register", userController.createUser);
router.post("/login", userController.login);

router.post(
  "/books",
  verify.authentication,
  verify.authorization,
  bookController.createBook
);

router.get("/books", verify.authentication, bookController.getBooksDetails);

router.get("/books/:bookId", verify.authentication, bookController.getBookById);

router.put(
  "/books/:bookId",

  bookController.updateBookById
);

router.delete(
  "/books/:bookId",

  bookController.deleteBookbyId
);

module.exports = router;
