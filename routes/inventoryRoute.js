const express = require("express")
const router = new express.Router()
const inventoryController = require("../controllers/inventoryController")
const utilities = require("../utilities")

// Management page
router.get("/", utilities.handleErrors(inventoryController.buildManagement))

// Add classification routes
router.get("/add-classification", utilities.handleErrors(inventoryController.buildAddClassification))
router.post("/add-classification", utilities.handleErrors(inventoryController.addClassification))

// Add vehicle routes
router.get("/add-vehicle", utilities.handleErrors(inventoryController.buildAddVehicle))
router.post("/add-vehicle", utilities.handleErrors(inventoryController.addVehicle))

// View by classification
router.get("/type/:classificationId", utilities.handleErrors(inventoryController.buildByClassificationId))

// View vehicle detail
router.get("/detail/:inv_id", utilities.handleErrors(inventoryController.buildVehicleDetail))

// Error test route
router.get("/error", utilities.handleErrors(inventoryController.triggerIntentionalError))

module.exports = router
