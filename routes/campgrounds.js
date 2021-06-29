const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Campground = require("../models/campground.js");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const {
    renderAllCampgrounds,
    renderNewForm,
    createNewCampground,
    showCampground,
    renderEditForm,
    updateCampground,
    deleteCampground
} = require("../controllers/campgrounds");

///////////////////// INDEX /////////////////////////
router.get("/", renderAllCampgrounds);

///////////////////// NEW /////////////////////////
router.get("/new", isLoggedIn, renderNewForm);

router.post("/", isLoggedIn, validateCampground, createNewCampground);

///////////////////// SHOW /////////////////////////
router.get("/:id", showCampground);

///////////////////// EDIT /////////////////////////
router.get("/:id/edit", isLoggedIn, isAuthor, renderEditForm);

router.put("/:id", isLoggedIn, isAuthor, validateCampground, updateCampground);

///////////////////// DELETE /////////////////////////
router.delete("/:id", isLoggedIn, isAuthor, deleteCampground);

module.exports = router;
