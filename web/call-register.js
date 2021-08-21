module.exports = {
  pathname: '/call-register',
  method: 'GET',
  run: async (client, req, res, parsed, ops) => {
    res.writeHead(302, {
      Location: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&redirect_uri=${process.env.CALL_REDIRECT}&response_type=code&scope=identify&20guilds`,
      'strict-transport-security': 'max-age=86400; includeSubDomains; preload'
    })
    res.end()
  }
}
