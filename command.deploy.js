require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('node:fs')
const path = require('node:path')

const commands = []
const commandsPath = path.join(__dirname, 'commands')
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandsFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
}

const rest = new REST().setToken(process.env.D_TOKEN);



(async () => {
    try {
        console.log('Started refreshing application commands.')
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Slash commands registered globally.');
    } catch (error) {
        console.error(error);
    }
})();