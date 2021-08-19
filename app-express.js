const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const hostname = "127.0.0.1";
const port = 3000;
const database = require("./db_controller");
const verifyAuth = require("./middlewares/verifyAuth");
const validateRegistration = require("./utils/validateRegistration");
const validateAuthorization = require("./utils/validateAuthorization");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static("./public"));

app.get("/", async (req, res) => {
    if (req.cookies.username) {
        res.sendFile(__dirname + "/public/index.html");
    } else {
        res.redirect(`/register`);
    }
});

app.post("/add-action", verifyAuth, async (req, res) => {
    try {
        const { action } = req.body;
        const { username } = res.locals;
        const todo_id = await database.createAction(username, action);
        res.json({
            message: "Action successfully added!",
            todo_id: todo_id,
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
});

app.get("/actions", verifyAuth, async (req, res) => {
    try {
        const { username } = res.locals;
        const actions = await database.getAllTodos(username);
        res.json(actions);
    } catch (error) {
        res.statusCode = 500;
        res.json({ message: "Something went wrong!" });
    }
});

app.delete("/delete-action", verifyAuth, async (req, res) => {
    const { todo_id } = req.body;
    const { username } = res.locals;
    try {
        await database.deleteAction(todo_id, username);
        res.json({ message: "Action successfully deleted!" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" });
    }
});

app.post("/register", async (req, res) => {
    try {
        let { username, password } = req.body;
        await validateRegistration(username, password);
        password = crypto.createHash("md5").update(password).digest("hex");
        try {
            await database.createUser(username, password);
            res.cookie("username", username, { httpOnly: true }).json({
                username: username,
                message: "User successfully created!",
            });
        } catch (error) {
            consloe.log(error);
            res.status(500).json({ message: "Something went wrong!" });
        }
    } catch ([message, code]) {
        console.log(message);
        res.status(code).json({ message: message });
    }
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/registration.html");
});

app.post("/auth", async (req, res) => {
    const { username, password } = req.body;
    try {
        await validateAuthorization(username, password);
        res.cookie("username", username, { httpOnly: true });
        res.json({
            username: username,
            message: "User has been successfully found!",
        });
    } catch ([message, code]) {
        res.status(code).json({
            message: message,
        });
    }
});

app.delete("/", (req, res) => {
    res.clearCookie("username");
    res.json({
        message: "User successfully logged out!",
    });
});

app.get("/auth", (req, res) => {
    res.sendFile(__dirname + "/public/authorization.html");
});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
