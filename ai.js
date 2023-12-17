require('dotenv').config();
const OpenAI = require('openai').OpenAI
const openai = new OpenAI()


const mysql = require('mysql2/promise');

// Setup MySQL Connection
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'discordBot',
    password: 'cats'
});

const breakMessages = [
    "Taking a quick breather, be back in a moment!",
    "I need to step away for a second. Hang tight!",
    "On a short break. I'll be right back!",
    "Give me a sec, recharging my AI batteries!",
    "Taking a small pause. Be with you shortly!"
];


// Function to get conversation history
async function getConversationHistory(userId) {
    const [rows] = await connection.query('SELECT message, sender FROM userConversations WHERE userId = ? ORDER BY timestamp ASC', [userId]);
    return rows;
}


async function addMessageToHistory(userId, message, sender) {
    // Map 'bot' to 'assistant' for compatibility with OpenAI's API
    const role = sender === 'bot' ? 'assistant' : sender;
    await connection.query('INSERT INTO userConversations (userId, message, sender) VALUES (?, ?, ?)', [userId, message, role]);
}


async function ask(promptText, userName, userId) {
    try {
        let conversationHistory = await getConversationHistory(userId);
        let messages = [];

        // Reconstruct conversation for OpenAI
        // ...

        // Reconstruct conversation for OpenAI
        conversationHistory.forEach(entry => {
            // Map 'bot' to 'assistant' for compatibility with OpenAI's API
            const role = entry.sender === 'bot' ? 'assistant' : entry.sender;
            messages.push({
                role: role,
                content: entry.message
            });
        });


        // Add the new user message
        messages.push({ role: 'user', content: promptText });

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 500,
        });

        // Add AI's response to history
        const aiResponse = response.choices[0].message.content;
        await addMessageToHistory(userId, aiResponse, 'bot');

        return aiResponse;
    } catch (error) {
        return handleOpenAIResponse(error);
    }
}



async function respondPissy() {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `Imagine you are a highly intelligent AI that has been interacting with a user. This user has repeatedly sent messages that are either empty or lacking in substance, which has started to grate on your nerves. Despite your advanced capabilities, you find this pattern of interaction increasingly tiresome and mildly annoying. The user has just sent another empty message, and you are to respond in a manner that conveys your irritation, while still maintaining a level of decorum and not resorting to rudeness or offensive language. Your response should be succinct, reflect your annoyance, and encourage the user to be more thoughtful in their messages. Respond now.`
                },
                {
                    role: 'user',
                    content: promptText
                }
            ],
            max_tokens: 500,
        });

        return response.choices[0].message.content;
    } catch (error) {
        return handleOpenAIResponse(error);
    }
}

function handleOpenAIResponse(error) {
    if (error.response && error.response.data.error.code === 'rate_limit_exceeded') {
        const randomMessage = breakMessages[Math.floor(Math.random() * breakMessages.length)];
        return randomMessage;
    }
    console.error("An error occurred: ", error);
    return "Sorry, I ran into an issue!";
}


module.exports = { ask, respondPissy };
