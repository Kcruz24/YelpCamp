const express = require("express");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
    renderAllCampgrounds,
    renderNewForm,
    createNewCampground,
    showCampground,
    renderEditForm,
    updateCampground,
    deleteCampground
} = require("../controllers/campgrounds");

// Render NEW form
router.get("/new", isLoggedIn, renderNewForm);

// Render EDIT form
router.get("/:id/edit", isLoggedIn, isAuthor, renderEditForm);

// Render all campgrounds (INDEX) and Create NEW campground
router
    .route("/")
    .get(renderAllCampgrounds)
    // .post(isLoggedIn, validateCampground, createNewCampground);
    .post(upload.array("image"), (req, res) => {
        console.log(req.body, req.files);
        res.send("It worked!");
    });

// Show, Update, and Delete campground
router
    .route("/:id")
    .get(showCampground)
    .put(isLoggedIn, isAuthor, validateCampground, updateCampground)
    .delete(isLoggedIn, isAuthor, deleteCampground);

module.exports = router;
