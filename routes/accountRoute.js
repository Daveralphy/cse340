const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")
const utilities = require("../utilities")

// Login Routes
router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account Management (protected route)
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
)

module.exports = router
