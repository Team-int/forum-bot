export default function memberChanges(o, n) {
  let arr = []
  if (o.displayHexColor != n.displayHexColor)
    arr.push({
      name: '디스플레이 색',
      value: `${o.displayHexColor} -> ${n.displayHexColor}`
    })
  if (o.displayName != n.displayName)
    arr.push({
      name: '디스플레이 이름',
      value: `${o.displayName} -> ${n.displayName}`
    })
  if (o.nickname != n.nickname)
    arr.push({
      name: '서버 내 별명',
      value: `${o.nickname || '없음'} -> ${n.nickname || '없음'}`
    })
  if (o.premiumSince != n.premiumSince)
    arr.push({
      name: '서버 부스트 여부',
      value: `${o.premiumSince ? '✅' : '❌'} -> ${n.premiumSince ? '✅' : '❌'}`
    })
  if (o.roles.cache.array() != n.roles.cache.array()) {
    let arr2 = []
    for (let i of o.roles.cache.array()) {
      if (!n.roles.cache.get(i.id)) arr2.push(`${i}: ✅ -> ❌`)
    }
    for (let i of n.roles.cache.array()) {
      if (!o.roles.cache.get(i.id)) arr2.push(`${i}: ❌ -> ✅`)
    }
    arr.push({
      name: '역할',
      value: arr2.join('\n') || '변경되지 않음'
    })
  }
  if (o.voice != n.voice)
    arr.push({
      name: '음성 상태',
      value: `변경됨`
    })
  return arr
}