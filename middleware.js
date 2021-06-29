module.exports.isLoggedIn = (req, res, next) => {
    // req.user comes from passport, user is going to be automatically filled in with the deserialized info from the session.
    // console.log("REQ.USER...", req.user);
    const notAuthenticated = !req.isAuthenticated();
    if (notAuthenticated) {
        // console.log(req.path, req.originalUrl);

        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }

    next();
};
