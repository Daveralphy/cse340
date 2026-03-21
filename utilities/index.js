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

module.exports = {
  getNav,
  buildClassificationGrid,
  buildVehicleDetailHTML,
}
