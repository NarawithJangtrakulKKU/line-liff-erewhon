'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormData {
    newsSource: string;
    articleBrief: string;
    questionsForReview: string;
    email: string;
    confirmEmail: string;
    deadline: string;
}

export default function ContactPressPage() {
    const [formData, setFormData] = useState<FormData>({
        newsSource: '',
        articleBrief: '',
        questionsForReview: '',
        email: '',
        confirmEmail: '',
        deadline: ''
    });

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Helper function to show modal
    const showModal = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalOpen(true);
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.email !== formData.confirmEmail) {
            showModal('warning', 'อีเมลไม่ตรงกัน', 'กรุณาตรวจสอบและลองใหม่อีกครั้ง');
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    issueType: 'press', // เปลี่ยนจาก selectedIssue เป็น issueType
                    name: 'สื่อมวลชน', // Generic name for press inquiries
                    email: formData.email,
                    phone: '', // Not collected in press form
                    message: `แหล่งข่าว: ${formData.newsSource}\nสาระสำคัญ: ${formData.articleBrief}\nคำถาม: ${formData.questionsForReview}\nกำหนดส่ง: ${formData.deadline}`,
                    attachments: [], // ไม่มีไฟล์แนบ
                }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                showModal('success', 'ส่งคำขอสำเร็จ!', 'คำขอสอบถามข้อมูลสื่อของคุณได้รับการส่งเรียบร้อยแล้ว');
                setFormData({
                    newsSource: '',
                    articleBrief: '',
                    questionsForReview: '',
                    email: '',
                    confirmEmail: '',
                    deadline: ''
                });
            } else {
                showModal('error', 'เกิดข้อผิดพลาด', result.message || 'กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Error submitting press inquiry:', error);
            showModal('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'กรุณาลองใหม่อีกครั้ง');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-wider">
                            EREWHON
                        </h1>
                        <h2 className="text-xl font-semibold text-gray-800">การสอบถามข้อมูลสื่อ</h2>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* News Source */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                แหล่งข่าว*
                            </label>
                            <input
                                type="text"
                                name="newsSource"
                                value={formData.newsSource}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                required
                            />
                        </div>

                        {/* Article Brief */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                สาระสำคัญของบทความ*
                            </label>
                            <textarea
                                name="articleBrief"
                                value={formData.articleBrief}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-vertical"
                                required
                            />
                        </div>

                        {/* Questions for Review */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                คำถามที่ต้องการให้ตรวจสอบ*
                            </label>
                            <textarea
                                name="questionsForReview"
                                value={formData.questionsForReview}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-vertical"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                อีเมล*
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                required
                            />
                        </div>

                        {/* Confirm Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ยืนยันอีเมล*
                            </label>
                            <input
                                type="email"
                                name="confirmEmail"
                                value={formData.confirmEmail}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                required
                            />
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                กำหนดส่ง*
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-4 px-6 rounded-md font-medium text-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                ส่งแบบฟอร์ม
                            </button>
                        </div>
                    </form>

                    {/* Footer Note */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            {modalType === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                            {modalType === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
                            {modalType === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600" />}
                            <DialogTitle className="text-lg font-semibold">
                                {modalTitle}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-gray-600 mt-2">
                            {modalMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button
                            onClick={() => setModalOpen(false)}
                            className={`px-6 py-2 rounded-lg font-medium ${
                                modalType === 'success' 
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : modalType === 'error'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'  
                                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            }`}
                        >
                            ตกลง
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}