const database = require("../db_controller");

function validateRegistration(username, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await database.doesUserExist(username);
            if (result) {
                reject(["Username already exists!", 400]);
            }
            username.split("").forEach((letter) => {
                if (!("a" <= letter && letter <= "z") && !("A" <= letter && letter <= "Z") && !("0" <= letter && letter <= "9")) {
                    reject(["Username contains invalid characters!", 400]);
                }
            });
            if (username.length > 30) {
                reject(["Username is too long!", 400]);
            }
            if (username.length < 4) {
                reject(["Username is too short!", 400]);
            }
            if (password.length < 8) {
                reject(["Password should be at least 8 characters!", 400]);
            }
            resolve();
        } catch (error) {
            console.log("validateRegistration", error);
            reject(["Something went wrong!", 500]);
        }
    });
}

module.exports = validateRegistration;
