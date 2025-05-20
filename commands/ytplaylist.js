const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');

const play = require('play-dl');
const activeSessions = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytplaylist')
        .setDescription('🎶 Play a looping YouTube playlist')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('YouTube playlist URL')
                .setRequired(true)),

    async execute(interaction) {
        const playlistUrl = interaction.options.getString('link');
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Join a voice channel first.', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const playlist = await play.playlist_info(playlistUrl, { incomplete: true });
            const videos = await playlist.all_videos();

            if (!videos.length) {
                return interaction.editReply('⚠️ Playlist is empty or invalid.');
            }

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

            const player = createAudioPlayer();
            connection.subscribe(player);

            activeSessions.set(interaction.guildId, { connection, player });

            let current = 0;

            const playNext = async () => {
                const video = videos[current];
                const stream = await play.stream(video.url);
                const resource = createAudioResource(stream.stream, { inputType: stream.type });

                player.play(resource);

                player.once(AudioPlayerStatus.Idle, () => {
                    current = (current + 1) % videos.length; // auto-loop
                    playNext();
                });
            };

            await interaction.editReply(`▶️ Now looping **${videos.length}** songs from playlist.`);
            playNext();

        } catch (err) {
            console.error(err);
            return interaction.editReply('❌ Failed to play playlist.');
        }
    },
    activeSessions // export for ytstop.js to access
}