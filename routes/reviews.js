const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const Campground = require("../models/campground.js");
const { reviewJoiSchema } = require("../schemas");

/////////////////// VALIDATION ////////////////////////
const validateReview = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

///////////////// CREATE REVIEW /////////////////////////
router.post(
    "/",
    validateReview,
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);

        // Push new review in the selected campground id
        campground.reviews.push(review);

        await review.save();
        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

///////////////// DELETE REVIEW /////////////////////////
router.delete(
    "/:reviewId",
    catchAsyncErrors(async (req, res) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId }
        });
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
