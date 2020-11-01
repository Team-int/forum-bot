module.exports = {
    pathname: '/verify/fallback/login',
    method: 'GET',
    run: async (client, req, res, parsed, ops) => {
        if (!parsed.query['g-recaptcha-response']) {
            res.writeHead(400, {
                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
            });
            res.end('reCAPTCHA authentication failed');
        } else {
            res.writeHead(302, {
                'Location': `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&redirect_uri=${encodeURIComponent(process.env.REDIRECT)}&response_type=code&scope=identify%20guilds&state=${encodeURIComponent(parsed.query['g-recaptcha-response'])}`,
                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
            });
            res.end();
        }
    }
}