import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { Document, UploadResponse, AskResponse } from '../types';

// Get or create device ID
const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
};

const API_URL = 'https://marthanote.onrender.com/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interactors to inject device ID
apiClient.interceptors.request.use((config) => {
    config.headers['X-Device-Id'] = getDeviceId();
    return config;
});

export const api = {
    fetchDocuments: async (): Promise<Document[]> => {
        const response = await apiClient.get<Document[]>('/documents');
        return response.data;
    },

    uploadFiles: async (files: File[]): Promise<UploadResponse[]> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('file', file); // API expects 'file' key according to Streamlit code
        });

        // Note: If API expects single 'file' key for multiple files, 
        // we might need to call upload for each file or check if API handles multiple files with same key.
        // The Streamlit code loops and calls upload for each file individually,
        // so we should probably offer a batch upload that does parallel requests
        // or mirror the backend expectation.
        // However, Streamlit `upload_files` function sends ONE request per file?
        // "files_payload = {'file': (f.name, f.getvalue())} ... requests.post(...)"
        // Yes, it iterates. We should do the same to be safe.

        const uploadPromises = files.map(file => {
            const fd = new FormData();
            fd.append('file', file);
            return apiClient.post<UploadResponse>('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(res => res.data);
        });

        return Promise.all(uploadPromises);
    },

    deleteDocument: async (docId: string): Promise<void> => {
        await apiClient.delete(`/documents/${docId}`);
    },

    bulkDeleteDocuments: async (docIds: string[]): Promise<{ deleted: number }> => {
        const response = await apiClient.post<{ deleted: number }>('/documents/bulk-delete', { document_ids: docIds });
        return response.data;
    },

    setActiveDocument: async (docId: string): Promise<void> => {
        await apiClient.post(`/documents/${docId}/set-active`);
    },

    regenerateSummary: async (docId: string): Promise<void> => {
        await apiClient.post(`/documents/${docId}/summary/regenerate`);
    },

    askQuestion: async (question: string, documentId?: string, documentIds?: string[]): Promise<AskResponse> => {
        const payload = {
            question,
            document_ids: documentIds ? documentIds : (documentId ? [documentId] : null),
            use_chat_history: true
        };
        const response = await apiClient.post<AskResponse>('/ask', payload);
        return response.data;
    }
};
