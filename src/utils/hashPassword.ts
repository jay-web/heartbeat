import crypto = require('crypto');
import serverEnvironment from "../config";

export const hashUserPassword = (string) => {
    let hash = crypto.createHmac('sha256', serverEnvironment.secret).update(string).digest('hex');

    return hash;
}