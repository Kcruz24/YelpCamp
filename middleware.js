module.exports.isLoggedIn = (req, res, next) => {
    const notAuthenticated = !req.isAuthenticated();
    if (notAuthenticated) {
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }

    next();
};
