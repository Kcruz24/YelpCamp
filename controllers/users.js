const User = require("../models/user");
const passport = require("passport");
const catchAsyncErrors = require("../utils/catchAsyncErrors");

// Get: Register
module.exports.renderRegister = (req, res) => {
    res.render("auth/register");
};

// Post: Register
module.exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
});

// Get: login
module.exports.renderLogin = (req, res) => {
    res.render("auth/login");
};

// Post: Passport authenticate (for login)
module.exports.authenticate = passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login"
});

// Post: login
module.exports.loginUser = (req, res) => {
    req.flash("success", "Welcome Back!");
    const redirectUrl = req.session.returnTo || "/campgrounds";

    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Get: logout
module.exports.logoutUser = (req, res) => {
    // logout() comes from passport
    req.logout();
    req.flash("success", "Goodbye!");

    res.redirect("/campgrounds");
};
