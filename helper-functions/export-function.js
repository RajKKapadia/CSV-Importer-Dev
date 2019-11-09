// Miscellaneous Function
const mif = require('./misc-functions');
// Database Function
const dc = require('./database-connection');
// Create Intent for Paid User Function
const cip = require('./createIntent-paid');
// Create Intent for Unpaid User Function
const ciup = require('./createIntent-unpaid');

module.exports = {
    'mif': mif,
    'dc': dc,
    'cip': cip,
    'ciup': ciup
};