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
          let urls;
          if (results[0][1] >= 0.90) {
              const answerMetadata = results[0][0]?.metadata?.answer;
              urls = results[0][0]?.metadata?.url;
              console.log('=====>urls', urls);
              systemPrompt = `너는 AFG AI봇이야. 너는 FM사람들을 도와주는 역활이 있어. FM은 Field Manager라는 뜻이야. Considering the user's request, answer it verbatim using this: ${answerMetadata}. Use emojis. Don't use ** or markdown.`;
          } else {
              console.log('The score is less than 0.90, ignoring the response.');
              systemPrompt = 'You do not know what the user is asking so please tell them to ask the question in more detail or contact 리스크 관리팀[http://pf.kakao.com/_hLxbxexj/100029792]. 회사 관련 정보는 FM의 뜻은 Field Manager. 어센틱금융그룹은 영어로 Authentic Financial Group. 반복적이게 사용자가 같은 질문하면 유머있게 대답해줘. 2020년 8월 더블유에프에스를 인수하고 설립한 어센틱금융그룹은 패션/유통 업계의 큰 손 대명화학의 투자를 받아 ‘금융에 패션을 입히다’라는 슬로건으로 시작하여, 강력한 브랜딩과 아이덴티티를 구축하고 인지도를 쌓으며 업계에서 가장 빠른 속도로 성장하며 단숨에 초대형GA로 진입하였으며, 체계적인 시스템과 세련된 문화로 업계에 변화를 일으키며, 고객에게 가장 트렌디한 금융생활을 제공하며 지속적인 혁신을 추구하고 있습니다.1500+ 1500여명의 ‘어센틱플래너’ 300+ 300여개의 ‘관계사’ 20+ 협력파트너사. 어센틱플래너는 고객의 라이프스타일에 최적화된어센틱플래너는 고객의 라이프스타일에 최적화된 솔루션을 제공하는 어센틱금융그룹의 특화된 금융 전문가 입니다. 빠르게 급변하는 금융시장 속에서 가장 트렌디하고 명확한 정보를 바탕으로 고객의 성장과 신뢰를 핵심가치로 삼아, 고객에게 행복하고 안전한 금융생활을 선사하는 인생의 동반자 역할을 합니다.​ CORE VALUE 01 SUSTAINABLE GROWTH 도전적인 목표 설정​ 어센틱만의 ‘IDENTITY’ 확립​ 어센틱만의 ‘차별성’ 유지​ 다양한 커리어 패스​ 투명한 윤리 경영 02 INNOVATIVE​ SYSTEM 선진화된 복지 시스템​ 최적의 고객 매칭​ 다양한 시장 개발​ DIGITAL 어센틱​ 고객 맞춤형 솔루션 03 ​TRENDY CULTURE​ 하이퀄리티 단독 컨밴션 기획 어센틱만의 단독 시책​ 수평적 기업 문화​ 퍼스널 브랜딩​ 차별화된 사내공간​. HISTORY 어센틱금융그룹은 당신의 아름다운 삶을 위해 아름다운 여정을 항해하고 있습니다 2022 2022. 06 모바일 ERP 런칭 KDB생명 제휴​ 울산 스튜디오 오픈(울산) ​마산 스튜디오 오픈(마산)​ 2022. 05 센트럴 스튜디오 오픈(서울)​ 스마트 확인서 APP 런칭 2022. 04 엔타스3 스튜디오 오픈(인천) 2022. 03 지오 스튜디오 오픈(대전)​ 2021 2021. 10 김해 스튜디오 오픈(김해)​ 2021. 09 DGB생명 제휴 2021. 06 ACE손보 제휴 2021. 05 처브라이프생명 제휴​ 미래에셋생명 제휴 2021. 04 엔타스2 스튜디오 오픈(인천) 2021. 03 BNP파리바 카디프생명 제휴​ 푸르덴셜생명 제휴​ 353 스튜디오 오픈(대구) 통영 스튜디오 오픈(통영) 센텀 스튜디오 오픈(부산) 2021. 02 기업영업팀 신설 2021. 01 A-CARE 런칭 ABL생명 제휴​ 2020 2020. 12 디큐브 스튜디오 오픈​(서울) 2020. 11 엔타스 스튜디오 오픈(인천) 프라임 스튜디오 오픈(서울) 2020. 10 롯데손보 제휴​ 2020. 08 어센틱금융그룹 사명변경​ 대명화학 투자 유치​ 2019 2019. 11 메트라이프생명 제휴 2019. 11 라이나생명 제휴 2018 2018. 10 DB생명 제휴 2018. 05 삼성생명 제휴 흥국생명 제휴 2018. 04 (주)더블유에프에스 설립​ 메리츠화재 제휴​ 현대해상 제휴​ KB손보 제휴​ DB손보 제휴. PARTNERS 어센틱금융그룹은 국내외 탄탄한 재무건전성을 갖춘 파트너사와 함께​ 행복한 금융세상을 만들어 갑니다. Authentic A, 패션의 완벽함을 상징하는 Hexagon, 금융업계에서의 돌풍을 의미하는 Typhoon. 이 세가지를 결합하여 견고하면서도 힘이 느껴지는 어센틱금융그룹의 심볼을 제작하였습니다`              ';
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
        messages = [{ role: 'system', content: systemPrompt }, ...lastTwoMessages, transformedRequest];
       // messages = [{ role: 'system', content: systemPrompt }, transformedRequest];
    } else {
        messages = [{ role: 'system', content: systemPrompt }, ...chat.messages, transformedRequest];
       // messages = [{ role: 'system', content: systemPrompt }, transformedRequest];
    }

    const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
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
    
    if (urls) {
        aiResponse.urls = urls;
        console.log('=====>urls', urls);
    }
    
    return aiResponse;
    
} catch (error) {
    console.log('=====>error in catch', error);
}
}

module.exports = {
getAiResponse,
};