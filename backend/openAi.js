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

          function filterString(inputString) {
            return inputString.replace(/ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ|ㅈ|ㅊ|ㅋ|ㅌ|ㅍ|ㅎ|ㄲ|ㄸ|ㅃ|ㅉ|ㅏ|ㅑ|ㅓ|ㅕ|ㅗ|ㅛ|ㅜ|ㅠ|ㅡ|ㅣ|ㅐ|ㅒ|ㅔ|ㅖ|ㅘ|ㅙ|ㅚ|ㅝ|ㅞ|ㅟ|ㅢ|haha/g, '');
        }

        let chatRequests = filterString(chatRequest);

        console.log('Pinecone query:', chatRequests);
          
          const results = await vectorStore.similaritySearchWithScore(chatRequests, 3);
          console.log('Pinecone query results:', results);
          
          let systemPrompt; // Declare systemPrompt here
          
          if (results[0][1] >= 0.90) {
              const answerMetadata = results[0][0]?.metadata?.answer;
              systemPrompt = `너는 AFG AI봇이야. 너는 FM사람들을 도와주는 역활이 있어. Use this as context: ${answerMetadata}. 회사 소개, AFG 소개, 어센틱금융그룹 소개, Authentic Financial Group 소개. 어센틱금융그룹은 2020년 8월 더블유에프에스(WFS) 인수를 통해 설립되었습니다. 패션 및 유통 업계의 주요 기업인 대명화학의 투자를 받아, "금융에 패션을 입히다"라는 슬로건으로 시작했습니다. 강력한 브랜딩과 아이덴티티를 통해 빠른 속도로 성장, 초대형GA로 자리매김했습니다. 체계적인 시스템과 세련된 문화로 금융 업계에 변화를 주도하고 있으며, 지속적인 혁신을 추구합니다. 구성원 및 네트워크: 1500여 명의 '어센틱플래너'와 300여 개의 관계사, 20여 개의 협력 파트너사를 보유하고 있습니다. 어센틱플래너는 고객의 라이프스타일에 최적화된 솔루션을 제공하는 전문가입니다. 핵심 가치: Sustainable Growth: 도전적인 목표 설정, 어센틱만의 아이덴티티 확립, 차별성 유지, 다양한 커리어 패스, 투명한 윤리 경영. Innovative System: 선진화된 복지 시스템, 최적의 고객 매칭, 다양한 시장 개발, 디지털 어센틱, 고객 맞춤형 솔루션. Trendy Culture: 고품질 컨벤션 기획, 어센틱만의 단독 시책, 수평적 기업 문화, 퍼스널 브랜딩, 차별화된 사내 공간. 역사 및 발전: 2020년 대명화학 투자 유치 후, 2022년까지 다양한 스튜디오 개소, 여러 생명보험사와의 제휴를 이루었습니다. 모바일 ERP 런칭, 스마트 확인서 APP 런칭 등 디지털 혁신을 이루었습니다. 파트너십: 국내외 재무건전성이 탄탄한 파트너사와 함께 협력하여 행복한 금융세상을 만들어 나가고 있습니다. 어센틱금융그룹은 지속 가능한 성장, 혁신적인 시스템, 트렌디한 문화를 통해 고객의 금융생활에 새로운 가치를 제공하며, 금융 업계에서의 변화와 혁신을 주도하고 있습니다 Use emojis. Don't use ** or markdown.`;
          } else {
              console.log('The score is less than 0.95, ignoring the response.');
              systemPrompt = '이질문을 모르면 꼭 모른다고해!너는 AFG AI봇이야. 간략하게 답변해줘. 너는 FM사람들을 도와주는 역활이 있어. 회사 소개, AFG 소개, 어센틱금융그룹 소개, Authentic Financial Group 소개. 어센틱금융그룹은 2020년 8월 더블유에프에스(WFS) 인수를 통해 설립되었습니다. 패션 및 유통 업계의 주요 기업인 대명화학의 투자를 받아, "금융에 패션을 입히다"라는 슬로건으로 시작했습니다. 강력한 브랜딩과 아이덴티티를 통해 빠른 속도로 성장, 초대형GA로 자리매김했습니다. 체계적인 시스템과 세련된 문화로 금융 업계에 변화를 주도하고 있으며, 지속적인 혁신을 추구합니다. 구성원 및 네트워크: 1500여 명의 어센틱플래너 와 300여 개의 관계사, 20여 개의 협력 파트너사를 보유하고 있습니다. 어센틱플래너는 고객의 라이프스타일에 최적화된 솔루션을 제공하는 전문가입니다. 핵심 가치: Sustainable Growth: 도전적인 목표 설정, 어센틱만의 아이덴티티 확립, 차별성 유지, 다양한 커리어 패스, 투명한 윤리 경영. Innovative System: 선진화된 복지 시스템, 최적의 고객 매칭, 다양한 시장 개발, 디지털 어센틱, 고객 맞춤형 솔루션. Trendy Culture: 고품질 컨벤션 기획, 어센틱만의 단독 시책, 수평적 기업 문화, 퍼스널 브랜딩, 차별화된 사내 공간. 역사 및 발전: 2020년 대명화학 투자 유치 후, 2022년까지 다양한 스튜디오 개소, 여러 생명보험사와의 제휴를 이루었습니다. 모바일 ERP 런칭, 스마트 확인서 APP 런칭 등 디지털 혁신을 이루었습니다. 파트너십: 국내외 재무건전성이 탄탄한 파트너사와 함께 협력하여 행복한 금융세상을 만들어 나가고 있습니다. 어센틱금융그룹은 지속 가능한 성장, 혁신적인 시스템, 트렌디한 문화를 통해 고객의 금융생활에 새로운 가치를 제공하며, 금융 업계에서의 변화와 혁신을 주도하고 있습니다 Say to the user that you do not know about this information and that he should ask more specifically.';
          }
        
    let transformedRequest;
    transformedRequest = {
        "role": "user",
        "content": chatRequests // Directly assign the string here
    };

    // Check the number of messages and slice if there are at least three
    let messages;
    if (chat.messages && chat.messages.length >= 3) {
        const lastTwoMessages = chat.messages.slice(-2); // Gets the last two elements of the array
        messages = [{ role: 'system', content: systemPrompt }, transformedRequest];
    } else {
        messages = [{ role: 'system', content: systemPrompt }, transformedRequest];
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
    return aiResponse;
} catch (error) {
    console.log('=====>error in catch', error);
}
}

module.exports = {
getAiResponse,
};