require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const {ask, respondPissy, flushHistory} = require('./ai.js'); // Import the ask function

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
        const userName = message.author.username;

        // Check for the flush command first
        if (messageContent.toLowerCase() === '!flush') {
            const response = await flushHistory(message.author.id);
            message.channel.send(response);
            return; // Return after handling the flush command
        }

        // Check if message content is empty and respond accordingly
        if (messageContent.trim().length === 0) {
            const response = await respondPissy(); // Make sure respondPissy can handle being called without arguments
            message.channel.send(response);
            return;
        }

        // Handle normal messages
        const aiResponse = await ask(messageContent, userName, message.author.id);
        message.channel.send(aiResponse);
    }
});




client.login(process.env.DISCORD_TOKEN);
