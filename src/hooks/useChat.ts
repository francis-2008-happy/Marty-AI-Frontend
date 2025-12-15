import { useState } from 'react';
import { api } from '../services/api';
import type { Message } from '../types';

interface ChatState {
    [key: string]: Message[];
}

export const useChat = () => {
    const [conversations, setConversations] = useState<ChatState>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const getMessages = (contextKey: string) => conversations[contextKey] || [];

    const sendMessage = async (question: string, contextKey: string, activeDocId?: string, docIds?: string[]) => {
        setIsProcessing(true);

        // Add user message immediately
        const userMsg: Message = { role: 'user', content: question };
        setConversations(prev => ({
            ...prev,
            [contextKey]: [...(prev[contextKey] || []), userMsg]
        }));

        try {
            const response = await api.askQuestion(question, activeDocId, docIds);

            const botMsg: Message = { role: 'assistant', content: response.answer };

            setConversations(prev => ({
                ...prev,
                [contextKey]: [...(prev[contextKey] || []), botMsg]
            }));
        } catch (err: any) {
            console.error(err);
            const errorMsg: Message = { role: 'assistant', content: `Error: ${err.message || 'Failed to get answer'}` };
            setConversations(prev => ({
                ...prev,
                [contextKey]: [...(prev[contextKey] || []), errorMsg]
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    const clearHistory = (contextKey: string) => {
        setConversations(prev => {
            const newState = { ...prev };
            delete newState[contextKey];
            return newState;
        });
    };

    return {
        conversations,
        getMessages,
        sendMessage,
        isProcessing,
        clearHistory
    };
};
