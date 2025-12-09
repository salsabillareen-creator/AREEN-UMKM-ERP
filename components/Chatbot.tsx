import React, { useState, useRef, useEffect } from 'react';
import { ChatbotIcon } from './icons';
import { geminiService } from '../services/geminiService';
import { ChatMessage, MessageAuthor } from '../types';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{author: MessageAuthor.AI, text: "Halo! Saya asisten bisnis AI Anda. Tanyakan apa saja tentang data Anda, seperti 'Berapa laba bersih kita?' atau 'Produk mana yang paling laris?''"}]);
        }
    }, [isOpen, messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newMessages: ChatMessage[] = [...messages, { author: MessageAuthor.User, text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const aiResponse = await geminiService.getChatbotResponse(userInput);
            setMessages([...newMessages, { author: MessageAuthor.AI, text: aiResponse }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages([...newMessages, { author: MessageAuthor.AI, text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
             <div className="fixed bottom-6 right-6 z-50">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-[var(--color-primary)] text-white p-4 rounded-full shadow-lg hover:brightness-95 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                    aria-label="Toggle AI Assistant"
                >
                    <div className="w-48 bg-white text-gray-800 rounded-lg p-2 absolute bottom-full right-0 mb-3 text-center shadow-md">
                        <p className="font-bold text-sm">AI Assistant Chat</p>
                        <p className="text-xs text-gray-500">Tanyakan tentang laba, penjualan, dll...</p>
                        <div className="absolute right-4 -bottom-1.5 w-3 h-3 bg-white transform rotate-45"></div>
                    </div>
                    <ChatbotIcon className="w-8 h-8"/>
                </div>
            </div>
            
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl flex flex-col z-40 border border-[var(--color-primary)]/20 dark:border-gray-700/50 transition-opacity duration-300 animate-fade-in-up">
                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">AI Assistant Chat</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">&times;</button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.author === MessageAuthor.User ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-xs ${
                                    msg.author === MessageAuthor.User
                                        ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-end gap-2 justify-start">
                                <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-[var(--color-primary)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-[var(--color-primary)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-[var(--color-primary)] rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t dark:border-gray-700">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Tanyakan tentang data bisnis Anda..."
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm text-gray-800 dark:text-gray-200"
                            />
                            <button type="submit" disabled={isLoading} className="bg-[var(--color-primary)] text-white p-2 rounded-lg shadow hover:brightness-90 disabled:opacity-50">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;