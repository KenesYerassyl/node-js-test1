const http = require('http')
const fs = require('fs')

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
        const actionArray = JSON.parse(fs.readFileSync('./database.json', 'utf8') || '[]')
        let action = ''
        req.on('data', chunk => {
            action += chunk
        })

        req.on('end', () => {
            actionArray.push(action)
            jsonArray = JSON.stringify(actionArray)
            fs.writeFileSync('database.json', jsonArray)
            res.end('Action successfully added!')
        })
    } else if (req.method === 'GET' && req.url === '/actions') {
        const jsonArray = fs.readFileSync('./database.json') || '[]'
        res.end(jsonArray)
    } else if (req.method === 'DELETE' && req.url === '/delete-action') {
        var actionArray = JSON.parse(fs.readFileSync('./database.json', 'utf8') || '[]')
        let action = ''
        req.on('data', chunk => {
            action += chunk
        })

        req.on('end', () => {
            actionArray = actionArray.filter(function (item) {
                return item !== action;
            });
            jsonArray = JSON.stringify(actionArray)
            fs.writeFileSync('database.json', jsonArray)
            res.end('Action successfully deleted!')
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