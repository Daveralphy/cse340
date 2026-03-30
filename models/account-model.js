const pool = require("../database")

/* ****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ****************************
 * Register new account
 * ***************************** */
async function registerAccount(account) {
  try {
    const { account_firstname, account_lastname, account_email, account_username, account_password } = account
    const result = await pool.query(
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_username, account_password, account_type) VALUES ($1, $2, $3, $4, $5, 'client') RETURNING *",
      [account_firstname, account_lastname, account_email, account_username, account_password]
    )
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

module.exports = {
  getAccountByEmail,
  registerAccount,
}
