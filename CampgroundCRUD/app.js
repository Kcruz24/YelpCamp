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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/makeCampground", async (req, res) => {
    const camp = new Campground({
        title: "My Backyard",
        description: "Cheap Camping!"
    });
    await camp.save();

    res.send(camp);
});

app.listen(port, () => {
    console.log("Serving on port", port);
});
