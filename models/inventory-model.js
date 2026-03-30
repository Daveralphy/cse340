const pool = require("../database/")

async function getClassifications() {
  try {
    const sql = "SELECT classification_id, classification_name FROM classification ORDER BY classification_name"
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getClassifications error " + error)
    throw error
  }
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const sql = "SELECT i.*, c.classification_name FROM inventory i JOIN classification c ON i.classification_id = c.classification_id WHERE i.classification_id = $1 ORDER BY i.inv_make, i.inv_model"
    const data = await pool.query(sql, [classification_id])
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
    throw error
  }
}

async function getVehicleById(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleById error " + error)
    throw error
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("addClassification error " + error)
    throw error
  }
}

async function addVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    const data = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
    return data.rows[0]
  } catch (error) {
    console.error("addVehicle error " + error)
    throw error
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addVehicle,
  deleteInventoryItem,
}
