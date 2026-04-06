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
    const sql = "SELECT i.*, c.classification_name FROM inventory i JOIN classification c ON i.classification_id = c.classification_id WHERE i.inv_id = $1"
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

/* ***************************
 *  Add Favorite
 * ************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("addFavorite error " + error)
    throw error
  }
}

/* ***************************
 *  Remove Favorite
 * ************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2"
    const data = await pool.query(sql, [account_id, inv_id])
    return data
  } catch (error) {
    console.error("removeFavorite error " + error)
    throw error
  }
}

/* ***************************
 *  Get Favorites by Account
 * ************************** */
async function getFavoritesByAccount(account_id) {
  try {
    const sql = "SELECT f.favorite_id, i.*, c.classification_name FROM favorites f JOIN inventory i ON f.inv_id = i.inv_id JOIN classification c ON i.classification_id = c.classification_id WHERE f.account_id = $1 ORDER BY i.inv_make, i.inv_model"
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getFavoritesByAccount error " + error)
    throw error
  }
}

/* ***************************
 *  Check if Vehicle is Favorited
 * ************************** */
async function isFavorited(account_id, inv_id) {
  try {
    const sql = "SELECT favorite_id FROM favorites WHERE account_id = $1 AND inv_id = $2"
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows.length > 0
  } catch (error) {
    console.error("isFavorited error " + error)
    throw error
  }
}

/* ***************************
 *  Search Inventory
 * ************************** */
async function searchInventory(filters) {
  try {
    let sql = "SELECT i.*, c.classification_name FROM inventory i JOIN classification c ON i.classification_id = c.classification_id WHERE 1=1"
    const params = []
    let paramIndex = 1

    // Keyword search (make/model)
    if (filters.keyword && filters.keyword.trim()) {
      sql += ` AND (LOWER(i.inv_make) LIKE LOWER($${paramIndex}) OR LOWER(i.inv_model) LIKE LOWER($${paramIndex}))`
      params.push(`%${filters.keyword.trim()}%`)
      paramIndex++
    }

    // Classification filter
    if (filters.classification_id && filters.classification_id > 0) {
      sql += ` AND i.classification_id = $${paramIndex}`
      params.push(filters.classification_id)
      paramIndex++
    }

    // Price range
    if (filters.price_min && !isNaN(filters.price_min) && filters.price_min > 0) {
      sql += ` AND i.inv_price >= $${paramIndex}`
      params.push(filters.price_min)
      paramIndex++
    }

    if (filters.price_max && !isNaN(filters.price_max) && filters.price_max > 0) {
      sql += ` AND i.inv_price <= $${paramIndex}`
      params.push(filters.price_max)
      paramIndex++
    }

    // Mileage range
    if (filters.mileage_min && !isNaN(filters.mileage_min) && filters.mileage_min >= 0) {
      sql += ` AND i.inv_miles >= $${paramIndex}`
      params.push(filters.mileage_min)
      paramIndex++
    }

    if (filters.mileage_max && !isNaN(filters.mileage_max) && filters.mileage_max >= 0) {
      sql += ` AND i.inv_miles <= $${paramIndex}`
      params.push(filters.mileage_max)
      paramIndex++
    }

    sql += " ORDER BY i.inv_make, i.inv_model"

    const data = await pool.query(sql, params)
    return data.rows
  } catch (error) {
    console.error("searchInventory error " + error)
    throw error
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addVehicle,
  deleteInventoryItem,
  addFavorite,
  removeFavorite,
  getFavoritesByAccount,
  isFavorited,
  searchInventory,
}
