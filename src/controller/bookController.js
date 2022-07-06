const bookModel = require("../models/bookModel");

const createBook = async function (req, res) {
  try {
    let data = req.body;
    let saveData = await bookModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createBook = createBook;
