export default function roleChanges(o, n) {
  let arr = []
  if (o.hexColor != n.hexColor)
    arr.push({
      name: '역할 색',
      value: `${o.hexColor} -> ${n.hexColor}`
    })
  if (o.hoist != n.hoist)
    arr.push({
      name: '역할 호이스팅 여부',
      value: `${o.hoist ? '✅' : '❌'} -> ${n.hoist ? '✅' : '❌'}`
    })
  if (o.mentionable != n.mentionable)
    arr.push({
      name: '역할 멘션 가능 여부',
      value: `${o.mentionable ? '✅' : '❌'} -> ${n.mentionable ? '✅' : '❌'}`
    })
  if (o.permissions.bitfield != n.permissions.bitfield) {
    let arr2 = []
    for (let i of o.permissions.toArray()) {
      if (!n.permissions.toArray().find((x) => x == i)) arr2.push(`${ops.rolePerms[i]}: ✅ -> ❌`)
    }
    for (let i of n.permissions.toArray()) {
      if (!o.permissions.toArray().find((x) => x == i)) arr2.push(`${ops.rolePerms[i]}: ❌ -> ✅`)
    }
    arr.push({
      name: '권한',
      value: arr2.join('\n') || '변경되지 않음'
    })
  }
  return arr
}