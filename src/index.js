const express = require("express");

const route = require("./routes/route.js");
const mongoose  = require("mongoose");
const app = express();

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://Nishant-R:cMVSc6ePV6V4dr03@cluster0.rembes2.mongodb.net/group47Database",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("Connected with Nishant's MongoDB"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
