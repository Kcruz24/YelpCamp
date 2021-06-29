const express = require("express");
const router = express.Router();

const {
    renderRegister,
    registerUser,
    renderLogin,
    authenticate,
    loginUser,
    logoutUser
} = require("../controllers/users");

///////////////// REGISTER /////////////////////////
router.get("/register", renderRegister);

router.post("/register", registerUser);

///////////////// LOGIN /////////////////////////
router.get("/login", renderLogin);

router.post("/login", authenticate, loginUser);

///////////////// LOGOUT /////////////////////////
router.get("/logout", logoutUser);

module.exports = router;
