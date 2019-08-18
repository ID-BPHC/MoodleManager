var express = require('express');
var router = express.Router();
var uploadData = require("./uploadData");
var cmsScript = require("../scripts/processData");
var config = require("../config");


function checkAuthentication(req, res, next) {
  if (!req.session.username) {
    res.render("login", { title: "Please login first" })
  } else {
    return next();
  }
}

router.post("/login", (req, res, next) => {
  if (req.body.username == config.appUser && req.body.password == config.appPassword) {
    req.session.username = config.appUser;
    console.log("Matched");
    res.redirect("/");
  }else{
    console.log("Not matched");
    console.log(req.body, config.appPassword, config.appUser);
    res.redirect("/");
  }
})

router.use("/upload-data", checkAuthentication, uploadData);

router.get('/', checkAuthentication, function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/process", checkAuthentication, async (req, res, next) => {
  var log = await cmsScript.executeScript();
  res.render("process-complete", { title: "Processing Complete", log: log });
})

module.exports = router;
