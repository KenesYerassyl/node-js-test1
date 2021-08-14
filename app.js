const http = require('http')
const fs = require('fs')
const database = require('./db_controller')

const hostname = '127.0.0.1';
const port = 3000

function getData(contentType, name) {
    return [fs.readFileSync(`./public/${name}`, 'utf8'), `text/${contentType}`]
}

const server = http.createServer((req, res) => {
    res.statusCode = 200
    if (req.method === 'GET' && req.url === '/') {
        const [data, contentType] = getData('html', 'index.html')
        res.setHeader('Content-Type', contentType)
        res.end(data)
    } else if (req.method === 'GET' && req.url === '/styles.css') {
        const [data, contentType] = getData('css', 'styles.css')
        res.setHeader('Content-Type', contentType)
        res.end(data)
    } else if (req.method === 'GET' && req.url === '/index.js') {
        const [data, contentType] = getData('javascript', 'index.js')
        res.setHeader('Content-Type', contentType)
        res.end(data)
    } else if (req.method === 'POST' && req.url === '/add-action') {
        let dataJSON = ''
        req.on('data', chunk => {
            dataJSON += chunk
        })

        req.on('end', () => {
            const {username, action} = JSON.parse(dataJSON)
            database.createAction(username, action, (err, todo_id) => {
                if (err) {
                    res.statusCode = 400
                    res.end('Username does not exist!')
                } else {
                    res.end(JSON.stringify({
                        "message" : "Action successfully added!",
                        "todo_id" : todo_id
                    }))
                }
            })
        })
    } else if (req.method === 'GET' && req.url.startsWith('/actions/')) {
        database.getAllTodos(req.url.slice(9), (err, actions) => {
            if (err) {
                res.statusCode = 500
                res.end('Something went wrong!')
            } else {
                res.end(JSON.stringify(actions))
            }
        })
    } else if (req.method === 'DELETE' && req.url === '/delete-action') {
        let dataJSON = ''
        req.on('data', chunk => {
            dataJSON += chunk
        })

        req.on('end', () => {
            const {todo_id, username} = JSON.parse(dataJSON)
            database.deleteAction(todo_id, username, (err) => {
                if (err) {
                    res.statusCode = 400
                    res.end('Username does not exist!')
                } else {
                    res.end('Action successfully deleted!')
                }
            })
        })
    }
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

/*
1. Integrate SQlite3
2. Add authorization
3. File upload (Profile Photo)
*/