import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Document } from '../types';

export const useDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const docs = await api.fetchDocuments();
            setDocuments(docs);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch documents');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, []);

    const uploadFiles = async (files: File[]) => {
        // setIsLoading(true); // Don't block UI on upload, maybe just show progress
        try {
            await api.uploadFiles(files);
            await fetchDocuments(true);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteDocument = async (id: string) => {
        try {
            // Optimistic upate
            setDocuments(prev => prev.filter(d => d.id !== id));
            await api.deleteDocument(id);
            await fetchDocuments(true);
        } catch (err) {
            console.error(err);
            // Revert if needed, but for now just refetch
            await fetchDocuments(true);
            throw err;
        }
    };

    // Polling logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const needsPolling = documents.some(doc =>
            doc.summary?.toLowerCase().includes('processing')
        );

        if (needsPolling) {
            interval = setInterval(() => {
                fetchDocuments(true);
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [documents, fetchDocuments]);

    // Initial fetch
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return {
        documents,
        isLoading,
        error,
        fetchDocuments,
        uploadFiles,
        deleteDocument,
    };
};
