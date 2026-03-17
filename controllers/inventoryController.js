const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

async function buildByClassificationId(req, res, next) {
  try {
    const classification_id = Number(req.params.classificationId)
    const data = await invModel.getInventoryByClassificationId(classification_id)

    if (!data || data.length === 0) {
      const notFoundError = new Error("No vehicles found for this classification")
      notFoundError.status = 404
      throw notFoundError
    }

    const grid = await utilities.buildClassificationGrid(data)
    const className = data[0].classification_name || "Inventory"

    res.render("inventory/classification", {
      title: className + " vehicles",
      nav: await utilities.getNav(),
      grid,
    })
  } catch (error) {
    next(error)
  }
}

async function buildVehicleDetail(req, res, next) {
  try {
    const inv_id = Number(req.params.inv_id)
    const data = await invModel.getVehicleById(inv_id)

    if (!data) {
      const notFoundError = new Error("Vehicle not found")
      notFoundError.status = 404
      throw notFoundError
    }

    const detailHTML = await utilities.buildVehicleDetailHTML(data)

    res.render("inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      nav: await utilities.getNav(),
      detail: detailHTML,
    })
  } catch (error) {
    next(error)
  }
}

function triggerIntentionalError(req, res, next) {
  next(new Error("Intentional error"))
}

module.exports = {
  buildByClassificationId,
  buildVehicleDetail,
  triggerIntentionalError,
}
