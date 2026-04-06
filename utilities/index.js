const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Error handling wrapper
function handleErrors(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

// Convert text to URL-friendly slug
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
}

async function getNav(currentPath = '', isLoggedIn = false) {
  const data = await invModel.getClassifications()
  let list = '<nav id="main-navigation"><ul>'
  
  // Home link - active if on root path
  const homeActive = currentPath === '/' ? ' class="active"' : ''
  list += '<li><a href="/"' + homeActive + ' title="Go to the home page">Home</a></li>'

  data.forEach((row) => {
    if (row.classification_name.toLowerCase() !== "sport") {
      const slug = slugify(row.classification_name)
      const isActive = currentPath === '/' + slug ? ' class="active"' : ''
      list += '<li><a href="/' + slug + '"' + isActive + ' title="View our ' + row.classification_name + ' vehicles">' + row.classification_name + "</a></li>"
    }
  })

  // Saved vehicles button removed - now shown in page header

  list += "</ul></nav>"
  return list
}

async function getClassificationDropdown(classificationId = null) {
  const data = await invModel.getClassifications()
  let dropdown = '<select name="classification_id" id="classification_id" required>'
  dropdown += '<option value="">-- Select a Classification --</option>'
  
  data.forEach((row) => {
    const selected = classificationId == row.classification_id ? 'selected' : ''
    dropdown += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`
  })
  
  dropdown += '</select>'
  return dropdown
}

function buildClassificationGrid(data) {
  let grid = '<ul id="inv-display">'

  data.forEach((vehicle) => {
    const name = vehicle.inv_make + " " + vehicle.inv_model
    const productSlug = slugify(name) + "-" + vehicle.inv_id
    const categorySlug = slugify(vehicle.classification_name)
    const price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(vehicle.inv_price)

    grid += "<li>"
    grid += '<a class="card-link" href="/' + categorySlug + '/' + productSlug + '" title="View details for ' + name + '">'
    grid += '<img src="' + vehicle.inv_thumbnail + '" alt="' + name + ' thumbnail">'
    grid += '<div class="namePrice">'
    grid += "<hr>"
    grid += "<h2>" + name + "</h2>"
    grid += "<span>" + price + "</span>"
    grid += "</div>"
    grid += "</a>"
    grid += "</li>"
  })

  grid += "</ul>"
  return grid
}

async function buildClassificationList() {
  const data = await invModel.getClassifications()
  let list = '<select id="classificationList">'
  list += '<option value="">-- Select a Classification --</option>'
  
  data.forEach((row) => {
    list += `<option value="${row.classification_id}">${row.classification_name}</option>`
  })
  
  list += '</select>'
  return list
}

function buildVehicleDetailHTML(vehicle, isFavorited = false, isLoggedIn = false) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.inv_price)

  const mileage = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)
  const vehicleName = vehicle.inv_make + " " + vehicle.inv_model
  const classificationSlug = slugify(vehicle.classification_name)
  const mailSubject = encodeURIComponent("Purchase Inquiry - " + vehicleName)

  // Build favorite icon HTML if user is logged in
  let favoriteIcon = ""
  if (isLoggedIn) {
    const iconClass = isFavorited ? "icon-heart-filled" : "icon-heart"
    const iconTitle = isFavorited ? "Remove from Saved" : "Save Vehicle"
    favoriteIcon = `<button type="button" class="favorite-icon-btn ${iconClass}" id="favoriteBtn" data-inv-id="${vehicle.inv_id}" data-is-favorited="${isFavorited}" title="${iconTitle}"></button>`
  }

  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicleName}">
      <div class="vehicle-info">
        <div class="detail-header">
          <h2>${vehicleName}</h2>
          ${favoriteIcon}
        </div>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${mileage} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p>${vehicle.inv_description}</p>
        <div class="detail-actions">
          <a class="btn-secondary" href="/${classificationSlug}">Back to Vehicle List</a>
          <a class="btn-primary" href="mailto:sales@csemotors.example?subject=${mailSubject}">Purchase Inquiry</a>
        </div>
      </div>
    </div>
  `
}

function buildVehicleDeleteHTML(vehicle) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.inv_price)

  const mileage = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)
  const vehicleName = vehicle.inv_make + " " + vehicle.inv_model

  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicleName}">
      <div class="vehicle-info">
        <h2>${vehicleName}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${mileage} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p>${vehicle.inv_description}</p>
      </div>
    </div>
  `
}

/* ****************************
 * Check JWT Token
 * ***************************** */
const checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function (err, accountData) {
      if (err) {
        req.flash("notice", "Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
      }
      res.locals.accountData = accountData
      res.locals.loggedin = 1
      next()
    })
  } else {
    next()
  }
}

/* ****************************
 * Check Login (Protected Route)
 * ***************************** */
const checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in first.")
    res.redirect("/account/login")
  }
}

/* ****************************
 * Check Authorization (Employee/Admin only)
 * For inventory management routes
 * ***************************** */
const checkInventoryAuth = (req, res, next) => {
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in first.")
    return res.redirect("/account/login")
  }

  const accountType = res.locals.accountData?.account_type
  if (accountType !== "Employee" && accountType !== "Admin") {
    req.flash("notice", "You do not have permission to access inventory management.")
    return res.redirect("/")
  }

  next()
}

module.exports = {
  handleErrors,
  slugify,
  getNav,
  getClassificationDropdown,
  buildClassificationList,
  buildClassificationGrid,
  buildVehicleDetailHTML,
  buildVehicleDeleteHTML,
  checkJWTToken,
  checkLogin,
  checkInventoryAuth,
}
