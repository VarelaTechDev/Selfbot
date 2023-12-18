require('dotenv').config();
const OpenAI = require('openai').OpenAI
const openai = new OpenAI()

const getKoyoriPersonalityPrompt = require('./personality_prompt.js')

const mysql = require('mysql2/promise');

const MAX_TOKENS = 500
const HISTORY_LIMIT = 10; // Number of messages to consider from conversation history

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

async function flushHistory(userId) {
    try {
        await connection.query('DELETE FROM userConversations WHERE userId = ?', [userId]);
        console.log(`Flushed history for user: ${userId}`);
        return 'Your conversation history has been successfully deleted.';
    } catch (error) {
        console.error('Error flushing history:', error);
        return 'An error occurred while trying to delete your conversation history.';
    }
}



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
        // Check if the initial prompt has been sent
        const [initialCheck] = await connection.query('SELECT initialPromptSent FROM userInitialPrompt WHERE userId = ? LIMIT 1', [userId]);
        let initialPromptSent = initialCheck.length > 0 && initialCheck[0].initialPromptSent;

        // Retrieve the conversation history
        let conversationHistory = await getConversationHistory(userId);

        // Limit the conversation history to the last HISTORY_LIMIT messages
        // This ensures that the conversation context sent to OpenAI is recent and relevant
        // It could include any combination of user and bot messages, totaling up to HISTORY_LIMIT messages
        let limitedHistory = conversationHistory.slice(-HISTORY_LIMIT);

        let messages = [];

        // Reconstruct the limited conversation for OpenAI
        limitedHistory.forEach(entry => {
            const role = entry.sender === 'assistant' ? 'assistant' : 'user';
            messages.push({
                role: role,
                content: entry.message
            });
        });

        // Determine the current prompt
        let currentPrompt = !initialPromptSent ? getKoyoriPersonalityPrompt(userName, promptText) : promptText;

        // Add the user's current message to the messages array and to the history
        messages.push({ role: 'user', content: currentPrompt });
        await addMessageToHistory(userId, currentPrompt, 'user');

        const response = await openai.chat.completions.create({
            //model: 'gpt-3.5-turbo',
            model: "gpt-3.5-turbo-16k-0613",
            messages: messages,
            max_tokens: MAX_TOKENS,
        });

        // Add AI's response to history
        const aiResponse = response.choices[0].message.content;
        await addMessageToHistory(userId, aiResponse, 'assistant');

        // Update the initial prompt flag if needed
        if (!initialPromptSent) {
            await connection.query('INSERT INTO userInitialPrompt (userId, initialPromptSent) VALUES (?, TRUE) ON DUPLICATE KEY UPDATE initialPromptSent = TRUE', [userId]);
        }

        return aiResponse;
    } catch (error) {
        return handleOpenAIResponse(error);
    }
}






async function respondPissy() {
    try {
        const systemMessage = `Imagine you are a highly intelligent AI that has been interacting with a user. This user has repeatedly sent messages that are either empty or lacking in substance, which has started to grate on your nerves. Despite your advanced capabilities, you find this pattern of interaction increasingly tiresome and mildly annoying. The user has just sent another empty message, and you are to respond in a manner that conveys your irritation, while still maintaining a level of decorum and not resorting to rudeness or offensive language. Your response should be succinct, reflect your annoyance, and encourage the user to be more thoughtful in their messages. Respond now.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: systemMessage
                },
                {
                    role: 'user',
                    content: '...' // Placeholder for the user's empty message
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


module.exports = { ask, respondPissy, flushHistory };
