const { SlashCommandBuilder } = require('discord.js');
const { DateTime } = require("luxon");


module.exports = {
    cooldowns: 30,
    data: new SlashCommandBuilder()
        .setName('hoahoc')
        .setDescription('Đếm ngược đến giờ thi môn Hóa Học THPTQG 2025'),

    async execute(interaction) {
        const now = DateTime.now().setZone('Asia/Bangkok'); // GMT+7
        const target = DateTime.fromObject(
            { year: now.year, month: 6, day: 27, hour: 8, minute: 30 },
            { zone: 'Asia/Bangkok' }
        );

        if (now > target) {
            await interaction.reply('⏰ Bro muộn giờ thi rồi!!!');
            return;
        }
        const diff = target.diff(now, ['days', 'hours', 'minutes']).toObject();

        const msg = `🧘 Thời gian còn lại đến khi thi môn Hóa Học:\n` +
            `**${Math.floor(diff.days)}** ngày, ` +
            `**${Math.floor(diff.hours)}** giờ, ` +
            `**${Math.floor(diff.minutes)}** phút`;

        await interaction.reply(msg);
    }
}