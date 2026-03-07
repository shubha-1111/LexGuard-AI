const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const {
uploadPrecedent,
getPrecedent,
searchPrecedent,
extractSections,
vectorPrecedentSearch
} = require("../controllers/precedentController");


router.post("/upload",upload.single("file"),uploadPrecedent);

router.get("/:id",getPrecedent);

router.post("/search",searchPrecedent);

router.get("/citations/:id",extractSections);
router.post("/vector-search",vectorPrecedentSearch);

module.exports = router;