const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Campground = require("../models/campground.js");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

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
        const campgroundFound = campground;

        if (campgroundFound) {
            return res.render("campgrounds/show", { campground });
        } else {
            req.flash("error", "Cannot find that campground  :(");
            return res.redirect("/campgrounds");
        }
    })
);

///////////////////// EDIT /////////////////////////
router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const campgroundFound = campground;

        if (campgroundFound) {
            return res.render("campgrounds/edit", { campground });
        } else {
            req.flash("error", "Cannot find that campground  :(");
            return res.redirect("/campgrounds");
        }
    })
);

router.put(
    "/:id",
    isLoggedIn,
    isAuthor,
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
    isAuthor,
    catchAsyncErrors(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);

        req.flash("success", "Successfully deleted campground");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
