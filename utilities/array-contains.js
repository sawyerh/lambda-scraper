/**
 * Checks if an array contains a given string
 * @param {array} haystack - The array to search
 * @param {string} needle - The string to search for
 * @return {boolean} True if the needle was found, otherwise false
 */
module.exports = function(haystack, needle) {
  var i = haystack.findIndex(str => str === needle);
  return (i >= 0);
};
