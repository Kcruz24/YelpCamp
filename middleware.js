const { campgroundJoiSchema, reviewJoiSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    // req.user comes from passport, user is going to be automatically filled in with the deserialized info from the session.
    // console.log("REQ.USER...", req.user);
    const notAuthenticated = !req.isAuthenticated();
    if (notAuthenticated) {
        // console.log(req.path, req.originalUrl);

        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }

    next();
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
