const { body, validationResult } = require("express-validator")

/* ****************************
 * Validation Rules for Registration
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

module.exports = {
  loginRules,
  checkLoginData,
}
