const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

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
    /*---------------------------VALIDATION STARTS---------------------------*/
    if (!isValidBody(data))return res.status(400).send({ status: false, message: "Please provide Details" });

    let { title, name, phone, email, password, address } = data;
    //Title Validation
    if (!isValid(title))return res.status(400).send({ status: false, message: "Please provide Title" });
    if (!title.match(/^(Mr|Mrs|Miss)$/))return res.status(400).send({status: false,  message: "Please provide title between Mr, Mrs, Miss",});

    //Name Validation
    if (!isValid(name))return res.status(400).send({status: false,message: "Please provide name "});
    if (!name.match(/^[a-zA-Z ]+$/))return res.status(400).send({status: false,message: "Please provide only alphabets in name"});

    //Phone Validation
    if (!isValid(phone))return res.status(400).send({status: false,message: "Please provide Phone "});
    if (!phone.match(/^[789][0-9]{9}$/))return res.status(400).send({status: false,
    message: `${phone} is not valid (must start with 7,8,9) &&  must be 10 digits`});

    let checkPhone = await userModel.findOne({ phone });
    if (checkPhone)return res.status(400).send({status: false,message: `${phone} is already registered`,});

    //Email Validation
    if (!isValid(email))return res.status(400).send({status: false,message: "Please provide email "});
    if (!email.match(/^[a-zA-Z_\.\-0-9]+[@][a-z]{3,6}[.][a-z]{2,4}$/))return res.status(400).send({status: false,message: `${email} is not a valid E-mail`});
    let checkEmail = await userModel.findOne({ email });
    if (checkEmail)return res.status(400).send({status: false,message: `${email} is already registered`});

    //Password
    if (!isValid(password))return res.status(400).send({status: false,message: "Please provide password "});
    if (!password.match(/^[a-zA-Z0-9_@]{8,15}$/))return res.status(400).send({status: false,message: "Please enter a password of minlength 8, maxxlength 15 and symbols @ and _ only"});

    //Address validation
    if (address) {
      // if(!isValidBody(address))return res.status(400).send({status: false,message: "Please provi"});
      if(String(address.length)==0)return res.status(400).send({
        status: false,message: "empty string not allowed"});
      if(typeof address!=="object"){return res.status(400).send({status: false,message: "Please provide address in Object type"});}
      if (!/^[a-zA-Z0-9 \.]+$/.test(address.street))return res.status(400).send({
          status: false,message: "Please enter a valid street address "});
      if (!/^[a-zA-Z]+$/.test(address.city))return res.status(400).send({status: false,message: "Please enter a valid city name and not containing numbers ",});
      if (address.pincode) {
      if (!/^[0-9]{6}$/.test(address.pincode))return res.status(400).send({status: false,message: "Please enter a valid pincode of 6 digit",})}
      }

    let saveData = await userModel.create(data);
    return res.status(201).send({ status: true, message: "Success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })}
};

module.exports.createUser = createUser;

const login = async function (req, res) {
  try {
    let data = req.body;
    if (!isValidBody(data))return res.status(400).send({ status: false, msg: "Please provide details" });
    let { email, password } = data;
    /*-----------------EMAIL VALIDATION && CHECK IN DB---------------------*/
    if (!isValid(email))return res.status(400).send({ status: false, message: "Please provide email" });
    if (/^[a-zA-Z_\.\-0-9]+[@][a-z]{3,6}[.][a-z]{2,4}$/.test(email) === false)return res.status(400).send({ status: false,message: `Email should be a valid email address`});
    const isEmailAvailable = await userModel.findOne({ email });
    if (!isEmailAvailable)return res.status(400).send({status: false,message: `${email} email is not registered`});

    if (!isValid(password))return res.status(400).send({ status: false, message: "Please provide password" });
    
    
    
    /*--------------------------VALIDATION ENDS--------------------------------*/

    let checkData = await userModel.findOne({ email, password });
    // console.log(checkData)
    if (!checkData)return res.status(404).send({ status: false, msg: "username or the password is not correct" });

    let token = jwt.sign({userId: checkData._id.toString(),iat: Math.floor(Date.now() / 1000),exp: Math.floor(Date.now() / 1000) + 10000 * 600 * 600,},"Book-Management-Project-3")
    
    res.setHeader("x-api-key", token);
    return res.status(201).send({ status: true, token: token });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }};

module.exports.login = login;
