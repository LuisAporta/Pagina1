import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, File } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const bucketName = 'receipts'; // Ensure this bucket exists in Supabase

    useEffect(() => {
        if (user) {
            fetchFiles();
        }
    }, [user]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setMessage('');
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            if (!import.meta.env.VITE_SUPABASE_URL) {
                throw new Error('Supabase not configured. Cannot upload files.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            setMessage('File uploaded successfully!');
            fetchFiles();
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t('files')}</h2>

                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={uploadFile}
                        disabled={uploading}
                        accept="image/*,application/pdf"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Upload className="h-5 w-5 mr-2" />
                        {uploading ? 'Uploading...' : t('upload_file')}
                    </label>
                </div>
            </div>

            {message && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                    {message}
                </div>
            )}

            {!import.meta.env.VITE_SUPABASE_URL && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                    <strong>Note:</strong> File storage requires Supabase configuration. This feature is currently disabled in local/offline mode.
                </div>
            )}

            <div className="bg-white shadow overflow-hidden rounded-lg">
                {files.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No files found.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {files.map((file) => (
                            <li key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center">
                                    <File className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {/* Simplified download/view logic - typically needs signed URL */}
                                    <span className="text-xs text-gray-400">{(file.metadata?.size / 1024).toFixed(1)} KB</span>
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
