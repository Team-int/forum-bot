export default function channelChanges(o, n) {
  let arr = []
  if (o.name != n.name)
    arr.push({
      name: '채널 이름',
      value: `${o.name} -> ${n.name}`
    })
  if (o.position != n.position)
    arr.push({
      name: '채널 순서',
      value: `${o.position} -> ${n.position}`
    })
  if (o.parent != n.parent)
    arr.push({
      name: '채널 카테고리',
      value: `${o.parent ? `${o.parent.name}(${o.parent.id})` : '카테고리 없음'} -> ${
        n.parent ? `${n.parent.name}(${n.parent.id})` : '카테고리 없음'
      }`
    })
  if (o.topic != n.topic)
    arr.push({
      name: '채널 주제',
      value: `${o.topic || '없음'} -> ${n.topic || '없음'}`
    })
  if (o.nsfw != n.nsfw)
    arr.push({
      name: 'NSFW 여부',
      value: `${o.nsfw ? '✅' : '❌'} -> ${n.nsfw ? '✅' : '❌'}`
    })
  if (o.type != n.type)
    arr.push({
      name: '채널 타입',
      value: `${ops.channels[o.type]} -> ${ops.channels[n.type]}`
    })
  if (o.rateLimitPerUser != n.rateLimitPerUser)
    arr.push({
      name: '슬로우 모드',
      value: `${
        o.rateLimitPerUser != undefined
          ? o.ratelimitPerUser == 0
            ? '슬로우 모드 없음'
            : `${o.rateLimitPerUser}초`
          : '해당 없음'
      } -> ${
        n.rateLimitPerUser != undefined
          ? n.rateLimitPerUser == 0
            ? '슬로우 모두 없음'
            : `${n.rateLimitPerUser}초`
          : '해당 없음'
      }`
    })
  if (o.bitrate != n.bitrate)
    arr.push({
      name: '비트레이트',
      value: `${o.bitrate != undefined ? `${o.bitrate / 1000}kbps` : '없음'} -> ${
        n.bitrate != undefined ? `${n.bitrate / 1000}kbps` : '없음'
      }`
    })
  if (o.userLimit != n.userLimit)
    arr.push({
      name: '유저 수 제한',
      value: `${
        o.userLimit != undefined
          ? o.userLimit == 0
            ? '제한 없음'
            : `${o.userLimit}명`
          : '해당 없음'
      } -> ${
        n.userLimit != undefined
          ? n.userLimit == 0
            ? '제한 없음'
            : `${n.userLimit}명`
          : '해당 없음'
      }`
    })
  if (o.permissionOverwrites.array() != n.permissionOverwrites.array())
    arr.push({
      name: '채널 권한',
      value: '변경됨'
    })
  return arr
}
