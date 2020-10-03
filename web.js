const http = require('http');
const axios = require('axios').default;
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
module.exports = {
    start: (client, ops) => {
        const server = http.createServer((req, res) => {
            let parsed = url.parse(req.url, true);
            if (parsed.pathname == '/') {
                res.writeHead(200);
                res.end('hello world');
            } else if (parsed.pathname == '/verify') {
                if (!parsed.query || !parsed.query.token || !client.verifyQueue.get(parsed.query.token)) {
                    res.writeHead(400);
                    res.end('Invalid token');
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/html; charset=UTF-8'
                    });
                    fs.readFile('./assets/html/verify.html', 'utf8', (err, data) => {
                        res.end(data
                            .replace(/{tag}/gi, client.verifyQueue.get(parsed.query.token).tag.replace(/</gi, '&lt;').replace(/>/gi, '&gt;'))
                        );
                    });
                }
            } else if (parsed.pathname == '/subm') {
                let post = '';
                req.on('data', data => {
                    post += data;
                });
                req.on('end', () => {
                    if (req.headers['content-type'] == 'application/json') {
                        post = JSON.parse(post);
                    } else if (req.headers['content-type'] == 'application/x-www-form-urlencoded') {
                        post = qs.parse(post);
                    }
                    if (!post.token || !client.verifyQueue.get(post.token)) {
                        res.writeHead(400);
                        res.end('Invalid token');
                    } else {
                        axios.post('https://www.google.com/recaptcha/api/siteverify', {
                            secret: process.env.RECAPTCHA,
                            response: post['g-recaptcha-response']
                        }).then(recaptchaRes => {
                            if (recaptchaRes.data.success != true) {
                                res.writeHead(400);
                                res.end('reCAPTCHA authentication failed');
                            } else {
                                client.guilds.cache.get(ops.guildId).member(client.verifyQueue.get(post.token)).roles.add(ops.userRole);
                                client.verifyQueue.delete(post.token);
                                res.writeHead(200, {
                                    'Content-Type': 'text/html; charset=UTF-8'
                                });
                                fs.readFile('./assets/html/done.html', 'utf8', (err, data) => {
                                    res.end(data);
                                });
                            }
                        });
                    }
                });
            } else if (parsed.pathname == '/style.css') {
                res.writeHead(200, {
                    'Content-Type': 'text/css; charset=UTF-8'
                });
                fs.readFile('./assets/css/style.css', 'utf8', (err, data) => {
                    res.end(data);
                });
            }
        });
        server.listen(process.env.PORT || 3000);
        setInterval(() => {
            axios.get('https://int-manager.herokuapp.com').then();
        }, 120000);
    }
}