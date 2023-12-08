import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChatBot } from "../../store/chatbots";
import {
  receiveChatRequest,
  receiveChatResponse,
} from "../../store/chat";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import typingGif from "../../assets/typing-text.gif";
import {BiSolidSend} from 'react-icons/bi';
import {TbError404} from 'react-icons/tb';
import io from "socket.io-client";

const socket = io('https://afg.modawn.ai');

function ChatBotShow(){

  const dispatch = useDispatch();
  const customLoadingMessage = "AFG AI가 답변중입니다. 조금만 기다려주세요.";
  const user = useSelector((state) => state.session.user);
  const { chatBotId } = useParams();
  const bot = useSelector(state => state.entities.chatBots?.new ? state.entities.chatBots.new: null  )
  const sessionUser = useSelector(state => state.session?.user);
  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("");
  const [botLoaded, setBotLoaded] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(false); //shows message loading gif
  const [loadingChat, setLoadingChat] = useState(false); //disables chat until message finishes

  const chat = useSelector((state) =>
    Object.keys(state.entities.chats).length === 0
      ? {}
      : state.entities.chats.current
  );

  const chatEndRef = useRef(null);
    
  const scrollToBottomChat = ()=>{
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(()=>{
    dispatch(fetchChatBot(chatBotId)).then(()=> setBotLoaded(true));
  }, [dispatch, chatBotId])



  

  useEffect(() => {
    // Query all user message elements
    const userMessages = document.querySelectorAll('.user-message-selector');
    // Apply the new class to each user message element
    userMessages.forEach(el => {
      el.classList.add('user-show-message-detail');
    });
  }, []);

  useEffect(() => {
    scrollToBottomChat();
  }, [chat?.messages, loadingResponse, response]); // Assuming 'chat?.messages' holds the array of messages

  useEffect(() => {
    socket.on("stream chunk", (data) => {
      let { chunk } = data || {};
      setLoadingResponse(false);
      if (chunk) {
        setResponse((prev) => prev + chunk);
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socket.on("chat-updated", (data) => {
      setLoadingResponse(false);
      setResponse("");
      dispatch(receiveChatResponse(data));
    });

    return () => {
      socket.off("connect");
      socket.off("error");
      socket.off(`${sessionUser?.name}`);
      socket.disconnect();
    };
  }, [sessionUser?.name]);

useEffect(() => {
    scrollToBottomChat();
  }, [chat?.messages]); // Assuming 'chat?.messages' holds the array of messages

  useEffect(()=>{
    setTimeout(scrollToBottomChat, 500) //had to add a delay so typing gif has time to load before the scroll occurs
  }, [loadingChat])
  
  const handleChange = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
      // Scroll to bottom after a brief delay to ensure message is sent and rendered
      setTimeout(scrollToBottomChat, 100); // Adjust delay as needed
    } else {
      setRequest(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoadingChat(true);
  setRequest(""); // Clear the input field immediately
  setLoadingResponse(true);

  const formData = new FormData();
  if (request.trim()) {
    formData.append("text", request.trim());
  }

  try {
    const formDataString = JSON.stringify(
      Object.fromEntries(formData.entries())
    );
    setResponse("");
    dispatch(receiveChatRequest(request.trim()));
    // Emit the "start-chat-connection" event
    socket.emit("start-chat-processing", {
      chatId: chat._id,
      formData: formDataString,
      user,
    });
    setTimeout(scrollToBottomChat, 100);

    // Assuming socket.emit is asynchronous and you have a way to know when it's done, e.g., a callback or event listener
    socket.on("chat-updated", () => {
      setLoadingChat(false); // Set loading to false once the chat processing is complete
    });

  } catch (err) {
    console.error("###error", err);
    setLoadingChat(false); // Ensure loading is set to false even if there's an error
  }
};

  return(
    <>
      <div className="chatbot-show-container">
            
            <ul className="chatbot-show-details">
              <div className='chatbot-show-box'>
                <ul>
                    {bot?.name && <div>
                      <div className='chatbot-show-message-detail'> 
                        <img className='chatbot-show-img-small' src={bot?.profileImageUrl} alt={bot?.name} />
                        <h1>{bot?.name} </h1>
                      </div>
                      <h2>{bot.name}</h2>
                    </div>
                    }
                  {chat?.messages?.map((mess, i)=>{
                    
                    return (
                      <div key={i}>
                        {mess.role === 'assistant' 
                          ? <div className='chatbot-show-message-detail'> 
                              <img className='chatbot-show-img-small' src={bot?.profileImageUrl} alt={bot?.name} />
                              <h1>{bot?.name}</h1>
                            </div>
                          : <div className='chatbot-show-message-detail'> 
                              <img className='chatbot-show-img-small' src={sessionUser?.profileImageUrl} alt={sessionUser?.name} />
                              <h1>{sessionUser?.name}</h1>
                            </div>
                        }
                        {mess.content.split('\n').map((message, j) => {
                          return <h2 key={j}>{message}</h2>
                        })}
                  

                      </div>
                    );
                  })}
                  {response &&<div className="chatbot-show-response">
                     <div className='chatbot-show-message-detail'> 
                          <img className='chatbot-show-img-small' src={bot?.profileImageUrl} alt={bot?.name} />
                          <h1>{bot?.name} </h1>
                        </div>
                    { response && response.split('\n').map((message)=>{
                          return <h2>{message}</h2>
                        }) }
                        
                  </div>}
                  {loadingResponse ? <img className='typing' src={typingGif} alt='gif'/> : null}
                  <div className='ref-div' ref={chatEndRef} />
                </ul>
              </div>
            </ul>
      </div>
  

        <form className="show-chat-form" onSubmit={handleSubmit}>
        <div className="chatbot-show-message-form-container">
        <div className="input-with-image-preview">
         
        <input 
  type='text' 
  className="show-chat-form-input" 
  onChange={handleChange} 
  onKeyDown={handleChange}
  value={request} 
  placeholder={`무엇이든지 물어보세요. 친절하게 답해드릴게요!`}
  disabled={loadingChat} // Disable input field when loadingChat is true
/>
        </div>
        <button 
          type="submit"
          className="chat-form-button" 
          disabled={loadingChat || request.trim() === ''} 
        >
          <BiSolidSend />
        </button>
      </div>
        </form>
      
    </>
  )

}

export default ChatBotShow;