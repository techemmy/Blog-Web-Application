const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const process = require("process");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// local imports
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoute");
const { verifyToken, checkUser } = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandlerMiddleware");
const { unless } = require("./helperFunctions");

// express app
const app = express();

// configure app port
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// connect to mongodb
const dbURI = process.env.dbURI;
mongoose
  .connect(dbURI)
  .then((result) => {
    console.log("Successful connection to db!");
    app.listen(port);
  })
  .catch((err) => console.log(err));

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// routes
app.use("*", checkUser);
app.get("/", (req, res) => {
  res.redirect("/blogs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// excludes these routes from authentication
app.use(unless(verifyToken, ["/auth/login", "/auth/register", "/blogs"]));

// user auth routes
app.use("/auth", authRoutes);

// user profile routes
app.use("/user", userRoutes);

// blog routes
// app.use(blogRoutes);
app.use("/blogs", blogRoutes);

app.use(errorHandler);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404", message: null });
});
