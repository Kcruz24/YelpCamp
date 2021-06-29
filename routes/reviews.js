const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Review = require("../models/review");
const Campground = require("../models/campground.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

///////////////// CREATE REVIEW /////////////////////////
router.post(
    "/",
    isLoggedIn,
    validateReview,
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;

        // Push new review in the selected campground id
        campground.reviews.push(review);

        await review.save();
        await campground.save();

        req.flash("success", "Created new review!");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

///////////////// DELETE REVIEW /////////////////////////
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    catchAsyncErrors(async (req, res) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId }
        });
        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Successfully deleted review");
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
