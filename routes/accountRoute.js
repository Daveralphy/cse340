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

// Register Routes
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
  "/register",
  regValidate.registerRules(),
  regValidate.checkRegisterData,
  utilities.handleErrors(accountController.accountRegister)
)

// Account Management (protected route)
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
)

// Account Info - View Account Details (protected route)
router.get(
  "/info",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildInfo)
)

// Account Update (protected route)
router.get(
  "/update",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
)

router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Password Update (protected route)
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
)

module.exports = router
