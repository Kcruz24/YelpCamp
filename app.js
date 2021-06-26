const express = require("express");
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Campground = require("./models/campground.js");
const ejsMate = require("ejs-mate");
const catchAsyncErrors = require("./utils/catchAsyncErrors");
const ExpressError = require("./utils/ExpressError");
const { campgroundJoiSchema } = require("./schemas");
const Review = require("./models/review");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console.error, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);

// Parse req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

app.get("/", (req, res) => {
    res.render("campgrounds/home");
});

///////////////////// INDEX /////////////////////////
app.get(
    "/campgrounds",
    catchAsyncErrors(async (req, res) => {
        const campgrounds = await Campground.find({});

        res.render("campgrounds/index", { campgrounds });
    })
);

///////////////////// NEW /////////////////////////
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.post(
    "/campgrounds",
    validateCampground,
    catchAsyncErrors(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

///////////////////// SHOW /////////////////////////
app.get(
    "/campgrounds/:id",
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/show", { campground });
    })
);

///////////////////// EDIT /////////////////////////
app.get(
    "/campgrounds/:id/edit",
    catchAsyncErrors(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });
    })
);

app.put(
    "/campgrounds/:id",
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
app.delete(
    "/campgrounds/:id",
    catchAsyncErrors(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);

        res.redirect("/campgrounds");
    })
);

app.post(
    "/campgrounds/:id/reviews",
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

////////////////// ERROR HANDLING ////////////////////
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;

    if (!err.message) err.message = "Oh No, Something went wrong!";

    res.status(statusCode).render("error", { err });
});

///////////////////// SERVER /////////////////////////
app.listen(port, () => {
    console.log("Serving on port", port);
});
