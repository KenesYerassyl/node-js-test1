const http = require("http");
const crypto = require("crypto");
const fs = require("fs/promises");
const database = require("./db_controller");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer(async (req, res) => {
    res.statusCode = 200;
    if (req.method === "GET" && req.url === "/") {
        if (getUsername(req)) {
            try {
                const data = await fs.readFile("./public/index.html", "utf8");
                res.setHeader("Content-Type", "text/html");
                res.end(data);
            } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify(err));
            }
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

        req.on("end", async () => {
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
            try {
                const todo_id = await database.createAction(username, action);
                res.end(
                    JSON.stringify({
                        message: "Action successfully added!",
                        todo_id: todo_id,
                    })
                );
            } catch (error) {
                res.statusCode = 400;
                res.end(
                    JSON.stringify({
                        message: "Username does not exist!",
                    })
                );
            }
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
        try {
            const actions = await database.getAllTodos(username);
            res.end(JSON.stringify(actions));
        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ message: "Something went wrong!" }));
        }
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
            try {
                res.end(
                    JSON.stringify({
                        message: "Action successfully deleted!",
                    })
                );
            } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ message: "Something went wrong!" }));
            }
        });
    } else if (req.url === "/register") {
        if (req.method == "POST") {
            let dataJSON = "";
            req.on("data", (chunk) => {
                dataJSON += chunk;
            });

            req.on("end", async () => {
                let { username, password } = JSON.parse(dataJSON);
                try {
                    await validateRegistration(username, password);
                    password = crypto.createHash("md5").update(password).digest("hex");
                    try {
                        await database.createUser(username, password);
                        res.setHeader("Set-Cookie", `username=${username}; HttpOnly; path=/`);
                        res.end(
                            JSON.stringify({
                                username: username,
                                message: "User successfully created!",
                            })
                        );
                    } catch (error) {
                        res.statusCode = 500;
                        res.end(
                            JSON.stringify({
                                message: "Something went wrong!",
                            })
                        );
                    }
                } catch ([message, code]) {
                    res.statusCode = code;
                    res.end(
                        JSON.stringify({
                            message: message,
                        })
                    );
                }
            });
        } else {
            try {
                const data = await fs.readFile("./public/registration.html", "utf8");
                res.setHeader("Content-Type", "text/html");
                res.end(data);
            } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify(err));
            }
        }
    } else if (req.url === "/auth") {
        if (req.method === "POST") {
            let dataJSON = "";
            req.on("data", (chunk) => {
                dataJSON += chunk;
            });
            req.on("end", async () => {
                const { username, password } = JSON.parse(dataJSON);
                try {
                    await validateAuthorization(username, password);
                    res.setHeader("Set-Cookie", `username=${username}; HttpOnly; path=/`);
                    res.end(
                        JSON.stringify({
                            username: username,
                            message: "User has been successfully found!",
                        })
                    );
                } catch ([message, code]) {
                    res.statusCode = code;
                    res.end(
                        JSON.stringify({
                            message: message,
                        })
                    );
                }
            });
        } else {
            try {
                const data = await fs.readFile(__dirname + "/public/authorization.html");
                res.end(data);
            } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify(err));
            }
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
        res.setHeader("Set-Cookie", `username=${username}; HttpOnly; path=/; max-age=0`);
        res.end(
            JSON.stringify({
                message: "User successfully logged out!",
            })
        );
    } else {
        try {
            const data = await fs.readFile(__dirname + "/public" + req.url);
            res.end(data);
        } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify(err));
        }
    }
});

function validateAuthorization(username, password) {
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
            reject(["Something went wrong!", 500]);
            return;
        }
    });
}

async function validateRegistration(username, password) {
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
