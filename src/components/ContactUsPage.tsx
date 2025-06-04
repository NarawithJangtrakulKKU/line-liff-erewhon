'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ContactUsPage() {
    const [selectedIssue, setSelectedIssue] = useState('order');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted:', { selectedIssue, ...formData });
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
                                <button
                                    type="button"
                                    className="bg-yellow-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-200 flex items-center space-x-2"
                                >
                                    <span>แนบรูปภาพ</span>
                                    <span>📎</span>
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-yellow-100 text-gray-900 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-200"
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