export default function guildChanges(o, n) {
  let arr = []
  if (o.banner != n.banner)
    arr.push({
      name: '서버 배너',
      value: `${o.bannerURL() || '없음'} -> ${n.bannerURL() || '없음'}`
    })
  if (o.defaultMessageNotifications != n.defaultMessageNotifications)
    arr.push({
      name: '알림 설정 기본값',
      value: `${ops.notifySettings[o.defaultMessageNotifications]} -> ${
        ops.notifySettings[n.defaultMessageNotifications]
      }`
    })
  if (o.description != n.description)
    arr.push({
      name: '서버 설명(디스커버리에 보여짐)',
      value: `${o.description || '없음'} -> ${n.description || '없음'}`
    })
  if (o.discoverySplash != n.discoverySplash)
    arr.push({
      name: '디스커버리 스플래시',
      value: `${o.discoverySplashURL() || '없음'} -> ${n.discoverySplashURL() || '없음'}`
    })
  if (o.emojis.cache.array() != n.emojis.cache.array())
    arr.push({
      name: '서버 이모지',
      value: '변경됨'
    })
  if (o.explicitContentFilter != n.explicitContentFilter)
    arr.push({
      name: '유해 미디어 콘텐츠 필터',
      value: `${ops.explicitFilterSettings[o.explicitContentFilter]} -> ${
        ops.explicitFilterSettings[n.explicitContentFilter]
      }`
    })
  if (o.icon != n.icon)
    arr.push({
      name: '서버 아이콘',
      value: `${o.iconURL() || '없음'} -> ${n.iconURL() || '없음'}`
    })
  if (o.mfaLevel != n.mfaLevel)
    arr.push({
      name: '서버 관리에 2FA 필요 여부',
      value: `${o.mfaLevel == 1 ? '✅' : '❌'} -> ${n.mfaLevel == 1 ? '✅' : '❌'}`
    })
  if (o.name != n.name)
    arr.push({
      name: '서버 이름',
      value: `${o.name} -> ${n.name}`
    })
  if (o.owner != n.owner)
    arr.push({
      name: '서버 주인',
      value: `${o.owner.user}(${o.owner.user.id}) -> ${n.owner.user}(${n.owner.user.id})`
    })
  if (o.partnered != n.partnered)
    arr.push({
      name: 'Discord Partner 서버 여부',
      value: `${o.partnered ? '✅' : '❌'} -> ${n.partnered ? '✅' : '❌'}`
    })
  if (o.preferredLocale != n.preferredLocale)
    arr.push({
      name: '서버 주요 사용 언어',
      value: `${o.preferredLocale} -> ${n.preferredLocale}`
    })
  if (o.premiumSubscriptionCount != n.premiumSubscriptionCount)
    arr.push({
      name: '서버 부스트 횟수',
      value: `${o.premiumSubscriptionCount}번 -> ${n.premiumSubscriptionCount}번`
    })
  if (o.premiumTier != n.premiumTier)
    arr.push({
      name: '서버 부스트 레벨',
      value: `레벨 ${o.premiumTier} -> 레벨 ${n.premiumTier}`
    })
  if (o.publicUpdatesChannel != n.publicUpdatesChannel)
    arr.push({
      name: '커뮤니티 업데이트 채널',
      value: `${
        o.publicUpdatesChannel ? `${o.publicUpdatesChannel}(${o.publicUpdatesChannel.id})` : `없음`
      } -> ${
        n.publicUpdatesChannel ? `${n.publicUpdatesChannel}(${n.publicUpdatesChannel.id})` : `없음`
      }`
    })
  if (o.region != n.region)
    arr.push({
      name: '음성 서버 위치',
      value: `${o.region} -> ${n.region}`
    })
  if (o.rulesChannel != n.rulesChannel)
    arr.push({
      name: '서버 규칙 채널',
      value: `${o.rulesChannel ? `${o.rulesChannel}(${o.rulesChannel.id})` : `없음`} -> ${
        n.rulesChannel ? `${n.rulesChannel}(${n.rulesChannel.id})` : `없음`
      }`
    })
  if (o.splash != n.splash)
    arr.push({
      name: '서버 초대 배경',
      value: `${o.splashURL() || '없음'} -> ${n.splashURL() || '없음'}`
    })
  if (o.systemChannel != n.systemChannel)
    arr.push({
      name: '시스템 메세지 채널',
      value: `${o.systemChannel ? `${o.systemChannel}(${o.systemChannel.id})` : `없음`} -> ${
        n.systemChannel ? `${n.systemChannel}(${n.systemChannel.id})` : `없음`
      }`
    })
  if (o.systemChannelFlags.bitfield != n.systemChannelFlags.bitfield) {
    let arr2 = []
    for (let i of n.systemChannelFlags.toArray()) {
      if (!o.systemChannelFlags.toArray().find((x) => x == i))
        arr2.push(`${ops.sysMsg[i]}: ✅ -> ❌`)
    }
    for (let i of o.systemChannelFlags.toArray()) {
      if (!n.systemChannelFlags.toArray().find((x) => x == i))
        arr2.push(`${ops.sysMsg[i]}: ❌ -> ✅`)
    }
    arr.push({
      name: '시스템 메세지 내용',
      value: arr2.join('\n') || '변경되지 않음'
    })
  }
  if (o.vanityURLCode != n.vanityURLCode)
    arr.push({
      name: '커스텀 초대 링크',
      value: `${o.vanityURLCode ? `https://discord.gg/${o.vanityURLCode}` : '없음'} -> ${
        n.vanityURLCode ? `https://discord.gg/${n.vanityURLCode}` : '없음'
      }`
    })
  if (o.verificationLevel != n.verificationLevel)
    arr.push({
      name: '서버 보안 수준',
      value: `${ops.verifyLevel[o.verificationLevel]} -> ${ops.verifyLevel[n.verificationLevel]}`
    })
  if (o.verified != n.verified)
    arr.push({
      name: '인증된 서버 여부',
      value: `${o.verified ? '✅' : '❌'} -> ${n.verified ? '✅' : '❌'}`
    })
  if (o.widgetChannel != n.widgetChannel)
    arr.push({
      name: '서버 위젯 채널',
      value: `${o.widgetChannel ? `${o.widgetChannel}(${o.widgetChannel.id})` : `없음`} -> ${
        n.widgetChannel ? `${n.widgetChannel}(${n.widgetChannel.id})` : `없음`
      }`
    })
  if (o.widgetEnabled != n.widgetEnabled)
    arr.push({
      name: '서버 위젯 사용 여부',
      value: `${o.widgetEnabled ? '✅' : '❌'} -> ${n.widgetEnabled ? '✅' : '❌'}`
    })
  console.log(arr)
  return arr
}