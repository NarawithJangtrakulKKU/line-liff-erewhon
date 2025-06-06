'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface AttachedFile {
    name: string;
    size: number;
    type: string;
    base64: string;
}

export default function ContactUsPage() {
    const [selectedIssue, setSelectedIssue] = useState('order');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const issueTypes = [
        { id: 'order', label: 'ปัญหาการสั่งซื้อ', icon: '📦' },
        { id: 'corporate', label: 'สำนักงานใหญ่', icon: '🏢' },
        { id: 'membership', label: 'สมาชิก', icon: '👥' },
        { id: 'collaborations', label: 'ความร่วมมือ', icon: '🤝' },
        { id: 'marketing', label: 'การตลาด', icon: '📈' },
        { id: 'app', label: 'เข้าสู่ระบบแอป', icon: '📱' },
        { id: 'realestate', label: 'อสังหาริมทรัพย์', icon: '🏠' },
        { id: 'donation', label: 'ขอรับบริจาค', icon: '💝' },
        { id: 'press', label: 'สอบถามข้อมูลสื่อ', icon: '📰' },
        { id: 'vendor', label: 'เรียกร้องจากผู้ขาย', icon: '🏪' }
    ];

    const externalForms = ['donation', 'press', 'vendor'];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileList = Array.from(files);
            
            for (const file of fileList) {
                // ตรวจสอบขนาดไฟล์ (สูงสุด 5MB ต่อไฟล์)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด 5MB)`);
                    continue;
                }
                
                // ตรวจสอบชนิดไฟล์
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
                if (!allowedTypes.includes(file.type)) {
                    alert(`ไฟล์ ${file.name} ไม่รองรับ (รองรับเฉพาะ JPG, PNG, GIF, PDF)`);
                    continue;
                }
                
                try {
                    const base64 = await convertToBase64(file);
                    const attachedFile: AttachedFile = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        base64: base64
                    };
                    
                    setAttachedFiles(prev => [...prev, attachedFile]);
                } catch (error) {
                    console.error('Error converting file to base64:', error);
                    alert(`เกิดข้อผิดพลาดในการประมวลผลไฟล์ ${file.name}`);
                }
            }
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedIssue,
                    ...formData,
                    attachments: attachedFiles
                }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('ส่งข้อความสำเร็จ! เราจะติดต่อกลับไปโดยเร็วที่สุด');
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    message: ''
                });
                setAttachedFiles([]);
            } else {
                alert('เกิดข้อผิดพลาด: ' + (result.message || 'ไม่ทราบสาเหตุ'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('เกิดข้อผิดพลาด การเชื่อมต่อ: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    const currentIssueLabel = issueTypes.find(issue => issue.id === selectedIssue)?.label;

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-20">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
                    <p className="text-gray-300">
                        หาคำตอบที่ต้องการใน <span className="text-blue-400">คำถามที่พบบ่อย</span> ไม่เจอใช่ไหม? เรายินดีช่วยเหลือ!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Left Column - Issue Selection */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6 text-gray-300">เรื่องที่ต้องการสอบถามเกี่ยวกับอะไร?</h2>
                        <div className="space-y-3">
                            {issueTypes.map((issue) => {
                                const isSelected = selectedIssue === issue.id;
                                const isExternal = externalForms.includes(issue.id);

                                return isExternal ? (
                                    <a
                                        key={issue.id}
                                        href={`/contact/${issue.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setSelectedIssue(issue.id)}
                                        className={`block w-full p-4 rounded-lg text-left flex items-center space-x-3 transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-yellow-100 text-gray-900 border border-yellow-200'
                                                : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                                        }`}
                                    >
                                        <span className="text-xl">{issue.icon}</span>
                                        <span className="font-medium">{issue.label}</span>
                                    </a>
                                ) : (
                                    <button
                                        key={issue.id}
                                        onClick={() => setSelectedIssue(issue.id)}
                                        className={`w-full p-4 rounded-lg text-left flex items-center space-x-3 transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-yellow-100 text-gray-900 border border-yellow-200'
                                                : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                                        }`}
                                    >
                                        <span className="text-xl">{issue.icon}</span>
                                        <span className="font-medium">{issue.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column - Show form only for internal issues */}
                    {!externalForms.includes(selectedIssue) && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6 text-gray-300">{currentIssueLabel}</h2>

                            {/* Store Selection */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">กรุณาเลือกสาขาของคุณ</h3>
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gray-600 rounded-lg overflow-hidden">
                                            <Image
                                                src="/images/about/EREWHON_Storefronts_desktop_ec29b31483.png"
                                                alt="สาขา Grove"
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Grove</h3>
                                            <p className="text-gray-400 text-sm">7560 Beverly Blvd, Los Angeles CA 90036</p>
                                            <p className="text-gray-400 text-sm">323-937-0777</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="กรุณากรอกชื่อของคุณ"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="กรุณากรอกหมายเลขโทรศัพท์ของคุณ"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="อีเมล"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                                />
                                <textarea
                                    name="message"
                                    placeholder="ข้อความ"
                                    rows={6}
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 resize-vertical"
                                />
                                
                                {/* File Upload Section */}
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        multiple
                                        accept=".jpg,.jpeg,.png,.gif,.pdf"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAttachmentClick}
                                        className="bg-yellow-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-200 flex items-center space-x-2 transition-colors"
                                    >
                                        <span>แนบรูปภาพ</span>
                                        <span>📎</span>
                                    </button>
                                    
                                    {/* Display attached files */}
                                    {attachedFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm text-gray-400">ไฟล์ที่แนบ:</p>
                                            {attachedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-yellow-400">
                                                            {file.type.startsWith('image/') ? '🖼️' : '📄'}
                                                        </span>
                                                        <div>
                                                            <p className="text-white text-sm font-medium">{file.name}</p>
                                                            <p className="text-gray-400 text-xs">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <button
                                    type="submit"
                                    className="w-full bg-yellow-100 text-gray-900 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-200 transition-colors"
                                >
                                    ส่ง
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}