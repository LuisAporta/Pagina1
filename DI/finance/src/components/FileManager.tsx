
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface FileManagerProps {
    bucketName?: string;
}

const FileManager: React.FC<FileManagerProps> = ({ bucketName = 'files' }) => {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Mock upload if Supabase credentials are likely placeholders
            const isMock = import.meta.env.VITE_SUPABASE_URL?.includes('placeholder');

            if (isMock) {
                // Mock behavior
                console.log("Mock Uploading:", file.name);
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockUrl = URL.createObjectURL(file);
                setFileUrl(mockUrl);
                alert('File uploaded (Mock Mode)');
            } else {
                // Real Supabase Upload
                const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                // Get Public URL
                const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
                setFileUrl(data.publicUrl);
            }

        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 glass-card rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">File Manager</h3>
            <div className="mb-4">
                <label className="block text-indigo-200 mb-2">Upload File (Image, PDF, Audio)</label>
                <input
                    type="file"
                    accept="image/*,application/pdf,audio/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                    "
                />
            </div>
            {uploading && <p className="text-yellow-400">Uploading...</p>}

            {fileUrl && (
                <div className="mt-4">
                    <p className="text-emerald-400 mb-2">Upload Successful!</p>
                    <div className="border border-white/10 p-2 rounded-lg bg-black/20">
                        {/* Simple preview logic based on file extension approximation or type */}
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline break-all">
                            {fileUrl}
                        </a>
                        <div className="mt-2">
                            <img src={fileUrl} alt="Preview" className="max-h-40 rounded shadow" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileManager;
