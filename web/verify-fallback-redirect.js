const axios = require('axios').default;
const fs = require('fs');
const qs = require('querystring');
module.exports = {
    pathname: '/verify/fallback/redirect',
    method: 'GET',
    run: async (client, req, res, parsed, ops) => {
        if (!parsed.query.code) {
            res.writeHead(401, {
                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
            });
            res.end('Discord authentication cancled');
        } else {
            axios.post('https://discord.com/oauth2/token', qs.stringify({
                client_id: client.user.id,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: parsed.query.code,
                scope: 'identify guilds'
            }), {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            }).then(tokenRes => {
                console.log('tkn')
                axios.get('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `${tokenRes.data.token_type} ${tokenRes.data.access_token}`
                    }
                }).then(userRes => {
                    console.log('usr')
                    axios.get('https://discord.com/api/users/@me/guilds', {
                        headers: {
                            Authorization: `${tokenRes.data.token_type} ${tokenRes.data.access_token}`
                        }
                    }).then(async guildRes => {
                        console.log('gld')
                        if (!guildRes.data.find(x => x.id == ops.guildId)) {
                            res.writeHead(400, {
                                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                            });
                            res.end('You\'re not in the guild');
                        } else {
                            if (userRes.data.bot == true) {
                                res.writeHead(403, {
                                    'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                                });
                                res.end('You\'re a bot');
                            } else {
                                if (!client.guilds.cache.get(ops.guildId).members.cache.get(userRes.data.id)) await client.guilds.cache.get(ops.guildId).members.fetch(userRes.data.id);
                                if (client.guilds.cache.get(ops.guildId).members.cache.get(userRes.data.id).roles.cache.has(ops.userRole)) {
                                    res.writeHead(304, {
                                        'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                                    });
                                    res.end('User role already exists');
                                } else {
                                    axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA}&response=${parsed.query.state}`).then(recaptchaRes => {
                                        if (recaptchaRes.data.success != true) {
                                            res.writeHead(403, {
                                                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                                            });
                                            res.end('reCAPTCHA authentication failed');
                                        } else {
                                            client.guilds.cache.get(ops.guildId).members.cache.get(userRes.data.id).roles.add(ops.userRole);
                                            res.writeHead(200, {
                                                'content-type': 'text/html; charset=UTF-8',
                                                'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
                                            });
                                            fs.readFile('./assets/html/done.html', 'utf8', (err, data) => {
                                                res.end(data);
                                            })
                                        }
                                    })
                                }
                            }
                        }
                    })
                })
            })
        }
    }
}