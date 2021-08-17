const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

const database = require("./db_controller");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    if (req.method === "GET" && req.url === "/") {
        if (getUsername(req)) {
            const data = fs.readFileSync("./public/index.html", "utf8");
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        } else {
            res.writeHead(302, {
                Location: `http://${hostname}:${port}/register`,
            });
            res.end();
        }
    } else if (req.method === "POST" && req.url === "/add-action") {
        let dataJSON = "";
        req.on("data", (chunk) => {
            dataJSON += chunk;
        });

        req.on("end", () => {
            const { action } = JSON.parse(dataJSON);
            const username = getUsername(req);
            if (!username) {
                res.statusCode = 400;
                return res.end(
                    JSON.stringify({
                        message: "Authorize to continue!",
                    })
                );
            }
            database.createAction(username, action, (err, todo_id) => {
                if (err) {
                    res.statusCode = 400;
                    res.end(
                        JSON.stringify({
                            message: "Username does not exist!",
                        })
                    );
                } else {
                    res.end(
                        JSON.stringify({
                            message: "Action successfully added!",
                            todo_id: todo_id,
                        })
                    );
                }
            });
        });
    } else if (req.method === "GET" && req.url === "/actions") {
        let username = getUsername(req);
        if (!username) {
            res.statusCode = 400;
            return res.end(
                JSON.stringify({
                    message: "Authorize to continue!",
                })
            );
        }
        database.getAllTodos(username, (err, actions) => {
            if (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ message: "Something went wrong!" }));
            } else {
                res.end(JSON.stringify(actions));
            }
        });
    } else if (req.method === "DELETE" && req.url === "/delete-action") {
        let dataJSON = "";
        req.on("data", (chunk) => {
            dataJSON += chunk;
        });

        req.on("end", () => {
            const { todo_id } = JSON.parse(dataJSON);
            const username = getUsername(req);
            if (!username) {
                res.statusCode = 400;
                return res.end(
                    JSON.stringify({
                        message: "Authorize to continue!",
                    })
                );
            }
            database.deleteAction(todo_id, username, (err) => {
                if (err) {
                    res.statusCode = 500;
                    res.end(
                        JSON.stringify({ message: "Something went wrong!" })
                    );
                } else {
                    res.end(
                        JSON.stringify({
                            message: "Action successfully deleted!",
                        })
                    );
                }
            });
        });
    } else if (req.url === "/register") {
        if (req.method == "POST") {
            let dataJSON = "";
            req.on("data", (chunk) => {
                dataJSON += chunk;
            });

            req.on("end", () => {
                let { username, password } = JSON.parse(dataJSON);
                validateRegistration(username, password, (message, code) => {
                    if (message && code) {
                        res.statusCode = code;
                        res.end(message);
                    } else {
                        password = crypto
                            .createHash("md5")
                            .update(password)
                            .digest("hex");
                        database.createUser(username, password, (err) => {
                            if (err) {
                                res.statusCode = 500;
                                res.end(
                                    JSON.stringify({
                                        message: "Something went wrong!",
                                    })
                                );
                            } else {
                                res.setHeader(
                                    "Set-Cookie",
                                    `username=${username}; HttpOnly; path=/`
                                );
                                res.end(
                                    JSON.stringify({
                                        username: username,
                                        message: "User successfully created!",
                                    })
                                );
                            }
                        });
                    }
                });
            });
        } else {
            const data = fs.readFileSync("./public/registration.html", "utf8");
            res.setHeader("Content-Type", "text/html");
            res.end(data);
        }
    } else if (req.url === "/auth") {
        if (req.method === "POST") {
            let dataJSON = "";
            req.on("data", (chunk) => {
                dataJSON += chunk;
            });
            req.on("end", () => {
                const { username, password } = JSON.parse(dataJSON);
                validateAuthorization(username, password, (message, code) => {
                    if (message && code) {
                        res.statusCode = code;
                        res.end(message);
                    } else {
                        res.setHeader(
                            "Set-Cookie",
                            `username=${username}; HttpOnly; path=/`
                        );
                        res.end(
                            JSON.stringify({
                                username: username,
                                message: "User has been successfully found!",
                            })
                        );
                    }
                });
            });
        } else {
            fs.readFile(
                __dirname + "/public/authorization.html",
                function (err, data) {
                    if (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify(err));
                        return;
                    }
                    res.end(data);
                }
            );
        }
    } else if (req.method === "DELETE" && req.url === "/") {
        const username = getUsername(req);
        if (!username) {
            res.statusCode = 400;
            return res.end(
                JSON.stringify({
                    message: "Authorize to continue!",
                })
            );
        }
        res.setHeader(
            "Set-Cookie",
            `username=${username}; HttpOnly; path=/; max-age=0`
        );
        res.end(
            JSON.stringify({
                message: "User successfully logged out!",
            })
        );
    } else {
        fs.readFile(__dirname + "/public" + req.url, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(JSON.stringify(err));
                return;
            }
            res.end(data);
        });
    }
});

function validateAuthorization(username, password, callback) {
    database.getUser(username, (err, result) => {
        if (err) {
            callback("Something went wrong!", 500);
            return;
        }
        if (result) {
            if (
                result.username !== username ||
                crypto.createHash("md5").update(password).digest("hex") !==
                    result.password
            ) {
                callback(
                    "Entered username and password are incorrect or username does not exist!",
                    400
                );
                return;
            }
            callback(null, null);
            return;
        }
        callback("Something went wrong!", 500);
        return;
    });
}

function validateRegistration(username, password, callback) {
    database.doesUserExist(username, (err, result) => {
        if (err) {
            console.log(err);
            callback("Something went wrong!", 500);
            return;
        }
        if (result) {
            callback("Username already exists!", 400);
            return;
        }
        username.split().forEach((letter) => {
            if (
                !("a" <= letter && letter <= "z") &&
                !("A" <= letter && letter <= "Z") &&
                !("0" <= letter && letter <= "9")
            ) {
                callback("Username contains invalid characters!", 400);
                return;
            }
        });
        if (username.length > 30) {
            callback("Username is too long!", 400);
            return;
        }
        if (username.length < 4) {
            callback("Username is too short!", 400);
            return;
        }
        if (password.length < 8) {
            callback("Password should be at least 8 characters!", 400);
            return;
        }
        callback(null, null);
    });
}

function getUsername(req) {
    if (!req.headers.cookie) {
        return null;
    }
    const usernameArray = req.headers.cookie.split("; ").filter((element) => {
        return element.startsWith("username=");
    });
    if (usernameArray.length === 0) {
        return null;
    } else {
        return usernameArray.pop().split("=").pop();
    }
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

/*
1. Integrate SQlite3
2. Add authorization
3. File upload (Profile Photo)
*/

/*
 */
