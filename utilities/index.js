const invModel = require("../models/inventory-model")

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
    grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' + name + ' details">'
    grid += '<img src="' + vehicle.inv_thumbnail + '" alt="Image of ' + name + ' on CSE Motors">'
    grid += "</a>"
    grid += '<div class="namePrice">'
    grid += "<hr>"
    grid += '<h2><a href="/inv/detail/' + vehicle.inv_id + '" title="View ' + name + ' details">' + name + "</a></h2>"
    grid += "<span>" + price + "</span>"
    grid += "</div>"
    grid += "</li>"
  })

  grid += "</ul>"
  return grid
}

function buildVehicleDetailHTML(vehicle) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.inv_price)

  const mileage = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${mileage} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p>${vehicle.inv_description}</p>
      </div>
    </div>
  `
}

module.exports = {
  getNav,
  buildClassificationGrid,
  buildVehicleDetailHTML,
}
