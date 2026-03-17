const express = require("express")
const router = new express.Router()
const inventoryController = require("../controllers/inventoryController")

router.get("/type/:classificationId", inventoryController.buildByClassificationId)
router.get("/detail/:inv_id", inventoryController.buildVehicleDetail)
router.get("/error", inventoryController.triggerIntentionalError)

module.exports = router
