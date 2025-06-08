'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ContactDonationPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        orgName: '',
        orgWebsite: '',
        mission: '',
        usage: '',
        request: '',
    });

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    // Helper function to show modal
    const showModal = (type: 'success' | 'error', title: string, message: string) => {
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    issueType: 'donation',
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: '', // Not collected in donation form
                    message: `องค์กร: ${formData.orgName}\nเว็บไซต์: ${formData.orgWebsite}\nพันธกิจ: ${formData.mission}\nการใช้งาน: ${formData.usage}\nคำขอ: ${formData.request}`,
                    attachments: [],
                }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                showModal('success', 'ส่งคำขอรับบริจาคสำเร็จ!', 'เราจะพิจารณาและติดต่อกลับไป');
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    confirmEmail: '',
                    orgName: '',
                    orgWebsite: '',
                    mission: '',
                    usage: '',
                    request: '',
                });
            } else {
                showModal('error', 'เกิดข้อผิดพลาด', result.message || 'กรุณาลองใหม่อีกครั้ง');
            }
        } catch (error) {
            console.error('Error submitting donation request:', error);
            showModal('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'กรุณาลองใหม่อีกครั้ง');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-black flex justify-center pt-24 px-4 pb-12">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
                <div className="text-center mb-4">
                    <h1 className="text-4xl font-bold tracking-wider text-gray-900">EREWHON</h1>
                    <h2 className="text-xl font-semibold text-gray-800">คำขอรับบริจาค</h2>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล*</label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="ชื่อ"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="นามสกุล"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล*</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Confirm Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ยืนยันอีเมล*</label>
                    <input
                        type="email"
                        name="confirmEmail"
                        value={formData.confirmEmail}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Organization Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อองค์กร/สถานศึกษา*
                    </label>
                    <input
                        type="text"
                        name="orgName"
                        value={formData.orgName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Organization Website */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        เว็บไซต์องค์กร/สถานศึกษา*
                    </label>
                    <input
                        type="text"
                        name="orgWebsite"
                        value={formData.orgWebsite}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Mission */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        อธิบายพันธกิจขององค์กรของคุณโดยย่อ และบอกว่าสอดคล้องกับเราอย่างไร*
                    </label>
                    <textarea
                        name="mission"
                        value={formData.mission}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    />
                </div>

                {/* Usage */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        การบริจาคจะถูกนำไปใช้อย่างไร*
                    </label>
                    <textarea
                        name="usage"
                        value={formData.usage}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    />
                </div>

                {/* Request */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        คุณต้องการขออะไรจากเรา*
                    </label>
                    <textarea
                        name="request"
                        value={formData.request}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-4 px-6 rounded-md font-medium text-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                        ส่งแบบฟอร์ม
                    </button>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก</p>
                </div>
            </form>

            {/* Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-2">
                            {modalType === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                            {modalType === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
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
                                    : 'bg-red-600 hover:bg-red-700 text-white'  
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