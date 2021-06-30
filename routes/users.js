const express = require("express");
const router = express.Router();

const {
    renderRegisterForm,
    registerUser,
    renderLogin,
    authenticate,
    loginUser,
    logoutUser
} = require("../controllers/users");

// Render REGISTER form. REGISTER user
router
    .route("/register")
    .get(renderRegisterForm)
    .post(registerUser);

// Render LOGIN form. LOGIN user
router
    .route("/login")
    .get(renderLogin)
    .post(authenticate, loginUser);

// LOGOUT
router.get("/logout", logoutUser);

module.exports = router;
