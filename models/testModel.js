const testFunction = () => {
  const name = "Raphael"
  console.log("User:", name)

  // Intentional error
  const unknownVariable = 10
  const result = unknownVariable + 5

  return result
}

module.exports = { testFunction }