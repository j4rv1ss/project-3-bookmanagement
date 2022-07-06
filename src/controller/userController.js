const userModel = require("../models/userModel");
const jwt=require("jsonwebtoken")

function isValid(value) {
  if (typeof value === "undefined" || typeof value === "null") return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
}
function isValidBody(body) {
  return Object.keys(body).length > 0;
}

const createUser = async function (req, res) {
  try {
    let data = req.body;
    let saveData = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createUser = createUser;

const login = async function (req, res) {
  try {
    let data = req.body;
    if (!isValidBody(data))
      return res
        .status(400)
        .send({ status: false, msg: "Please provide details" });
    let { email, password } = data;
    /*------------EMAIL VALIDATION && CHECK IN DB------------------*/
    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "Please provide email" });
    if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) === false)
      return res.status(400).send({
        status: false,
        message: `Email should be a valid email address`,
      });
    const isEmailAvailabe = await userModel.findOne({ email });
    if (!isEmailAvailabe)
      return res.status(400).send({
        status: false,
        message: `${email} email is not registered`,
      });
    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "Please provide password" });
    /*--------------------------VALIDATION ENDS--------------------------------*/

    let checkData = await userModel.findOne({ email, password });
    if (!checkData)
      return res.status(404).send({ status: false, msg: "Not Found" });

    // let today = new Date();
    // let tomorrow = new Date(today);
    // tomorrow.setDate(today.getDate() + 1000);

    let token = jwt.sign(
      {
        userId: checkData._id.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "Book-Management-Project-3"
    );
    res.setHeader("x-api-key", token);
    return res.status(201).send({ status: true, token: token });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports.login = login;
