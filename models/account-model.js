const pool = require("../database")

/* ****************************
 * Return account data using email or username
 * ***************************** */
async function getAccountByEmailOrUsername(identifier) {
  try {
    // Search by email OR username
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_username, account_type, account_password FROM account WHERE account_email = $1 OR account_username = $1",
      [identifier]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Database error in getAccountByEmailOrUsername:", error)
    throw error
  }
}

/* ***************************
 * Return account data using email address (legacy - kept for compatibility)
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_username, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Database error in getAccountByEmail:", error)
    throw error
  }
}

/* ****************************
 * Return account data using account_id
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_username, account_type FROM account WHERE account_id = $1",
      [account_id]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Database error in getAccountById:", error)
    throw error
  }
}

/* ****************************
 * Register new account
 * ***************************** */
async function registerAccount(account) {
  try {
    const { account_firstname, account_lastname, account_email, account_username, account_password } = account
    const result = await pool.query(
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_username, account_password, account_type) VALUES ($1, $2, $3, $4, $5, 'Client') RETURNING *",
      [account_firstname, account_lastname, account_email, account_username, account_password]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Database error in registerAccount:", error)
    throw error
  }
}

/* ****************************
 * Update account information
 * ***************************** */
async function updateAccount(account_id, account_data) {
  try {
    const { account_firstname, account_lastname, account_email } = account_data
    const result = await pool.query(
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *",
      [account_firstname, account_lastname, account_email, account_id]
    )
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* ****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_id",
      [hashedPassword, account_id]
    )
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

module.exports = {
  getAccountByEmailOrUsername,
  getAccountByEmail,
  getAccountById,
  registerAccount,
  updateAccount,
  updatePassword,
}
