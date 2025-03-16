import { useState } from "react";
import { getChatCompletion } from "./openai";

interface Message {
   id: number;
   text: string;
   sender: 'user' | 'assistant';
   loading?: boolean;
}

const ChatPage = () => {
   const [messages, setMessages] = useState<Message[]>([]);
   const [newMessage, setNewMessage] = useState('');
   const [isLoading, setIsLoading] = useState(false);

   const handleSendMessage = async () => {
      if (newMessage.trim() === '' || isLoading) return;
      
      const userMessage: Message = {
         id: Date.now(),
         text: newMessage,
         sender: 'user',
      };

      const loadingMessage: Message = {
         id: Date.now() + 1,
         text: '...',
         sender: 'assistant',
         loading: true,
      };

      setMessages(prev => [...prev, userMessage, loadingMessage]);
      setNewMessage('');
      setIsLoading(true);

      try {
         const response = await getChatCompletion(newMessage);

         setMessages(prev => prev.map(msg => 
            msg.loading
               ? { id: msg.id, text: response || 'Sorry, I could not process that.', sender: 'assistant'}
               : msg
         ));
      } catch (error) {
         setMessages(prev => prev.map(msg => 
            msg.loading
               ? { id: msg.id, text: 'Sorry, an error occurred. Please try again.', sender: 'assistant'}
               : msg
         ));
      } finally {
         setIsLoading(false);
      }
   };
   
   return (
      <div className="flex flex-col h-screen max-w-2xl mx-auto p-6 bg-gray-50">
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                } ${
                  message.loading ? 'animate-pulse' : ''
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed">
                  {message.text}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 bg-white p-4 rounded-xl shadow-sm">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-gray-50 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className={`px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
              transition-all duration-200 flex items-center gap-2
              ${isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-600 hover:shadow-md active:scale-95'
              }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                Send
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
}

export default ChatPage