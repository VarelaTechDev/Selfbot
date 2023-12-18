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

// Function to split and send long messages
async function sendLongMessage(channel, longMessage, charLimit = 1500) {
    for (let i = 0; i < longMessage.length; i += charLimit) {
        const messageChunk = longMessage.substring(i, Math.min(longMessage.length, i + charLimit));
        await channel.send(messageChunk);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
}

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
         // Handle normal messages
        const aiResponse = await ask(messageContent, userName, message.author.id);
        
        // Check if response is longer than the limit and handle accordingly
        if (aiResponse.length > 1500) {
            await sendLongMessage(message.channel, aiResponse);
        } else {
            message.channel.send(aiResponse);
        }
    }
});




client.login(process.env.DISCORD_TOKEN);
