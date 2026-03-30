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
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      hideNav: true,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
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

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        hideNav: true,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
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
    const { account_firstname, account_lastname, account_username, account_email, account_password } = req.body

    // Hash the password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
      req.flash("notice", "Sorry, there was an error processing the registration.")
      res.status(500).render("account/register", {
        title: "Create Account",
        nav,
        hideNav: true,
        errors: null,
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
      req.flash("notice", "Sorry, the registration failed. Please try again.")
      res.status(400).render("account/register", {
        title: "Create Account",
        nav,
        hideNav: true,
        errors: null,
        account_firstname,
        account_lastname,
        account_username,
        account_email,
      })
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Create Account",
      nav: await utilities.getNav(),
      hideNav: true,
      errors: null,
    })
  }
}

module.exports = {
  buildLogin,
  accountLogin,
  buildManagement,
  buildRegister,
  accountRegister,
}
