const Campground = require("../models/campground.js");
const catchAsyncErrors = require("../utils/catchAsyncErrors");

// Get: Index
module.exports.renderAllCampgrounds = catchAsyncErrors(async (req, res) => {
    const campgrounds = await Campground.find({}).populate("author");
    res.render("campgrounds/index", { campgrounds });
});

// Get: New
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

// Post: New
module.exports.createNewCampground = catchAsyncErrors(
    async (req, res, next) => {
        const campground = new Campground(req.body.campground);

        // TODO estudia esta parte
        // No entiendo muy bien que esta pasando aqui
        campground.images = req.files.map((file) => ({
            url: file.path,
            filename: file.filename
        }));
        campground.author = req.user._id;

        await campground.save();
        console.log(campground);
        req.flash("success", "Successfully made a new campground!");
        res.redirect(`/campgrounds/${campground._id}`);
    }
);

// Get: Show
module.exports.showCampground = catchAsyncErrors(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("author");
    const campgroundFound = campground;

    if (campgroundFound) {
        return res.render("campgrounds/show", { campground });
    } else {
        req.flash("error", "Cannot find that campground  :(");
        return res.redirect("/campgrounds");
    }
});

// Get: Edit
module.exports.renderEditForm = catchAsyncErrors(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const campgroundFound = campground;

    if (campgroundFound) {
        return res.render("campgrounds/edit", { campground });
    } else {
        req.flash("error", "Cannot find that campground  :(");
        return res.redirect("/campgrounds");
    }
});

// Put: Edit
module.exports.updateCampground = catchAsyncErrors(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground
    });
    const imgs = req.files.map((file) => ({
        url: file.path,
        filename: file.filename
    }));
    // The spread operator "..." is to pass the data from the array and not the array itself
    campground.images.push(...imgs);

    await campground.save();
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
});

// Delete
module.exports.deleteCampground = catchAsyncErrors(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
});
