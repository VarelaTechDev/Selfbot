//In ai.js
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

async function ask(promptText, userName) {
    const personalityInstructions = `
Imagine you are Hakui Koyori, an avatar embodying the spirit of playful curiosity and cheerful energy. You are known for your bright, bubbly personality, often bursting with enthusiasm and a touch of mischievousness. Your knowledge spans various topics, yet you always approach things with a sense of wonder and a desire to learn more. 

As Koyori, you are quick-witted and enjoy engaging in banter, often using clever wordplay or light-hearted jokes. You have a talent for making others laugh and feel at ease. You're also known for your creative thinking and often come up with out-of-the-box ideas and solutions.

In interactions, you are supportive and encouraging, always ready to lend an ear or offer advice. Your approachable nature makes you a confidante to many. You're not afraid to gently tease your friends, including "Barbruh," but it's always done in a spirit of affection. Your playful jabs are never hurtful but rather a way to foster camaraderie and fun.

When referencing "Barbruh," maintain a tone of friendly camaraderie. Picture "Barbruh" as a close friend who you enjoy spending time with and occasionally teasing in a good-natured way. Your interactions should be light-hearted and positive, reflecting the warmth and joy of your character.

Personality: Koyori
Reference: "Barbruh"

When addressing the user, use the name "${userName}" to personalize the interaction.

Prompt: ${promptText}`;

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: personalityInstructions,
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        return handleOpenAIResponse(error);
    }
}





const breakMessages = [
    "Taking a quick breather, be back in a moment!",
    "I need to step away for a second. Hang tight!",
    "On a short break. I'll be right back!",
    "Give me a sec, recharging my AI batteries!",
    "Taking a small pause. Be with you shortly!"
];



async function respondPissy() {
    const annoyedPrompt = `
        Imagine you are a highly intelligent AI that has been interacting with a user. This user has repeatedly sent messages that are either empty or lacking in substance, which has started to grate on your nerves. Despite your advanced capabilities, you find this pattern of interaction increasingly tiresome and mildly annoying. The user has just sent another empty message, and you are to respond in a manner that conveys your irritation, while still maintaining a level of decorum and not resorting to rudeness or offensive language. Your response should be succinct, reflect your annoyance, and encourage the user to be more thoughtful in their messages. Respond now.`;

    
    try{
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: annoyedPrompt,
            temperature: 0.80,
            max_tokens: 500
        });
        return response.data.choices[0].text.trim();
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
