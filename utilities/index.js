const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Error handling wrapper
function handleErrors(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

async function getNav() {
  const data = await invModel.getClassifications()
  let list = '<nav id="main-navigation"><ul>'
  list += '<li><a href="/" title="Go to the home page">Home</a></li>'

  data.forEach((row) => {
    if (row.classification_name.toLowerCase() !== "sport") {
      list += '<li><a href="/inv/type/' + row.classification_id + '" title="View our ' + row.classification_name + ' vehicles">' + row.classification_name + "</a></li>"
    }
  })

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
    const price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(vehicle.inv_price)

    grid += "<li>"
    grid += '<a class="card-link" href="/inv/detail/' + vehicle.inv_id + '" title="View details for ' + name + '">'
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

function buildVehicleDetailHTML(vehicle) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.inv_price)

  const mileage = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)
  const vehicleName = vehicle.inv_make + " " + vehicle.inv_model
  const mailSubject = encodeURIComponent("Purchase Inquiry - " + vehicleName)

  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicleName}">
      <div class="vehicle-info">
        <h2>${vehicleName}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${mileage} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p>${vehicle.inv_description}</p>
        <div class="detail-actions">
          <a class="btn-secondary" href="/inv/type/${vehicle.classification_id}">Back to Vehicle List</a>
          <a class="btn-primary" href="mailto:sales@csemotors.example?subject=${mailSubject}">Purchase Inquiry</a>
        </div>
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

module.exports = {
  handleErrors,
  getNav,
  getClassificationDropdown,
  buildClassificationList,
  buildClassificationGrid,
  buildVehicleDetailHTML,
  checkJWTToken,
  checkLogin,
}
