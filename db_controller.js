const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
let db = new sqlite3.Database("./database.sqlite3", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});
db.run("PRAGMA foreign_keys = ON");

function createUser(username, password, callback) {
    db.serialize(() => {
        db.run(
            `INSERT INTO users (username, password) VALUES (?, ?)`,
            [username, password],
            (err) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(
                    `A row has been inserted with username ${username}`
                );
                callback(err);
            }
        );
    });
}

function doesUserExist(username, callback) {
    let result = false;
    db.serialize(() => {
        db.all(
            `SELECT * FROM users WHERE username = ?`,
            [username],
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                }
                if (rows) {
                    result = rows.length > 0;
                }
                callback(err, result);
            }
        );
    });
}

function getUser(username, callback) {
    db.serialize(() => {
        db.get(
            `SELECT username, password, profile_picture FROM users WHERE username = ?`,
            [username],
            (err, row) => {
                if (err) {
                    console.error(err.message);
                }
                callback(err, row);
            }
        );
    });
}

function getAllTodos(username, callback) {
    let result = [];
    db.serialize(() => {
        db.all(
            `SELECT * FROM todos WHERE username = ?`,
            [username],
            (err, rows) => {
                if (err) {
                    console.error(err.message);
                }
                if (rows) {
                    result = rows;
                }
                callback(err, result);
            }
        );
    });
}

function createAction(username, action, callback) {
    db.serialize(() => {
        const todo_id = crypto.randomBytes(8).toString("hex");
        db.run(
            `INSERT INTO todos (todo_id, username, content) VALUES (?, ?, ?)`,
            [todo_id, username, action],
            (err) => {
                callback(err, todo_id);
                if (err) {
                    console.log(err.message);
                }
            }
        );
    });
}

function deleteAction(todo_id, username, callback) {
    db.serialize(() => {
        db.run(
            `DELETE FROM todos WHERE todo_id = ? AND username = ?`,
            [todo_id, username],
            (err) => {
                callback(err);
                if (err) {
                    console.error(err.message);
                }
            }
        );
    });
}

module.exports = {
    getAllTodos,
    createUser,
    doesUserExist,
    createAction,
    deleteAction,
    getUser,
};
