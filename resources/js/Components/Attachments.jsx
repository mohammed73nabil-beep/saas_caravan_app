import React, { useRef } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function Attachments({ attachments = [], attachableType, attachableId }) {
    const fileInputRef = useRef();

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
        attachable_type: attachableType,
        attachable_id: attachableId,
    });

    const handleFileChange = (e) => {
        if (e.target.files.length) {
            setData('file', e.target.files[0]);
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!data.file) return;

        post('/attachments', {
            forceFormData: true,
            onSuccess: () => {
                reset('file');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الملف المرفق؟')) {
            router.delete(`/attachments/${id}`);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
            <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>الملفات المرفقة والوثائق</h3>
            
            {/* Upload Form */}
            <form onSubmit={handleUpload} className="space-y-2">
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="text-xs w-full border p-1.5 rounded focus:outline-none"
                        style={{ borderColor: '#E4E7EC' }}
                        required
                    />
                    {errors.file && (
                        <p className="text-xs text-red-600 font-bold">{errors.file}</p>
                    )}
                    <button
                        type="submit"
                        disabled={processing || !data.file}
                        className="px-3 py-1.5 rounded text-xs font-bold text-white self-end transition-colors"
                        style={{
                            backgroundColor: data.file ? '#2B5D7C' : '#6B7280',
                            cursor: data.file ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {processing ? 'جاري الرفع...' : 'رفع الملف المرفق'}
                    </button>
                </div>
            </form>

            {/* Attachments List */}
            {attachments.length === 0 ? (
                <p className="text-xs" style={{ color: '#6B7280' }}>لا توجد مرفقات لهذا المستند حالياً.</p>
            ) : (
                <ul className="divide-y divide-gray-100 text-xs">
                    {attachments.map((attach) => (
                        <li key={attach.id} className="py-2.5 flex justify-between items-center gap-2">
                            <div className="min-w-0">
                                <a
                                    href={`/storage/${attach.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold hover:underline truncate block"
                                    style={{ color: '#2B5D7C' }}
                                    title={attach.file_name}
                                >
                                    📎 {attach.file_name}
                                </a>
                                <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                                    الحجم: {formatBytes(attach.file_size)} • بواسطة: {attach.uploader?.name || 'النظام'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(attach.id)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 text-sm whitespace-nowrap"
                                title="حذف الملف"
                            >
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
