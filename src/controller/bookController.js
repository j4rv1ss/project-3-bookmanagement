const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");

function isValid(value) {
  if (typeof value === "undefined" || typeof value === "null") return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
}
function isValidBody(body) {
  return Object.keys(body).length > 0;
}

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
    //Title Validation
    // if (!isValid(title))
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Please provide Title" });
    // let checkTitle = await bookModel.findOne({ title });
    // if (checkTitle)
    //   return res
    //     .status(400)
    //     .send({ status: false, message: `${checkTitle} is already Taken` });
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
      .find({$and:[{   isDeleted: false },data] })
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
