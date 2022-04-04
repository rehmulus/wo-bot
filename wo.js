const { Discord, Client, Intents  } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

const { createImage, deleteFile } = require('./create-image');

client.once('ready', () => {
	console.log('Ready!');
});
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'wo') {
        const text = interaction.options.getString('text');
        const memeFile = await createImage(text);
        await interaction.reply({files: [memeFile]});
        deleteFile(memeFile);
	}
});

client.on('messageCreate', async message => {
    const nachricht = message.cleanContent;
    const nachrichtUpperCase = message.content.toUpperCase();
    if(!nachrichtUpperCase.startsWith('WO ')){
        return;
    }
    const subjekt = nachricht.slice(3);
    
    const memeFile = await createImage(subjekt);

    await message.channel.send({
        files: [memeFile]
    })
    deleteFile(memeFile);
});

client.login(token);


const express = require('express')
const app = express()
const port = process.env.PORT || 5000

app.get('/start', (req, res) => {
    client.login(token);
    res.send('Bot started')
})

app.listen(port, () => {
    console.log(`Bot app listening on port ${port}`)
})