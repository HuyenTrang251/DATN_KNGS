const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");
const {authentic} = require("../middleware/authentic");

router.post("/register/student", controller.registerStudent);
router.post("/register/tutor", controller.registerTutor);

router.post("/login", controller.login);

router.get("/me", authentic(), controller.getMe);

module.exports = router;