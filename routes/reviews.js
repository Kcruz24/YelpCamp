const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const { createReview, deleteReview } = require("../controllers/reviews");

///////////////// CREATE REVIEW /////////////////////////
router.post("/", isLoggedIn, validateReview, createReview);

///////////////// DELETE REVIEW /////////////////////////
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, deleteReview);

module.exports = router;
