const qs = require('querystring');
const axios = require('axios').default;
const fs = require('fs');
module.exports = {
    pathname: '/subm',
    method: 'POST',
    run: async (client, req, res, parsed, ops) => {
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
    }
}