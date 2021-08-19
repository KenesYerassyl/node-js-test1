const database = require("../db_controller");
const crypto = require("crypto");

async function validateAuthorization(username, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await database.getUser(username);
            if (result) {
                if (result.username !== username || crypto.createHash("md5").update(password).digest("hex") !== result.password) {
                    reject(["Entered username and password are incorrect or username does not exist!", 400]);
                }
                resolve();
            }
            reject(["Entered username and password are incorrect or username does not exist!", 400]);
        } catch (error) {
            console.log(error);
            reject(["Something went wrong!", 500]);
            return;
        }
    });
}

module.exports = validateAuthorization;
