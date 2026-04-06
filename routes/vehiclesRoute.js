const express = require("express")
const router = new express.Router()
const inventoryController = require("../controllers/inventoryController")
const utilities = require("../utilities")

// Search/Filter inventory - PUBLIC
router.get("/search", utilities.handleErrors(inventoryController.searchVehicles))

// Favorites - Save vehicle (AJAX endpoint - PROTECTED)
router.post("/favorites/add", utilities.checkLogin, utilities.handleErrors(inventoryController.saveVehicleToFavorites))

// Favorites - Remove vehicle (AJAX endpoint - PROTECTED)
router.post("/favorites/remove", utilities.checkLogin, utilities.handleErrors(inventoryController.removeVehicleFromFavorites))

// View vehicles by classification - PUBLIC
// Route: /:slug (e.g., /custom, /sedan)
router.get("/:slug([a-z-]+)", utilities.handleErrors(inventoryController.buildByClassificationSlug))

// View vehicle detail - PUBLIC
// Route: /:categorySlug/:productSlug (e.g., /custom/aerocar-2000)
router.get("/:categorySlug([a-z-]+)/:productSlug([a-z0-9-]+)", utilities.handleErrors(inventoryController.buildVehicleDetailBySlug))

module.exports = router
