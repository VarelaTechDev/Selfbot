require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const {ask, respondPissy} = require('./ai.js'); // Import the ask function

const client = new Client({
    checkUpdate: false
});

client.on('ready', async() => {
    console.log(`Client is ready`);
    // client.user.setStatus('invisible')
});

client.on('messageCreate', async message => {
    if (message.mentions.has(client.user) && !message.author.bot) {
        const messageContent = message.content.split(' ').slice(1).join(' ');
        const userName = message.author.username; // Extract the user's Discord name

        if (messageContent.trim().length === 0) {
            const response = await respondPissy();
            message.channel.send(response);
        } else {
            const aiResponse = await ask(messageContent, userName); // Pass the user's name
            message.channel.send(aiResponse);
        }
    }
});



client.login(process.env.DISCORD_TOKEN);
