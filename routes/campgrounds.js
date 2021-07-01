const express = require("express");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");



const {
    renderAllCampgrounds,
    renderNewForm,
    createNewCampground,
    showCampground,
    renderEditForm,
    updateCampground,
    deleteCampground,
    uploadImages
} = require("../controllers/campgrounds");

// Render NEW form
router.get("/new", isLoggedIn, renderNewForm);

// Render EDIT form
router.get("/:id/edit", isLoggedIn, isAuthor, renderEditForm);

// Render all campgrounds (INDEX) and Create NEW campground
router
    .route("/")
    .get(renderAllCampgrounds)
    .post(isLoggedIn, uploadImages, validateCampground, createNewCampground);

// Show, Update, and Delete campground
router
    .route("/:id")
    .get(showCampground)
    .put(
        isLoggedIn,
        isAuthor,
        uploadImages,
        validateCampground,
        updateCampground
    )
    .delete(isLoggedIn, isAuthor, deleteCampground);

module.exports = router;
