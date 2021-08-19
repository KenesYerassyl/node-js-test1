const database = require("../db_controller");

async function verifyAuth(req, res, next) {
    const username = req.cookies.username;
    if (!username) {
        return res.status(401).json({ message: "Please log in to continue!" });
    }

    if (!(await database.doesUserExist(username))) {
        return res.status(401).json({ message: "Username does not exist" });
    }

    res.locals.username = username;
    next();
}

module.exports = verifyAuth;
