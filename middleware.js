module.exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated() comes from passport and is automatically added to the req object.

    const authenticated = req.isAuthenticated();
    if (authenticated) {
        next();
    } else {
        // Return to the page that was requested after signing in
        req.session.returnTo = req.originalUrl;

        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
};
