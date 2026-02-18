import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { File } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import FileManager from '../components/FileManager';

interface FileItem {
    name: string;
    id: string; // Supabase uses path/id
    created_at: string;
    metadata: {
        mimetype: string;
        size: number;
    };
}

const Files: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [files, setFiles] = useState<FileItem[]>([]);

    const bucketName = 'receipts'; // Ensure this bucket exists in Supabase

    useEffect(() => {
        if (user) {
            fetchFiles();
        }
    }, [user]);

    const fetchFiles = async () => {
        try {
            if (!import.meta.env.VITE_SUPABASE_URL) return;

            const { data, error } = await supabase
                .storage
                .from(bucketName)
                .list(user?.id + '/', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error) {
                // If bucket doesn't exist or permissions undefined, this might error
                console.warn('Error fetching files:', error);
            } else if (data) {
                setFiles(data as any); // Supabase types mismatch workaround
            }
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">{t('files')}</h2>
            </div>

            {/* Use the new FileManager component */}
            <FileManager bucketName={bucketName} />

            {/* File List with Actions */}
            <div className="glass-card overflow-hidden mt-6">
                <h3 className="text-xl font-bold text-white px-6 py-4 border-b border-white/10">{t('files')}</h3>
                {files.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No files found.</p>
                        <p className="text-sm mt-1 opacity-70">Upload receipts or documents above.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-white/10">
                        {files.map((file) => (
                            <li key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                <div className="flex items-center flex-1 min-w-0 mr-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg mr-4">
                                        <File className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                        <p className="text-xs text-slate-400">{(file.metadata?.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={async () => {
                                            const newName = prompt('New name:', file.name);
                                            if (newName && newName !== file.name) {
                                                try {
                                                    const { error } = await supabase.storage
                                                        .from(bucketName)
                                                        .move(`${user?.id}/${file.name}`, `${user?.id}/${newName}`);
                                                    if (error) throw error;
                                                    fetchFiles();
                                                } catch (e: any) {
                                                    alert('Rename failed: ' + e.message);
                                                }
                                            }
                                        }}
                                        className="p-1 text-blue-400 hover:text-blue-300"
                                        title="Rename"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Delete this file?')) {
                                                try {
                                                    const { error } = await supabase.storage
                                                        .from(bucketName)
                                                        .remove([`${user?.id}/${file.name}`]);
                                                    if (error) throw error;
                                                    fetchFiles();
                                                } catch (e: any) {
                                                    alert('Delete failed: ' + e.message);
                                                }
                                            }
                                        }}
                                        className="p-1 text-red-400 hover:text-red-300"
                                        title="Delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Files;
