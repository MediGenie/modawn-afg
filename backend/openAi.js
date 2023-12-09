const { OpenAI } = require("openai");
const socket = require('./config/socket');
const { Pinecone } = require('@pinecone-database/pinecone');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const Document = require("langchain/document").Document;
const OpenAIEmbeddings = require("langchain/embeddings/openai").OpenAIEmbeddings;

// Initialize Pinecone
const pinecone = new Pinecone();
const pineconeIndex = pinecone.index('opl');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.CHAT_API_KEY,
});


async function getAiResponse(chatBot, chat, chatRequest, clientSocketId) { // Add clientSocketId as a parameter
    try {
        const io = socket.getIO();

        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings(),
            { pineconeIndex }
          );
        const results = await vectorStore.similaritySearchWithScore(chatRequest, 3);
        console.log('Pinecone query results:', results);
        let combinedContent = "";

        for (let i = 0; i < Math.min(results.length, 2); i++) {
            combinedContent += results[i][0].pageContent;
}

    // System prompt build-up
    const systemPromptParts = [
        chatBot.systemprompt ? `You must answer ONLY based on the information provided. Do not make things up or use your general knowledge. ONLY answer the relevant information based off of this information: ${combinedContent}` : '',
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
        temperature: 0,
        stream: true,
    });

    let content = "";
    let role = ""
    for await (const chunk of stream) {
        let chunkContent = chunk.choices[0]?.delta?.content || "";

        // Emit to a specific client using their socket ID
        io.to(clientSocketId).emit(`stream chunk`, { chunk: chunkContent }); 

        role += chunk.choices[0]?.delta?.role || "";
        content += chunkContent;
    }

    let aiResponse = {
        role,
        content
    };
    console.log('=====>aiResponse', aiResponse);
    return aiResponse;
} catch (error) {
    console.log('=====>error in catch', error);
}
}

module.exports = {
getAiResponse,
};