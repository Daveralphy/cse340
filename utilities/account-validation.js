const { body, validationResult } = require("express-validator")

/* ****************************
 * Validation Rules for Login
 * ***************************** */
const loginRules = () => {
  return [
    // Validate Email
    body("account_email")
      .trim()
      .escape()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Validate Password
    body("account_password")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Password is required."),
  ]
}

/* ****************************
 * Check Login Data
 * ***************************** */
const checkLoginData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = res.locals.nav || ""
    const { account_email } = req.body
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/* ****************************
 * Validation Rules for Registration
 * ***************************** */
const registerRules = () => {
  return [
    // Validate First Name
    body("account_firstname")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("First name is required."),

    // Validate Last Name
    body("account_lastname")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),

    // Validate Username
    body("account_username")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters."),

    // Validate Email
    body("account_email")
      .trim()
      .escape()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Validate Password
    body("account_password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ]
}

/* ****************************
 * Check Register Data
 * ***************************** */
const checkRegisterData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = res.locals.nav || ""
    const { account_firstname, account_lastname, account_username, account_email } = req.body
    res.render("account/register", {
      errors: errors.array(),
      title: "Create Account",
      nav,
      account_firstname,
      account_lastname,
      account_username,
      account_email,
    })
    return
  }
  next()
}

/* ****************************
 * Validation Rules for Account Update
 * ***************************** */
const updateRules = () => {
  return [
    // Validate First Name
    body("account_firstname")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("First name is required."),

    // Validate Last Name
    body("account_lastname")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),

    // Validate Email
    body("account_email")
      .trim()
      .escape()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
  ]
}

/* ****************************
 * Check Update Data
 * ***************************** */
const checkUpdateData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = res.locals.nav || ""
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      account_id,
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      },
    })
    return
  }
  next()
}

/* ****************************
 * Validation Rules for Password Update
 * ***************************** */
const passwordRules = () => {
  return [
    // Validate Password strength
    body("account_password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character (!@#$%^&*)."),
  ]
}

/* ****************************
 * Check Password Data
 * ***************************** */
const checkPasswordData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = res.locals.nav || ""
    const { account_id } = req.body
    res.render("account/update", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      account_id,
      accountData: res.locals.accountData,
    })
    return
  }
  next()
}

module.exports = {
  loginRules,
  checkLoginData,
  registerRules,
  checkRegisterData,
  updateRules,
  checkUpdateData,
  passwordRules,
  checkPasswordData,
}
