const errorHandler = (err, req, res, next) => {
  console.log("Error Handler: ", err.message);
  if (err.message) {
    console.log("loading...");
    return res.render("404.ejs", { title: "404", message: err.message });
  } else if (err.fromPath && req.method == "GET") {
    return res.redirect(err.fromPath);
  }
  next();
};

module.exports = errorHandler;
