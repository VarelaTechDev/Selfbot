require('dotenv').config()
const OpenAI = require('openai').OpenAI
const openai = new OpenAI()


async function main(){
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'Guide the chat bot'
            },
            {
                role: 'user',
                content: 'Hello! What is your name'
            }
        ],
        max_tokens: 500,
    })

    console.log(response.choices[0].message.content)
}

main()