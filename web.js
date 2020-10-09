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
                res.writeHead(200, {
                    'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                });
                res.end('hello world');
            } else if (parsed.pathname == '/verify') {
                if (!parsed.query || !parsed.query.token || !client.verifyQueue.get(parsed.query.token)) {
                    res.writeHead(400);
                    res.end('Invalid token');
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/html; charset=UTF-8',
                        'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                    });
                    fs.readFile('./assets/html/verify.html', 'utf8', (err, data) => {
                        res.end(data
                            .replace(/{tag}/gi, client.verifyQueue.get(parsed.query.token).tag.replace(/</gi, '&lt;').replace(/>/gi, '&gt;'))
                            .replace(/{user_profile}/gi, client.verifyQueue.get(parsed.query.token).displayAvatarURL())
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
                        axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA}&response=${post['g-recaptcha-response']}`).then(recaptchaRes => {
                            if (recaptchaRes.data.success != true) {
                                console.log(recaptchaRes.data)
                                res.writeHead(400);
                                res.end('reCAPTCHA authentication failed');
                            } else {
                                client.verifyQueue.get(post.token).send('인증을 완료했어요! 이제 int Team에서 자유롭게 활동해보세요.')
                                client.guilds.cache.get(ops.guildId).member(client.verifyQueue.get(post.token)).roles.add(ops.userRole);
                                client.verifyQueue.delete(post.token);
                                res.writeHead(200, {
                                    'Content-Type': 'text/html; charset=UTF-8',
                                    'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
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
                    'Content-Type': 'text/css; charset=UTF-8',
                    'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                });
                fs.readFile('./assets/css/style.css', 'utf8', (err, data) => {
                    res.end(data);
                });
            } else if (parsed.pathname == '/inticon.png') {
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                });
                fs.readFile('./assets/image/inticon.png', (err, data) => {
                    res.end(data);
                });
            } else if (parsed.pathname == '/loadingbar.js') {
                res.writeHead(200, {
                    'Content-Type': 'text/javascript; charset=UTF-8',
                    'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                });
                fs.readFile('./assets/js/loadingbar.js', 'utf8', (err, data) => {
                    res.end(data);
                });
            } else {
                res.writeHead(404, {
                    'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                });
                res.end('404 Not Found')
            }
        });
        server.listen(process.env.PORT || 3000);
    }
}