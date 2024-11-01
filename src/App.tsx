import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {MainContainer, ChatContainer, Message, MessageList, MessageInput, TypingIndicator, MessageModel, Avatar, ArrowButton } from '@chatscope/chat-ui-kit-react'
import ragService from './services/RAGService';
import julemusen from './assets/julemusen-icon.png'

function App() {

  const [typing, setTyping] = useState(false);

  const [messages, setMessages] = useState<MessageModel[]>([
    {
      message: "Hei! <br/>Jeg er Nissens lille hjelper. <br/>Gi meg noen hint, så kan jeg anbefale deg de beste gavetipsene fra Galleriet!",
      sender: "Julegutten",
      direction: "incoming",
      position: "normal"
    }
  ]);


  // Sick typing effect?
  const typeEffect = (text: string, sender: string) => {
    let i = 0;
    const speed = 10;
    const typedMessage: MessageModel = { message: "", sender, direction: "incoming", position: "normal" };

    setTyping(false);

    const typeInterval = setInterval(() => {
      if (i < text.length) {
        typedMessage.message += text.charAt(i);
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = typedMessage;
          return updatedMessages;
        });
        i++;
      } else {
        clearInterval(typeInterval);
        setTyping(false);
      }
    }, speed);
  };

  // format response
  function formatMessage(text: string) {
    // replace **text** with <b>text</b>
    return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  }


  const handleSend = async (message: string) => {
    const newMessage: MessageModel = {
      message: message,
      sender: "user",
      direction: "outgoing",
      position: "normal"
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setTyping(true);

    
    try {
      // remove the first message from the context passed to the backend
      const relevantMessages = messages
      //.slice(1);

      // format context for the API request
      const context = relevantMessages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "system",
          content: msg.message as string
        }));

      const responseMessage = await ragService.getRecommendations(message, context);
      setTyping(false);
      

      const botMessage: MessageModel = {
        message: responseMessage,
        sender: "Julegutten",
        direction: "incoming",
        position: "normal"
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      typeEffect(formatMessage(responseMessage), "Julegutten");

    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setTyping(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <MainContainer>
          <ChatContainer>
            <MessageList 
              typingIndicator={typing ? <TypingIndicator content="Nissens lille hjelper tenker..." /> : null}>
              {messages.map((message, i) => (
                <Message 
                  key={i} 
                  model={message} 
                  className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}
                >
                  {/* Add  avatar for bot messages */}
                  {message.sender === 'Julegutten' && (
                    <Message.Header sender="Julegutten">
                      <Avatar className="avatar"
                        name="Julegutten"
                        src={julemusen}
                        size="lg"
                      />
                    </Message.Header>
                  )}
                </Message>
              ))}
            </MessageList>
            <MessageInput 
              className="message-input" 
              placeholder="Skriv her..." 
              onSend={handleSend} 
              sendButton={false}
              attachButton={false}
              fancyScroll={true}
              />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;