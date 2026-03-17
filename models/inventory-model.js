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

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
}
