const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
let db = new sqlite3.Database("./database.sqlite3", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});
db.run("PRAGMA foreign_keys = ON");

function createUser(username, password) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], (err) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }
                console.log(`A row has been inserted with username ${username}`);
                resolve();
            });
        });
    });
}

function doesUserExist(username) {
    return new Promise((resolve, reject) => {
        let result = false;
        db.serialize(() => {
            db.all(`SELECT * FROM users WHERE username = ?`, [username], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                if (rows) {
                    result = rows.length > 0;
                }
                resolve(result);
            });
        });
    });
}

function getUser(username) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT username, password, profile_picture FROM users WHERE username = ?`, [username], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(row);
            });
        });
    });
}

function getAllTodos(username) {
    return new Promise((resolve, reject) => {
        let result = [];
        db.serialize(() => {
            db.all(`SELECT * FROM todos WHERE username = ?`, [username], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                if (rows) {
                    result = rows;
                }
                resolve(result);
            });
        });
    });
}

function createAction(username, action) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const todo_id = crypto.randomBytes(8).toString("hex");
            db.run(`INSERT INTO todos (todo_id, username, content) VALUES (?, ?, ?)`, [todo_id, username, action], (err) => {
                if (err) {
                    console.log(err.message);
                    reject(err);
                }
                resolve(todo_id);
            });
        });
    });
}

function deleteAction(todo_id, username) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`DELETE FROM todos WHERE todo_id = ? AND username = ?`, [todo_id, username], (err) => {
                if (err) {
                    console.error(err.message);
                    reject(er);
                }
                resolve();
            });
        });
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
