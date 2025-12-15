export interface Document {
    id: string;
    filename: string;
    summary: string;
    upload_time?: number;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface UploadResponse {
    filename: string;
    id: string;
    summary: string;
}

export interface AskResponse {
    answer: string;
    source_chunks?: string[];
}

export interface Alert {
    type: 'success' | 'error' | 'info';
    message: string;
}
