var express = require('express');
var multer = require('multer');
var router = express.Router();
var storage = multer.diskStorage({
    destination: "uploads",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '.csv')
    }
})

var upload = multer({ storage: storage })

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Upload Files' });
});

var cpUpload = upload.fields([{ name: 'faculty', maxCount: 1, filename: "oofFaculty" }, { name: 'research', maxCount: 1 }, { name: 'timetable', maxCount: 1 }])

router.post("/", cpUpload, (req, res, next) => {
    res.render("process-prompt", { title: "Upload Complete" });

})

module.exports = router;
