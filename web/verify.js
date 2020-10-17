const fs = require('fs');
module.exports = {
    pathname: '/verify',
    method: 'GET',
    run: async (client, req, res, parsed) => {
        if (!parsed.query || !parsed.query.token || !client.verifyQueue.get(parsed.query.token)) {
            res.writeHead(400);
            res.end('Invalid token');
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=UTF-8',
                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
            });
            fs.readFile('../assets/html/verify.html', 'utf8', (err, data) => {
                res.end(data
                    .replace(/{tag}/gi, client.verifyQueue.get(parsed.query.token).tag.replace(/</gi, '&lt;').replace(/>/gi, '&gt;'))
                    .replace(/{user_profile}/gi, client.verifyQueue.get(parsed.query.token).displayAvatarURL())
                );
            });
        }
    }
}