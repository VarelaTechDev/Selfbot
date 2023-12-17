require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const client = new Client({
    checkUpdate: false
});

client.on('ready', async() => {
    console.log(`Client is ready`);
});



client.on('messageCreate', message => {
    // Check if the bot is mentioned and the message is not from a bot
    if (message.mentions.has(client.user) && !message.author.bot) {
        // Extract text after the mention
        const messageContent = message.content.split(' ').slice(1).join(' ');

        // Respond with the extracted message
        message.channel.send(`You said: ${messageContent}`);
    }
});


client.login(process.env.DISCORD_TOKEN);
