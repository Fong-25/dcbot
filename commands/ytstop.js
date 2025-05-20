const { SlashCommandBuilder } = require('discord.js');
const ytPlaylist = require('./ytplaylist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytstop')
        .setDescription('🛑 Stop playback and leave the voice channel'),

    async execute(interaction) {
        const session = ytPlaylist.activeSessions.get(interaction.guildId);
        if (!session) {
            return interaction.reply('⚠️ No playlist is playing.');
        }

        session.player.stop();
        session.connection.destroy();
        ytPlaylist.activeSessions.delete(interaction.guildId);

        await interaction.reply('👋 Stopped playback and left the voice channel.');
    }
};