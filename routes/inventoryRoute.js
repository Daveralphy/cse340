const express = require("express")
const router = new express.Router()
const inventoryController = require("../controllers/inventoryController")
const utilities = require("../utilities")

// Inventory home page
router.get("/", utilities.handleErrors(inventoryController.buildManagement))

// Manage inventory page - PROTECTED
router.get("/management", utilities.checkInventoryAuth, utilities.handleErrors(inventoryController.buildManagementView))

// Get inventory by classification as JSON
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(inventoryController.getInventoryJSON)
)

// Add classification routes - PROTECTED
router.get("/add-classification", utilities.checkInventoryAuth, utilities.handleErrors(inventoryController.buildAddClassification))
router.post("/add-classification", utilities.checkInventoryAuth, utilities.handleErrors(inventoryController.addClassification))

// Add vehicle routes - PROTECTED
router.get("/add-vehicle", utilities.checkInventoryAuth, utilities.handleErrors(inventoryController.buildAddVehicle))
router.post("/add-vehicle", utilities.checkInventoryAuth, utilities.handleErrors(inventoryController.addVehicle))

// View by classification - PUBLIC
router.get("/type/:classificationId", utilities.handleErrors(inventoryController.buildByClassificationId))

// View vehicle detail - PUBLIC
router.get("/detail/:inv_id", utilities.handleErrors(inventoryController.buildVehicleDetail))

// Delete vehicle routes - PROTECTED
router.get("/delete/:inv_id", utilities.checkInventoryAuth, utilities.handleErrors(inventoryController.buildDeleteView))
router.post("/delete", utilities.checkInventoryAuth, utilities.handleErrors(inventoryController.deleteInventoryItem))

// Error test route
router.get("/error", utilities.handleErrors(inventoryController.triggerIntentionalError))

module.exports = router
