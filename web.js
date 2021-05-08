const http2 = require("http2");
const http = require("http");
const axios = require("axios").default;
const url = require("url");
const fs = require("fs");
const qs = require("querystring");
const path = require("path");
const Discord = require("discord.js");
module.exports = {
    start: async (client, ops) => {
        const httpServer = http.createServer((req, res) => {
            let parsed = url.parse(req.url, true);
            if (parsed.pathname.startsWith("/.well-known/acme-challenge/")) {
                fs.readFile(`./.well-known/acme-challenge/${path.parse(parsed.pathname).base}`, "utf8", (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end("404 Not Found");
                        return;
                    }
                    res.writeHead(200);
                    res.end(data);
                });
            } else {
                res.writeHead(302, {
                    Location: `https://${req.headers.host}${req.url}`,
                });
                res.end();
            }
        });
        httpServer.listen(8080, () => {
            console.log("http server started");
        });
        const httpsServer = http2.createSecureServer({
            cert: fs.readFileSync("/etc/letsencrypt/live/manager.teamint.xyz/fullchain.pem"),
            key: fs.readFileSync("/etc/letsencrypt/live/manager.teamint.xyz/privkey.pem"),
            allowHTTP1: true
        }, (req, res) => {
            let parsed = url.parse(req.url, true);
            if (parsed.pathname.startsWith("/static/")) {
                if (parsed.pathname.startsWith("/static/html/")) {
                    fs.readFile(`./assets/html/${path.parse(parsed.pathname).base}`, "utf8", (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                            });
                            res.end("404 Not Found");
                            return;
                        }
                        res.writeHead(200, {
                            "Content-Type": "text/html; charset=UTF-8",
                            "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                        });
                        res.end(data);
                    });
                } else if (parsed.pathname.startsWith("/static/css/")) {
                    fs.readFile(`./assets/css/${path.parse(parsed.pathname).base}`, "utf8", (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                            });
                            res.end("404 Not Found");
                            return;
                        }
                        res.writeHead(200, {
                            "Content-Type": "text/css; charset=UTF-8",
                            "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                        });
                        res.end(data);
                    });
                } else if (parsed.pathname.startsWith("/static/js/")) {
                    fs.readFile(`./assets/js/${path.parse(parsed.pathname).base}`, "utf8", (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                            });
                            res.end("404 Not Found");
                            return;
                        }
                        res.writeHead(200, {
                            "Content-Type": "text/javascript; charset=UTF-8",
                            "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                        });
                        res.end(data);
                    });
                } else if (parsed.pathname.startsWith("/static/image/")) {
                    fs.readFile(`./assets/image/${path.parse(parsed.pathname).base}`, (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                            });
                            res.end("404 Not Found");
                            return;
                        }
                        res.writeHead(200, {
                            "Content-Type": "image/png",
                            "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                        });
                        res.end(data);
                    });
                } else if (parsed.pathname.startsWith("/static/json/")) {
                    fs.readFile(`./assets/json/${path.parse(parsed.pathname).base}`, 'utf8', (err, data) => {
                        if (err) {
                            res.writeHead(404, {
                                "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                            });
                            res.end("404 Not Found");
                            return;
                        }
                        res.writeHead(200, {
                            "Content-Type": "application/json; charset=UTF-8",
                            "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                        });
                        res.end(data);
                    });
                } else {
                    res.writeHead(404, {
                        "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                    });
                    res.end("404 Not Found");
                }
            } else if (parsed.pathname == "/manifest.json") {
                res.writeHead(200, {
                    "content-type": "application/json; charset=UTF-8",
                    "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                });
                fs.readFile("./assets/json/manifest.json", "utf8", (err, data) => {
                    res.end(data);
                });
            } else if (parsed.pathname == "/serviceWorker.js") {
                res.writeHead(200, {
                    "content-type": "text/javascript; charset=UTF-8",
                    "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                });
                fs.readFile("./assets/js/serviceWorker.js", "utf8", (err, data) => {
                    res.end(data);
                });
            } else {
                if (req.headers["user-agent"] && (req.headers["user-agent"].includes("MSIE") || req.headers["user-agent"].includes("rv:11.0"))) {
                    res.writeHead(200, {
                        "Content-Type": "text/html; charset=UTF-8",
                        "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                    });
                    fs.readFile("./assets/html/ie.html", "utf8", (err, data) => {
                        res.end(data);
                    });
                    return;
                }
                if (client.paths.get(parsed.pathname)) {
                    if (client.paths.get(parsed.pathname).method == req.method) {
                        client.paths.get(parsed.pathname).run(client, req, res, parsed, ops);
                    } else {
                        res.writeHead(405, {
                            "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                        });
                        res.end("405 Method Not Allowed");
                    }
                } else {
                    res.writeHead(404, {
                        "strict-transport-security": "max-age=86400; includeSubDomains; preload",
                    });
                    res.end("404 Not Found");
                }
            }
        });
        httpsServer.listen(8443, () => {
            console.log("https server started");
        });
        const io = require("socket.io")(httpsServer);
        io.on("connection", (socket) => {
            socket.on("notifySubscription", data => {
                let dbFile = require("/home/azureuser/intmanager/data/notifications.json");
                dbFile.subscriptions.push(data);
                fs.writeFile("/home/azureuser/intmanager/data/notifications.json", JSON.stringify(dbFile), () => { });
            });
            socket.on("callNotifySubscription-int", data => {
                let dbFile = require("/home/azureuser/intmanager/data/callint.json");
                dbFile.subscriptions.push(data);
                fs.writeFile("/home/azureuser/intmanager/data/callint.json", JSON.stringify(dbFile), () => { });
            });
            socket.on("callNotifySubscription-CSH", data => {
                let dbFile = require("/home/azureuser/intmanager/data/callCSH.json");
                dbFile.subscriptions.push(data);
                fs.writeFile("/home/azureuser/intmanager/data/callCSH.json", JSON.stringify(dbFile), () => { });
            });
            socket.on("callNotifySubscription-mswgen", data => {
                let dbFile = require("/home/azureuser/intmanager/data/callmswgen.json");
                dbFile.subscriptions.push(data);
                fs.writeFile("/home/azureuser/intmanager/data/callmswgen.json", JSON.stringify(dbFile), () => { });
            });
            socket.on('newBug', data => {
                axios.get('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: data.token
                    }
                }).then(res => {
                    if (client.guilds.cache.get(ops.guildId).members.cache.has(res.data.id)) {
                        let bugFile = require('/home/azureuser/intmanager/data/bugs.json');
                        bugFile.bugs.push({
                            id: `${res.data.id}-${Math.floor(Math.random() * 1000000)}`,
                            author: res.data.id,
                            title: data.title,
                            comments: [
                                {
                                    isAdmin: false,
                                    by: `${res.data.username}#${res.data.discriminator}`,
                                    text: data.text
                                }
                            ]
                        });
                        fs.writeFile('/home/azureuser/intmanager/data/bugs.json', JSON.stringify(bugFile), () => { });
                        socket.emit('newBugSubmitted');
                        client.channels.cache.get(ops.confRoomChannel).send(`<@&${ops.adminRole}>`, new Discord.MessageEmbed()
                            .setTitle('새 버그')
                            .setColor('RANDOM')
                            .addField('버그 제목', data.title)
                            .addField('버그 내용', data.text.length > 1024 ? `${data.text.substr(0, 1021)}...` : data.text)
                            .setFooter(client.users.cache.get(res.data.id).tag, client.users.cache.get(res.data.id).displayAvatarURL())
                            .setTimestamp()
                        );
                    } else {
                        socket.emit('newBugError', '먼저 서버에 들어가주세요.')
                    }
                }).catch(() => {
                    socket.emit('newBugError', '토큰이 올바르지 않아요')
                })
            })
            socket.on('bugComment', data => {
                axios.get('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: data.token
                    }
                }).then(res => {
                    if (client.guilds.cache.get(ops.guildId).members.cache.has(res.data.id)) {
                        let bugFile = require('/home/azureuser/intmanager/data/bugs.json');
                        if (res.data.id == bugFile.bugs.find(x => x.id == data.id).author || client.guilds.cache.get(ops.guildId).members.cache.get(res.data.id).roles.cache.has(ops.adminRole)) {
                            bugFile.bugs.find(x => x.id == data.id).comments.push({
                                by: `${res.data.username.replace(/</gi, '&lt;').replace(/>/gi, '&gt;')}#${res.data.discriminator.replace(/</gi, '&lt;').replace(/>/gi, '&gt;')}`,
                                isAdmin: client.guilds.cache.get(ops.guildId).members.cache.get(res.data.id).roles.cache.has(ops.adminRole),
                                text: data.text.replace(/</gi, '&lt;').replace(/>/gi, '&gt;')
                            });
                            fs.writeFile('/home/azureuser/intmanager/data/bugs.json', JSON.stringify(bugFile), () => { });
                            socket.emit('bugCommented');
                            if (!client.guilds.cache.get(ops.guildId).members.cache.get(res.data.id).roles.cache.has(ops.adminRole)) {
                                client.channels.cache.get(ops.confRoomChannel).send(`<@&${ops.adminRole}>`, new Discord.MessageEmbed()
                                    .setTitle('새 버그 메세지')
                                    .setColor('RANDOM')
                                    .addField('버그 제목', bugFile.bugs.find(x => x.id == data.id).title)
                                    .addField('메세지 내용', data.text.length > 1024 ? `${data.text.substr(0, 1021)}...` : data.text)
                                    .setFooter(client.users.cache.get(res.data.id).tag, client.users.cache.get(res.data.id).displayAvatarURL())
                                    .setTimestamp()
                                );
                            } else {
                                client.users.cache.get(bugFile.bugs.find(x => x.id == data.id).author).send(new Discord.MessageEmbed()
                                    .setTitle('새 버그 메세지')
                                    .setColor('RANDOM')
                                    .addField('버그 제목', bugFile.bugs.find(x => x.id == data.id).title)
                                    .addField('메세지 내용', data.text.length > 1024 ? `${data.text.substr(0, 1021)}...` : data.text)
                                    .setFooter('관리자의 메세지에요')
                                    .setTimestamp()
                                );
                            }
                        } else {
                            socket.emit('bugCommentError', '버그 제보자와 관리자만 메세지를 쓸 수 있어요.')
                        }
                    } else {
                        socket.emit('bugCommentError', '먼저 서버에 들어가주세요.')
                    }
                }).catch(e => {
                    console.log(e);
                    socket.emit('bugCommentError', '토큰이 올바르지 않아요')
                })
            })
        });
    }
};
