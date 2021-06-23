const express = require("express");
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Campground = require("./models/campground.js");
const ejsMate = require("ejs-mate");
const catchAsyncErrors = require("./utils/catchAsyncErrors");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");

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
    catchAsyncErrors(async (req, res, next) => {
        console.log("hola post");

        // THIS IS NOT A MONGOOSE SCHEMA, this just validates the data BEFORE we attempt to save it with mongoose
        // ALSO, we only see this info if we get past the client-side validation.
        const campgroundJoiSchema = Joi.object({
            campground: Joi.object({
                title: Joi.string().required(),
                price: Joi.number().required().min(0),
                image: Joi.string().required(),
                location: Joi.string().required(),
                description: Joi.string().required()
            }).required()
        });

        const { error } = campgroundJoiSchema.validate(req.body);
        if (error) {
            const msg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(msg, 400);
        }

        console.log(result);
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

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

////////////////// ERROR HANDLER /////////////////////
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;

    if (!err.message) err.message = "Oh No, Something went wrong!";

    res.status(statusCode).render("error", { err });
});

///////////////////// SERVER /////////////////////////
app.listen(port, () => {
    console.log("Serving on port", port);
});
