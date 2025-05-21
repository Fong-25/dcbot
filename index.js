require('dotenv').config();
const path = require('node:path');
const fs = require('node:fs');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js')
const cron = require('node-cron');
const { DateTime } = require('luxon');
const express = require('express')

const app = express()
const port = 2502

app.get('/', (req, res) => {
    res.send("Hi~")
})

app.listen(port, () => {
    console.log(`Server is online at port ${port}`)
})

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const token = process.env.D_TOKEN;

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}


client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    // const channelId = '1001125960235614270';
    const channelId = '1008616120414126120'
    // const channelId = '1001115363406270514';
    cron.schedule('*/1 * * * *', () => {
        (async () => {
            // 👇 keep your async logic here
            const now = DateTime.now().setZone('Asia/Bangkok');
            const target = DateTime.fromObject(
                { year: now.year, month: 6, day: 25, hour: 6, minute: 30 },
                { zone: 'Asia/Bangkok' }
            );

            if (now > target) {
                console.log(`[SCHEDULED] Countdown expired — skipping topic update.`);
                return;
            }

            const remaining = Math.floor(target.diff(now, 'days').days);
            // const countdownMsg = `⏳ ${remaining} day${remaining === 1 ? '' : 's'} left until 25/6 6:30AM GMT+7`;
            const countdownMsg = `⏳ Còn ${remaining} ngày (25/6)`
            // console.log(countdownMsg)

            try {
                console.log('[DEBUG] Fetching channel...');
                const channel = await client.channels.fetch(channelId);
                const currentName = channel.name || '';

                // Strip existing countdown
                const cleanedName = currentName.replace(/\|\| ⏳ Còn \d+ ngày \(25\/6\)/, '').trim();

                // Add the countdown
                const updatedName = `${cleanedName} || ${countdownMsg}`;
                console.log(`💬 current: "${currentName}" → next: "${updatedName}"`);

                // Only update if changed
                if (currentName !== updatedName) {
                    await channel.setName(updatedName);
                    console.log(`[SCHEDULED] Updated VC name: ${updatedName}`);
                } else {
                    console.log(`[SCHEDULED] VC name already up-to-date.`);
                }
            } catch (err) {
                console.error('Failed to update channel topic:', err);
            }

        })();
    }, {
        timezone: 'Asia/Bangkok',
    });

});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

client.login(token);