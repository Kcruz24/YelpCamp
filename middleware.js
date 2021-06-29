const { campgroundJoiSchema, reviewJoiSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated() comes from passport and is automatically added to the req object.

    const authenticated = req.isAuthenticated();
    if (authenticated) {
        next();
    } else {
        // Return to the page that was requested after signing in
        req.session.returnTo = req.originalUrl;

        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body);
    const success = !error;

    if (success) {
        next();
    } else if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const isEqualCampAuthorAndUserId = campground.author.equals(req.user._id);

    if (isEqualCampAuthorAndUserId) {
        next();
    } else {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    const isEqualReviewAuthorAndUserId = review.author.equals(req.user._id);

    if (isEqualReviewAuthorAndUserId) {
        next();
    } else {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
