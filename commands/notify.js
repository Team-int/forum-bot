const webpush = require('web-push');
module.exports = {
    name: 'notify',
    aliases: ['알림', '푸시', '푸시알림', 'push', 'dkffla', 'vntl', 'vntldkffla', 'ㅔㅕ노', 'ㅜㅐ샤료', 'notification', 'ㅜㅐ샤럋ㅁ샤ㅐㅜ'],
    description: '푸시 알림을 보내요. (실험 기능, 봇 개발자만 가능)',
    usage: 'i.notify',
    run: async (client, message, args, ops) => {
        if (!ops.devs.includes(message.author.id)) return message.channel.send(`${client.user.username} 개발자만 사용할 수 있어요.`)
        webpush.setGCMAPIKey(process.env.GCM_API_KEY);
        webpush.setVapidDetails('notificatino subject', 'BI600VywPkLZAS9ULBbIO35OiwO8ZVYmDDwajL2_MrypJFoEZrMeeGPFZZevWGfn0wZEzcM4Y3V76lN30daPJTY', process.env.VAPID_PRIVATE_KEY);
        let sub = require('/home/data/notifications.json').subscriptions;
        sub.forEach(s => {
            webpush.sendNotification(s, 'payload text');
        });
    }
}