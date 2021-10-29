let handlers = require("./lib/handlers/handlers");

module.exports = {
    'ping': handlers.ping,
    'user': handlers.user,
    "token": handlers.token
}