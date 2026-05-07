const express = require("express");

const Controller = require("../controllers/payments.controller");
const PayOSController = require("../controllers/payos.controller");
const { authentic } = require("../middleware/authentic");

const router = express.Router();

router.post("/create-link", PayOSController.createLink);
router.post("/create-payos-link", PayOSController.createLink);
router.get("/payos-return", PayOSController.confirmReturn);
router.get("/momo-return", PayOSController.confirmMomoReturn);
router.post("/webhook", PayOSController.handleWebhook);
router.post("/momo-ipn", PayOSController.handleMomoIpn);

router.put("/:id", authentic([1]), Controller.update);

router.get("/", Controller.getAll);
router.get("/:id", Controller.getById);
router.post("/", Controller.create);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.delete);

module.exports = router;
