const express = require("express");
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground.js");

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

// Parse req.body
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home");
});

///////////////////// INDEX /////////////////////////
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});

    res.render("campgrounds/index", { campgrounds });
});

///////////////////// NEW /////////////////////////
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
})

app.post("/campgrounds", async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
})

///////////////////// SHOW /////////////////////////
app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", {campground});
});

///////////////////// SERVER /////////////////////////
app.listen(port, () => {
    console.log("Serving on port", port);
});
