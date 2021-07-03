// While in development mode require dotenv
const onDevelopment = process.env.NODE_ENV !== "production";
if (onDevelopment) {
    require("dotenv").config();
}

// Node modules //
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
// const MongoDBStore = require("connect-mongo");

// Error handlers //
const ExpressError = require("./utils/ExpressError");

// Models //
const User = require("./models/user");

// Routes //
const reviewRoutes = require("./routes/reviews");
const campgroundRoutes = require("./routes/campgrounds");
const userRoutes = require("./routes/users");

// Controllers //
const {
    contentSecurityPolicy
} = require("./controllers/contentSecurityPolicy");

///////////////// DATABASE CONNECTION //////////////////////
//"mongodb://localhost:27017/yelp-camp"
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose.connect(dbUrl, {
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
app.use(
    mongoSanitize({
        replaceWith: "_"
    })
);

// Helmet //{ contentSecurityPolicy: false }
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js",
    "https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css"
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://7972edea2553.ngrok.io"
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
);

// Flash //
app.use(flash());

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    // Touch after 24 hours
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

// Session //
const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //                    ms     s    m    h   d
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // secure: true,
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

// locals //
app.use((req, res, next) => {
    // req.user comes from passport, therefore the passport middleware should be above this.
    // req.user is going to be automatically filled in with the deserialized info from the session.
    console.log(req.session);
    console.log("REQ BODY: ", req.body);
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
    res.render("home");
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
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Serving on port", port);
});
