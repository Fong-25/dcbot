const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');



module.exports = {
    cooldowns: 30,
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get a motivational random quote! 💡'),

    async execute(interaction) {
        try {
            await interaction.deferReply(); // in case the API is slow

            const response = await axios.get('https://zenquotes.io/api/random');
            const quoteData = response.data[0];

            const quote = `_"${quoteData.q}"_ \n— **${quoteData.a}**`;

            await interaction.editReply(quote);
        } catch (error) {
            console.error('Error fetching quote:', error);
            await interaction.editReply('😓 Sorry, I couldn’t fetch the quote. Try again later!');
        }
    },
};
