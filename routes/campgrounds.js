const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground.js");
const { campgroundJoiSchema } = require("../schemas");

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
        const campgrounds = await Campground.find({});

        res.render("campgrounds/index", { campgrounds });
    })
);

///////////////////// NEW /////////////////////////
router.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

router.post(
    "/",
    validateCampground,
    catchAsyncErrors(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

///////////////////// SHOW /////////////////////////
router.get(
    "/:id",
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id).populate(
            "reviews"
        );

        res.render("campgrounds/show", { campground });
    })
);

///////////////////// EDIT /////////////////////////
router.get(
    "/:id/edit",
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });
    })
);

router.put(
    "/:id",
    validateCampground,
    catchAsyncErrors(async (req, res) => {
        const { id } = req.params;

        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground
        });

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

///////////////////// DELETE /////////////////////////
router.delete(
    "/:id",
    catchAsyncErrors(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);

        res.redirect("/campgrounds");
    })
);

module.exports = router;
