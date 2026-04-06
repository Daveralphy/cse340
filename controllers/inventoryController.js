const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")

// Inventory home page - show intro and action buttons
async function buildManagement(req, res, next) {
  try {
    res.render("inventory/index", {
      title: "Inventory Management",
      hideNav: true,
    })
  } catch (error) {
    next(error)
  }
}

// Manage inventory page - show classification dropdown and inventory table
async function buildManagementView(req, res, next) {
  try {
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Manage Inventory",
      hideNav: true,
      classificationSelect: classificationSelect,
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
      hideNav: true,
    })
  } catch (error) {
    next(error)
  }
}

// Add Classification - process form with FULL VALIDATION
async function addClassification(req, res, next) {
  try {
    const { classification_name } = req.body

    // Server-side validation
    const errors = []

    // Check if empty
    if (!classification_name || classification_name.trim() === "") {
      errors.push("Classification name is required")
    } else {
      // Trim whitespace
      const trimmedName = classification_name.trim()

      // Regex validation: letters and numbers only (no spaces, no special characters)
      const regex = /^[A-Za-z0-9]+$/
      if (!regex.test(trimmedName)) {
        errors.push("Classification name can only contain letters and numbers (no spaces or special characters)")
      }

      // If validation passed, insert into database
      if (errors.length === 0) {
        // Use parameterized query via model - RETURNS result
        const result = await invModel.addClassification(trimmedName)

        if (result) {
          // Flash message - passed through session
          req.flash("notice", `New classification "${result.classification_name}" added successfully`)
          // Rebuild nav automatically when returning to /inv
          return res.redirect("/inv")
        }
      }
    }

    // If validation errors, re-render form with sticky data and error messages
    if (errors.length > 0) {
      req.flash("error", errors.join(". "))
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        hideNav: true,
        classification_name, // Sticky form value
      })
    }
  } catch (error) {
    next(error)
  }
}

// Add Vehicle - show form with dynamic dropdown
async function buildAddVehicle(req, res, next) {
  try {
    // Dynamic dropdown built from DB - NO HARDCODING
    const dropdown = await utilities.getClassificationDropdown()
    res.render("inventory/add-vehicle", {
      title: "Add Vehicle",
      hideNav: true,
      dropdown,
    })
  } catch (error) {
    next(error)
  }
}

// Add Vehicle - process form with FULL VALIDATION
async function addVehicle(req, res, next) {
  try {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    // Validation object for sticky form - holds all input values
    const validationData = {
      inv_make: inv_make || "",
      inv_model: inv_model || "",
      inv_year: inv_year || "",
      inv_description: inv_description || "",
      inv_image: inv_image || "",
      inv_thumbnail: inv_thumbnail || "",
      inv_price: inv_price || "",
      inv_miles: inv_miles || "",
      inv_color: inv_color || "",
      classification_id: classification_id || "",
    }

    // Server-side validation for ALL 10 fields
    const errors = []

    // inv_make - string, required
    if (!inv_make || inv_make.trim() === "") {
      errors.push("Make is required")
    }

    // inv_model - string, required
    if (!inv_model || inv_model.trim() === "") {
      errors.push("Model is required")
    }

    // inv_year - number, required, valid year
    if (!inv_year) {
      errors.push("Year is required")
    } else if (isNaN(inv_year) || inv_year === "") {
      errors.push("Year must be a valid number")
    } else {
      const yearNum = parseInt(inv_year, 10)
      if (yearNum < 1900 || yearNum > 2100) {
        errors.push("Year must be between 1900 and 2100")
      }
    }

    // inv_description - string, required
    if (!inv_description || inv_description.trim() === "") {
      errors.push("Description is required")
    }

    // inv_image - string, required
    if (!inv_image || inv_image.trim() === "") {
      errors.push("Image path is required")
    }

    // inv_thumbnail - string, required
    if (!inv_thumbnail || inv_thumbnail.trim() === "") {
      errors.push("Thumbnail path is required")
    }

    // inv_price - number, required, non-negative
    if (!inv_price) {
      errors.push("Price is required")
    } else if (isNaN(inv_price) || inv_price === "") {
      errors.push("Price must be a valid number")
    } else {
      const priceNum = parseFloat(inv_price)
      if (priceNum < 0) {
        errors.push("Price cannot be negative")
      }
    }

    // inv_miles - number, required, non-negative
    if (!inv_miles) {
      errors.push("Mileage is required")
    } else if (isNaN(inv_miles) || inv_miles === "") {
      errors.push("Mileage must be a valid number")
    } else {
      const milesNum = parseInt(inv_miles, 10)
      if (milesNum < 0) {
        errors.push("Mileage cannot be negative")
      }
    }

    // inv_color - string, required
    if (!inv_color || inv_color.trim() === "") {
      errors.push("Color is required")
    }

    // classification_id - required
    if (!classification_id) {
      errors.push("Classification is required")
    }

    // If validation errors, re-render form with ALL sticky values and error messages
    if (errors.length > 0) {
      const dropdown = await utilities.getClassificationDropdown(classification_id)
      req.flash("error", errors.join(". "))
      return res.status(400).render("inventory/add-vehicle", {
        title: "Add Vehicle",
        hideNav: true,
        dropdown,
        ...validationData, // Spread all sticky form values
      })
    }

    // All validation passed - insert into database using parameterized query
    const result = await invModel.addVehicle(
      inv_make.trim(),
      inv_model.trim(),
      inv_year,
      inv_description.trim(),
      inv_image.trim(),
      inv_thumbnail.trim(),
      inv_price,
      inv_miles,
      inv_color.trim(),
      classification_id
    )

    // Model returns result from RETURNING *
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
      hideNav: true,
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

    // Check if vehicle is favorited by current user
    let isFavorited = false
    if (res.locals.loggedin) {
      const account_id = res.locals.accountData.account_id
      isFavorited = await invModel.isFavorited(account_id, inv_id)
    }

    const detailHTML = await utilities.buildVehicleDetailHTML(data, isFavorited, res.locals.loggedin)

    res.render("inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      hideNav: true,
      detail: detailHTML,
      classificationId: data.classification_id,
      classificationName: data.classification_name,
      inv_id: inv_id,
      isFavorited: isFavorited,
    })
  } catch (error) {
    next(error)
  }
}

function triggerIntentionalError(req, res, next) {
  next(new Error("Intentional error"))
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id)

  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  )

  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build Delete View
 * ************************** */
async function buildDeleteView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const itemData = await invModel.getVehicleById(inv_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  const detailHTML = await utilities.buildVehicleDeleteHTML(itemData)

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    hideNav: true,
    errors: null,
    detail: detailHTML,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult.rowCount > 0) {
    req.flash("notice", "The item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

/* ***************************
 *  Save Vehicle to Favorites
 * ************************** */
async function saveVehicleToFavorites(req, res, next) {
  try {
    // Check if user is logged in
    if (!res.locals.loggedin) {
      return res.status(401).json({ success: false, message: "Please log in to save vehicles" })
    }

    const account_id = res.locals.accountData.account_id
    const inv_id = parseInt(req.body.inv_id)

    // Validate inv_id
    if (isNaN(inv_id)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle ID" })
    }

    // Check if vehicle exists
    const vehicle = await invModel.getVehicleById(inv_id)
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" })
    }

    // Add favorite
    await invModel.addFavorite(account_id, inv_id)
    
    res.json({ success: true, message: "Vehicle added to favorites" })
  } catch (error) {
    // Check if it's a unique constraint violation (duplicate favorite)
    if (error.code === "23505") {
      return res.status(400).json({ success: false, message: "This vehicle is already in your favorites" })
    }
    next(error)
  }
}

/* ***************************
 *  Remove Vehicle from Favorites
 * ************************** */
async function removeVehicleFromFavorites(req, res, next) {
  try {
    // Check if user is logged in
    if (!res.locals.loggedin) {
      return res.status(401).json({ success: false, message: "Please log in" })
    }

    const account_id = res.locals.accountData.account_id
    const inv_id = parseInt(req.body.inv_id)

    // Validate inv_id
    if (isNaN(inv_id)) {
      return res.status(400).json({ success: false, message: "Invalid vehicle ID" })
    }

    // Remove favorite
    await invModel.removeFavorite(account_id, inv_id)
    
    res.json({ success: true, message: "Vehicle removed from favorites" })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Favorites View
 * ************************** */
async function buildFavoritesView(req, res, next) {
  try {
    // Check if user is logged in
    if (!res.locals.loggedin) {
      const notFoundError = new Error("You must be logged in to view saved vehicles")
      notFoundError.status = 401
      throw notFoundError
    }

    const account_id = res.locals.accountData.account_id
    const favorites = await invModel.getFavoritesByAccount(account_id)

    const grid = favorites && favorites.length > 0 
      ? await utilities.buildClassificationGrid(favorites) 
      : '<div class="no-favorites"><p>You have not saved any vehicles yet.</p></div>'

    const nav = await utilities.getNav('/account/saved', res.locals.loggedin)

    res.render("inventory/saved-vehicles", {
      title: "My Saved Vehicles",
      hideNav: false,
      nav,
      grid,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Search/Filter Inventory
 * ************************** */
async function searchVehicles(req, res, next) {
  try {
    const { query, classification_id, price_min, price_max, mileage_min, mileage_max } = req.query

    // Build filter object
    const filters = {
      keyword: query || "",
      classification_id: classification_id ? parseInt(classification_id) : 0,
      price_min: price_min ? parseFloat(price_min) : 0,
      price_max: price_max ? parseFloat(price_max) : 0,
      mileage_min: mileage_min ? parseInt(mileage_min) : 0,
      mileage_max: mileage_max ? parseInt(mileage_max) : 0,
    }

    // Perform search
    const results = await invModel.searchInventory(filters)

    // Build grid HTML
    let grid
    if (results.length === 0) {
      grid = '<div class="no-results"><p>No vehicles found matching your criteria. Please try different filters.</p></div>'
    } else {
      grid = await utilities.buildClassificationGrid(results)
    }

    // Get classification list for dropdown
    const classificationSelect = await utilities.buildClassificationList()
    const nav = await utilities.getNav('/search', res.locals.loggedin)

    res.render("inventory/search-results", {
      title: "Search Results",
      hideNav: true,
      nav,
      grid,
      classificationSelect,
      filters,
      resultCount: results.length,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build by Classification Slug (URL friendly)
 * ************************** */
async function buildByClassificationSlug(req, res, next) {
  try {
    const slug = req.params.slug
    const data = await invModel.getClassifications()
    
    const classification = data.find(c => 
      utilities.slugify(c.classification_name) === slug
    )
    
    if (!classification) {
      const notFoundError = new Error("Classification not found")
      notFoundError.status = 404
      throw notFoundError
    }
    
    const vehicles = await invModel.getInventoryByClassificationId(classification.classification_id)
    
    if (!vehicles || vehicles.length === 0) {
      const notFoundError = new Error("No vehicles found for this classification")
      notFoundError.status = 404
      throw notFoundError
    }
    
    const grid = await utilities.buildClassificationGrid(vehicles)
    const className = classification.classification_name
    const nav = await utilities.getNav('/' + slug, res.locals.loggedin)

    res.render("inventory/classification", {
      title: className + " vehicles",
      hideNav: false,
      nav,
      grid,
      classificationName: className,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build Vehicle Detail by Slug (URL friendly)
 * ************************** */
async function buildVehicleDetailBySlug(req, res, next) {
  try {
    const categorySlug = req.params.categorySlug
    const productSlug = req.params.productSlug
    
    // Extract inv_id from end of productSlug (e.g., "aerocar-123" -> 123)
    const lastHyphenIndex = productSlug.lastIndexOf('-')
    let inv_id = null
    
    if (lastHyphenIndex !== -1) {
      const potentialId = productSlug.substring(lastHyphenIndex + 1)
      if (/^\d+$/.test(potentialId)) {
        inv_id = parseInt(potentialId)
      }
    }
    
    if (!inv_id) {
      const notFoundError = new Error("Invalid vehicle URL")
      notFoundError.status = 404
      throw notFoundError
    }
    
    const data = await invModel.getVehicleById(inv_id)
    
    if (!data) {
      const notFoundError = new Error("Vehicle not found")
      notFoundError.status = 404
      throw notFoundError
    }
    
    // Verify category slug matches
    const expectedCategorySlug = utilities.slugify(data.classification_name)
    if (expectedCategorySlug !== categorySlug) {
      const notFoundError = new Error("Invalid category")
      notFoundError.status = 404
      throw notFoundError
    }
    
    // Check if vehicle is favorited by current user
    let isFavorited = false
    if (res.locals.loggedin) {
      const account_id = res.locals.accountData.account_id
      isFavorited = await invModel.isFavorited(account_id, inv_id)
    }
    
    const detailHTML = await utilities.buildVehicleDetailHTML(data, isFavorited, res.locals.loggedin)
    const currentPath = '/' + categorySlug
    const nav = await utilities.getNav(currentPath, res.locals.loggedin)
    
    res.render("inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      hideNav: false,
      nav,
      detail: detailHTML,
      classificationName: data.classification_name,
      classificationId: data.classification_id,
      inv_id: inv_id,
      isFavorited: isFavorited,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  buildManagement,
  buildManagementView,
  buildAddClassification,
  addClassification,
  buildAddVehicle,
  addVehicle,
  buildByClassificationId,
  buildByClassificationSlug,
  buildVehicleDetail,
  buildVehicleDetailBySlug,
  buildDeleteView,
  deleteInventoryItem,
  triggerIntentionalError,
  getInventoryJSON,
  saveVehicleToFavorites,
  removeVehicleFromFavorites,
  buildFavoritesView,
  searchVehicles,
}
