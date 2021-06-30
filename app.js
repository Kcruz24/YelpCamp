// While in development mode require dotenv
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

console.log(process.env.secret);

const express = require("express");
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

const reviewRoutes = require("./routes/reviews");
const campgroundRoutes = require("./routes/campgrounds");
const userRoutes = require("./routes/users");

///////////////// DATABASE CONNECTION //////////////////////
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console.error, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

/////////////////////// CONFIGS //////////////////////
const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//////////////////// MIDDLEWARES //////////////////////
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Flash //
app.use(flash());

// Session //
const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        //                    ms     s    m    h   d
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};

app.use(session(sessionConfig));

// Passport //
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

// Serialization refers to how do we store a user in a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// locals
app.use((req, res, next) => {
    // req.user comes from passport, therefore the passport middleware should be above this.
    // req.user is going to be automatically filled in with the deserialized info from the session.
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

/////////////////////// ROUTERS //////////////////////
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

///////////////////// HOME /////////////////////////
app.get("/", (req, res) => {
    res.render("campgrounds/home");
});

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
