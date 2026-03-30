const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************
 * Build Login Page
 * ***************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      hideNav: true,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Process Login Request
 * ***************************** */
async function accountLogin(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    console.log("Login attempt with:", account_email)
    
    const accountData = await accountModel.getAccountByEmailOrUsername(account_email)
    console.log("Account found:", !!accountData)

    if (!accountData) {
      console.log("No account found for:", account_email)
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        hideNav: true,
        errors: [{ msg: "Email, username, or password is incorrect." }],
        account_email,
      })
      return
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    console.log("Password match:", passwordMatch)

    if (passwordMatch) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,
      })

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }

      console.log("Login successful for:", account_email)
      return res.redirect("/account/")
    } else {
      console.log("Password incorrect for:", account_email)
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        hideNav: true,
        errors: [{ msg: "Email, username, or password is incorrect." }],
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    let nav = await utilities.getNav()
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      hideNav: true,
      errors: [{ msg: "Server error. Please try again later." }],
      account_email: req.body.account_email || "",
    })
  }
}

/* ****************************
 * Build Account Management
 * ***************************** */
async function buildManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************
 * Build Account Info Page (Read-Only)
 * ***************************** */
async function buildInfo(req, res) {
  let nav = await utilities.getNav()
  res.render("account/info", {
    title: "Account Information",
    nav,
    errors: null,
  })
}

/* ****************************
 * Build Register Page
 * ***************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Create Account",
      nav,
      hideNav: true,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Process Registration
 * ***************************** */
async function accountRegister(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_username, account_password } = req.body

    // Hash the password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
      console.error("Password hashing error:", error)
      res.status(500).render("account/register", {
        title: "Create Account",
        nav,
        hideNav: true,
        errors: [{ msg: "Sorry, there was an error processing the registration." }],
        account_firstname,
        account_lastname,
        account_email,
        account_username,
      })
      return
    }

    // Call model to insert account
    const result = await accountModel.registerAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_username,
      account_password: hashedPassword,
    })

    if (result) {
      req.flash("notice", "Registration successful! Please log in.")
      res.status(201).redirect("/account/login")
    } else {
      res.status(400).render("account/register", {
        title: "Create Account",
        nav,
        hideNav: true,
        errors: [{ msg: "Sorry, the registration failed. Please try again." }],
        account_firstname,
        account_lastname,
        account_email,
        account_username,
      })
    }
  } catch (error) {
    console.error("Registration error:", error)
    let errorMsg = "Sorry, the email or username may already be in use. Please try again."
    if (error.message && error.message.includes("connection")) {
      errorMsg = "Database connection error. Please try again later."
    }
    res.status(500).render("account/register", {
      title: "Create Account",
      nav: await utilities.getNav(),
      hideNav: true,
      errors: [{ msg: errorMsg }],
      account_firstname: req.body.account_firstname || "",
      account_lastname: req.body.account_lastname || "",
      account_email: req.body.account_email || "",
      account_username: req.body.account_username || "",
    })
  }
}

/* ****************************
 * Build Update Account Page
 * ***************************** */
async function buildUpdate(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Update Account Information
 * ***************************** */
async function updateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    const result = await accountModel.updateAccount(account_id, {
      account_firstname,
      account_lastname,
      account_email,
    })

    if (result && !result.message) {
      // Update JWT token with new data
      delete result.account_password
      const accessToken = jwt.sign(result, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,
      })

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }

      req.flash("notice", "Account information updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the update failed. Please try again.")
      res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Update Account Password
 * ***************************** */
async function updatePassword(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_password } = req.body

    // Hash the password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
      req.flash("notice", "Sorry, there was an error processing the password change.")
      res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      })
      return
    }

    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result && !result.message) {
      req.flash("notice", "Password changed successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the password change failed. Please try again.")
      res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************
 * Logout - Remove JWT Token
 * ***************************** */
async function logout(req, res, next) {
  res.clearCookie("jwt")
  return res.redirect("/")
}

module.exports = {
  buildLogin,
  accountLogin,
  buildManagement,
  buildInfo,
  buildRegister,
  accountRegister,
  buildUpdate,
  updateAccount,
  updatePassword,
  logout,
}
