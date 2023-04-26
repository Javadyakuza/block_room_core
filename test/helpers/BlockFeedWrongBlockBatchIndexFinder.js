function findTheIndex(reasonString) {
  let startIndex = reasonString.indexOf('index') + 5
  let endIndex = -1
  return Number(reasonString.slice(startIndex, endIndex))
}
module.exports = { findTheIndex }
