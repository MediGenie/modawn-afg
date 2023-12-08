const { json } = require("express");
const {OpenAI} = require("openai");
const socket = require('./config/socket');

async function getAiResponse(chatBot, chat, chatRequest) {
    // Initialize OpenAI API with API key
    try {
        const io = socket.getIO();

        const openai = new OpenAI({
            apiKey:  process.env.CHAT_API_KEY,
          });
    

    // System prompt build-up
    const systemPromptParts = [
        chatBot.systemprompt ? `You must answer ONLY based on the information provided. Do not make things up or use your general knowledge.${chatBot.systemprompt}` : '',
    ];

    const systemPrompt = systemPromptParts.filter(part => part.length > 0).join(' ');
    let transformedRequest;
    transformedRequest = {
        "role": "user",
        "content": chatRequest // Directly assign the string here
    };

    // Check the number of messages and slice if there are at least three
    let messages;
    if (chat.messages && chat.messages.length >= 3) {
        const lastTwoMessages = chat.messages.slice(-2); // Gets the last two elements of the array
        messages = [{ role: 'system', content: systemPrompt }, ...lastTwoMessages, transformedRequest];
    } else {
        messages = [{ role: 'system', content: systemPrompt }, ...chat.messages, transformedRequest];
    }

    const stream = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: messages,
        stream: true,
    });

    let content = "";
    let role = ""
    for await (const chunk of stream) {
        let chunkContent = chunk.choices[0]?.delta?.content || ""
        io.emit(`stream chunk`, { chunk: chunkContent});
        role += chunk.choices[0]?.delta?.role || ""
        content += chunkContent;
    }

    let aiResponse = {
        role,
        content
    }
    console.log('=====>aiResponse', aiResponse);
    return aiResponse;
} catch (error) {
console.log('=====>error in catch', error);
}


}

module.exports = {
getAiResponse,
}