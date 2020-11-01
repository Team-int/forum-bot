const fs = require('fs');
module.exports = {
    pathname: '/verify/fallback',
    method: 'GET',
    run: async (client, req, res, parsed, ops) => {
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8',
            'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
        });
        fs.readFile('./assets/html/verify-fallback.html', 'utf8', (err, data) => {
            res.end(data);
        });
    }
}