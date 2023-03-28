import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const PORT = process.env.PORT || 3000;

// connection of mongodb
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then((data) => console.log(`connection is sucessfully.....`))
  .catch((e) => console.log(e));

// define schema for from
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
});

// macking collections
const Messge = mongoose.model("Message", messageSchema);

// this schema is for login or logout
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

// usage of middlewar
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true })); //ushing of this middlewar we can get the data form any from
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthentaction = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = Jwt.verify(token, "jfiugewaca");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("/login");
  }
};
app.get("/", isAuthentaction, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });

  if (!user) return res.redirect("/register");

  // this is for check the password that user entered is === encrypted password or not
  const isMacth = await bcrypt.compare(password, user.password);

  if (!isMacth)
    return res.render("login", { email, message: "Incorrect password" });

  const token = Jwt.sign({ _id: user._id }, "jfiugewaca");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
  // this is for encoding the password
  const hassPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hassPassword,
  });

  const token = Jwt.sign({ _id: user._id }, "jfiugewaca");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// app.get("/add", async (req, res) => {
//   await Messge.create({
//     name: "rahul",
//     email: "dasr16583@gmail.com",
//   });
//   res.send("nice");
// });

app.get("/success", (req, res) => {
  res.render("success");
});

app.post("/contact", async (req, res) => {
  const { name, email } = req.body;
  await Messge.create({ name, email });
  res.redirect("/success");
});

app.get("/users", (req, res) => {
  res.json({
    users,
  });
});

app.listen(PORT, () => {
  console.log(`Server is working on port ${PORT}`);
});
