const http = require('http');
const axios = require('axios').default;
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
module.exports = {
    start: (client, ops) => {
        const server = http.createServer((req, res) => {
            let parsed = url.parse(req.url, true);
            if (parsed.pathname.startsWith('/static/')) {
                if (parsed.pathname.startsWith('/static/html/')) {
                    fs.readFile(`./assets/html/${path.parse(parsed.pathname).base}`, 'utf8', (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                            });
                            res.end('404 Not Found');
                            return;
                        }
                        res.writeHead(200, {
                            'Content-Type': "text/html; charset=UTF-8",
                            'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                        });
                        res.end(data);
                    });
                } else if (parsed.pathname.startsWith('/static/css/')) {
                    fs.readFile(`./assets/css/${path.parse(parsed.pathname).base}`, 'utf8', (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                            });
                            res.end('404 Not Found');
                            return;
                        }
                        res.writeHead(200, {
                            'Content-Type': "text/css; charset=UTF-8",
                            'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                        });
                        res.end(data);
                    });
                } else if (parsed.pathname.startsWith('/static/js/')) {
                    fs.readFile(`./assets/js/${path.parse(parsed.pathname).base}`, 'utf8', (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                            });
                            res.end('404 Not Found');
                            return;
                        }
                        res.writeHead(200, {
                            'Content-Type': "text/javascript; charset=UTF-8",
                            'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                        });
                        res.end(data);
                    });
                } else if (parsed.pathname.startsWith('/static/image/')) {
                    fs.readFile(`./assets/image/${path.parse(parsed.pathname).base}`, (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                            });
                            res.end('404 Not Found');
                            return;
                        }
                        res.writeHead(200, {
                            'Content-Type': "image/png",
                            'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                        });
                        res.end(data);
                    });
                } else {
                    res.writeHead(404, {
                        'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                    });
                    res.end('404 Not Found');
                }
            } else {
                if (client.paths.get(parsed.pathname)) {
                    if (client.paths.get(parsed.pathname).method == req.method) {
                        client.paths.get(parsed.pathname).run(client, req, res, parsed);
                    } else {
                        res.writeHead(405, {
                            'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                        });
                        res.end('405 Method Not Allowed')
                    }
                } else {
                    res.writeHead(404, {
                        'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                    });
                    res.end('404 Not Found');
                }
            }
        });
        server.listen(process.env.PORT || 3000);
    }
}