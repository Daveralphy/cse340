/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const session = require("express-session")
const flash = require("connect-flash")
const app = express()
const static = require("./routes/static")
const invRoute = require("./routes/inventoryRoute")
const vehiclesRoute = require("./routes/vehiclesRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities")
const cookieParser = require("cookie-parser")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Middleware
 *************************/
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: true,
  saveUninitialized: true,
  name: "sessionId"
}))
app.use(flash())

// Make flash messages available globally to templates
app.use((req, res, next) => {
  const allMessages = req.flash()
  res.locals.messages = allMessages
  res.locals.notice = allMessages.notice || []
  next()
})

// Body parser middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(utilities.checkJWTToken)

/* ***********************
 * Routes
 *************************/
app.use(static)
app.use("/inv", invRoute)
app.use("/account", accountRoute)

// Index route
app.get("/", async function (req, res, next) {
  try {
    res.render("index", {
      title: "Home",
      nav: await utilities.getNav('/', res.locals.loggedin),
    })
  } catch (error) {
    next(error)
  }
})

// Vehicles routes (public browsing - must come after home route)
app.use(vehiclesRoute)

app.use(async (req, res, next) => {
  try {
    res.status(404).render("errors/error", {
      title: "404 - Not Found",
      nav: await utilities.getNav(),
      message: "Sorry, the requested page was not found.",
    })
  } catch (error) {
    next(error)
  }
})

app.use(async (err, req, res, next) => {
  try {
    console.error(err)
    const status = err.status || 500
    res.status(status).render("errors/error", {
      title: status === 404 ? "404 - Not Found" : "Server Error",
      nav: await utilities.getNav(),
      message: err.message || "Sorry, something went wrong.",
    })
  } catch (error) {
    res.status(500).send("Server Error")
  }
})

app.use(cookieParser())

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})