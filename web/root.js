module.exports = {
    pathname: '/',
    method: 'GET',
    run:  async (client, req, res, parsed) => {
        res.writeHead(200, {
            'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
        });
        res.end('hello world');
    }
}