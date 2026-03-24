const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")

// Management page - render management view
async function buildManagement(req, res, next) {
  try {
    res.render("inventory/management", {
      title: "Inventory Management",
      nav: await utilities.getNav(),
    })
  } catch (error) {
    next(error)
  }
}

// Add Classification - show form
async function buildAddClassification(req, res, next) {
  try {
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
    })
  } catch (error) {
    next(error)
  }
}

// Add Classification - process form
async function addClassification(req, res, next) {
  try {
    const { classification_name } = req.body

    // Server-side validation
    if (!classification_name || classification_name.trim() === "") {
      req.flash("error", "Classification name is required")
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav: await utilities.getNav(),
        classification_name,
      })
    }

    const regex = /^[A-Za-z0-9]+$/
    if (!regex.test(classification_name.trim())) {
      req.flash("error", "Classification name can only contain letters and numbers")
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav: await utilities.getNav(),
        classification_name,
      })
    }

    // Insert into database
    const result = await invModel.addClassification(classification_name.trim())

    // Rebuild nav after successful insert
    if (result) {
      req.flash("notice", `New classification "${result.classification_name}" added successfully`)
      res.redirect("/inv")
    }
  } catch (error) {
    next(error)
  }
}

// Add Vehicle - show form
async function buildAddVehicle(req, res, next) {
  try {
    const dropdown = await utilities.getClassificationDropdown()
    res.render("inventory/add-vehicle", {
      title: "Add Vehicle",
      nav: await utilities.getNav(),
      dropdown,
    })
  } catch (error) {
    next(error)
  }
}

// Add Vehicle - process form
async function addVehicle(req, res, next) {
  try {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    // Validation object for sticky form
    const validationData = {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    }

    // Server-side validation
    const errors = []

    if (!inv_make || inv_make.trim() === "") errors.push("Make is required")
    if (!inv_model || inv_model.trim() === "") errors.push("Model is required")
    if (!inv_year || isNaN(inv_year)) errors.push("Valid year is required")
    if (!inv_description || inv_description.trim() === "") errors.push("Description is required")
    if (!inv_image || inv_image.trim() === "") errors.push("Image path is required")
    if (!inv_thumbnail || inv_thumbnail.trim() === "") errors.push("Thumbnail path is required")
    if (!inv_price || isNaN(inv_price)) errors.push("Valid price is required")
    if (!inv_miles || isNaN(inv_miles)) errors.push("Valid mileage is required")
    if (!inv_color || inv_color.trim() === "") errors.push("Color is required")
    if (!classification_id) errors.push("Classification is required")

    if (errors.length > 0) {
      const dropdown = await utilities.getClassificationDropdown(classification_id)
      req.flash("error", errors.join(", "))
      return res.status(400).render("inventory/add-vehicle", {
        title: "Add Vehicle",
        nav: await utilities.getNav(),
        dropdown,
        ...validationData,
      })
    }

    // Insert into database
    const result = await invModel.addVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

    if (result) {
      req.flash("notice", `${result.inv_make} ${result.inv_model} added successfully`)
      res.redirect("/inv")
    }
  } catch (error) {
    next(error)
  }
}

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
      classificationId: data.classification_id,
    })
  } catch (error) {
    next(error)
  }
}

function triggerIntentionalError(req, res, next) {
  next(new Error("Intentional error"))
}

module.exports = {
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddVehicle,
  addVehicle,
  buildByClassificationId,
  buildVehicleDetail,
  triggerIntentionalError,
}
