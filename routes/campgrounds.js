const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground.js");
const { campgroundJoiSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");

/////////////////// VALIDATION ////////////////////////
const validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

///////////////////// INDEX /////////////////////////
router.get(
    "/",
    catchAsyncErrors(async (req, res) => {
        const campgrounds = await Campground.find({}).populate("author");
        res.render("campgrounds/index", { campgrounds });
    })
);

///////////////////// NEW /////////////////////////
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post(
    "/",
    isLoggedIn,
    validateCampground,
    catchAsyncErrors(async (req, res, next) => {
        req.flash("success", "Successfully made a new campground!");
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

///////////////////// SHOW /////////////////////////
router.get(
    "/:id",
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id)
            .populate("reviews")
            .populate("author");
        const campgroundNotFound = !campground;

        if (campgroundNotFound) {
            req.flash("error", "Cannot find that campground  :(");
            return res.redirect("/campgrounds");
        }

        res.render("campgrounds/show", { campground });
    })
);

///////////////////// EDIT /////////////////////////
router.get(
    "/:id/edit",
    isLoggedIn,
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const campgroundNotFound = !campground;

        if (campgroundNotFound) {
            req.flash(
                "error",
                "Cannot edit a campground that does not exist  :("
            );
            return res.redirect("/campgrounds");
        }

        res.render("campgrounds/edit", { campground });
    })
);

router.put(
    "/:id",
    isLoggedIn,
    validateCampground,
    catchAsyncErrors(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground
        });

        req.flash("success", "Successfully updated campground!");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

///////////////////// DELETE /////////////////////////
router.delete(
    "/:id",
    isLoggedIn,
    catchAsyncErrors(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);

        req.flash("success", "Successfully deleted campground");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
