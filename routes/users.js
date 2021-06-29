const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const User = require("../models/user");
const passport = require("passport");

router.get("/register", (req, res) => {
    res.render("auth/register");
});

router.post(
    "/register",
    catchAsyncErrors(async (req, res, next) => {
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
    })
);

router.get("/login", (req, res) => {
    res.render("auth/login");
});

router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }),
    (req, res) => {
        req.flash("success", "Welcome Back!");
        const redirectUrl = req.session.returnTo || "/campgrounds";

        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

router.get("/logout", (req, res) => {
    // logout() comes from passport
    req.logout();
    req.flash("success", "Goodbye!");

    res.redirect("/campgrounds");
});

module.exports = router;
