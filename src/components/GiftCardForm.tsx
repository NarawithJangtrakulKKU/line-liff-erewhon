'use client'

import { useState } from 'react'

interface FormData {
    senderFirstName: string
    senderLastName: string
    senderEmail: string
    confirmSenderEmail: string
    recipientFirstName: string
    recipientLastName: string
    recipientEmail: string
    confirmRecipientEmail: string
    giftCardType: string
    giftCardAmount: string
    giftCardMessage: string
}

const giftCardAmounts = [
    '฿850',     // ~$25
    '฿1,700',   // ~$50
    '฿2,550',   // ~$75
    '฿3,400',   // ~$100
    '฿5,100',   // ~$150
    '฿6,800'    // ~$200
]

export default function GiftCardForm() {
    const [formData, setFormData] = useState<FormData>({
        senderFirstName: '',
        senderLastName: '',
        senderEmail: '',
        confirmSenderEmail: '',
        recipientFirstName: '',
        recipientLastName: '',
        recipientEmail: '',
        confirmRecipientEmail: '',
        giftCardType: 'บัตรของขวัญอิเล็กทรอนิกส์ทางอีเมล',
        giftCardAmount: '฿850',
        giftCardMessage: ''
    })

    const [errors, setErrors] = useState<Partial<FormData>>({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {}

        // Required field validation
        if (!formData.senderFirstName) newErrors.senderFirstName = 'กรุณากรอกชื่อ'
        if (!formData.senderLastName) newErrors.senderLastName = 'กรุณากรอกนามสกุล'
        if (!formData.senderEmail) newErrors.senderEmail = 'กรุณากรอกอีเมล'
        if (!formData.confirmSenderEmail) newErrors.confirmSenderEmail = 'กรุณายืนยันอีเมล'
        if (!formData.recipientFirstName) newErrors.recipientFirstName = 'กรุณากรอกชื่อ'
        if (!formData.recipientLastName) newErrors.recipientLastName = 'กรุณากรอกนามสกุล'
        if (!formData.recipientEmail) newErrors.recipientEmail = 'กรุณากรอกอีเมล'
        if (!formData.confirmRecipientEmail) newErrors.confirmRecipientEmail = 'กรุณายืนยันอีเมล'

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (formData.senderEmail && !emailRegex.test(formData.senderEmail)) {
            newErrors.senderEmail = 'กรุณากรอกอีเมลที่ถูกต้อง'
        }
        if (formData.recipientEmail && !emailRegex.test(formData.recipientEmail)) {
            newErrors.recipientEmail = 'กรุณากรอกอีเมลที่ถูกต้อง'
        }

        // Email confirmation validation
        if (formData.senderEmail !== formData.confirmSenderEmail) {
            newErrors.confirmSenderEmail = 'อีเมลไม่ตรงกัน'
        }
        if (formData.recipientEmail !== formData.confirmRecipientEmail) {
            newErrors.confirmRecipientEmail = 'อีเมลไม่ตรงกัน'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('Form submitted:', formData)
            // Handle form submission here
            alert('ส่งคำสั่งซื้อบัตรของขวัญเรียบร้อยแล้ว!')
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-20">
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-light text-white mb-4">บัตรของขวัญ</h1>
                    <p className="text-gray-300 leading-relaxed">
                        มอบของขวัญแห่งความสุขจาก Erewhon! ซื้อและส่งบัตรของขวัญอิเล็กทรอนิกส์วันนี้ บัตรของขวัญ Erewhon สามารถใช้ได้ที่ร้านเท่านั้น ณ สาขา Erewhon ทุกแห่ง หากต้องการข้อมูลเพิ่มเติม ติดต่อ{' '}
                        <a href="mailto:customerservice@erefmkt.com" className="underline text-blue-400 hover:text-blue-300">
                            customerservice@erefmkt.com
                        </a>
                    </p>
                </div>

                <hr className="border-gray-600 mb-8" />

                <div className="space-y-8">
                    {/* Sender Information */}
                    <div>
                        <h2 className="text-xl font-medium text-white mb-6">ข้อมูลผู้ส่ง:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="senderFirstName" className="block text-sm font-medium text-gray-300 mb-2">
                                    ชื่อผู้ส่ง
                                </label>
                                <input
                                    type="text"
                                    id="senderFirstName"
                                    name="senderFirstName"
                                    value={formData.senderFirstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.senderFirstName ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.senderFirstName && (
                                    <p className="mt-1 text-sm text-red-400">{errors.senderFirstName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="senderLastName" className="block text-sm font-medium text-gray-300 mb-2">
                                    นามสกุลผู้ส่ง
                                </label>
                                <input
                                    type="text"
                                    id="senderLastName"
                                    name="senderLastName"
                                    value={formData.senderLastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.senderLastName ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.senderLastName && (
                                    <p className="mt-1 text-sm text-red-400">{errors.senderLastName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-300 mb-2">
                                    อีเมลผู้ส่ง
                                </label>
                                <input
                                    type="email"
                                    id="senderEmail"
                                    name="senderEmail"
                                    value={formData.senderEmail}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.senderEmail ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.senderEmail && (
                                    <p className="mt-1 text-sm text-red-400">{errors.senderEmail}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmSenderEmail" className="block text-sm font-medium text-gray-300 mb-2">
                                    ยืนยันอีเมลผู้ส่ง
                                </label>
                                <input
                                    type="email"
                                    id="confirmSenderEmail"
                                    name="confirmSenderEmail"
                                    value={formData.confirmSenderEmail}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.confirmSenderEmail ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.confirmSenderEmail && (
                                    <p className="mt-1 text-sm text-red-400">{errors.confirmSenderEmail}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recipient Information */}
                    <div>
                        <h2 className="text-xl font-medium text-white mb-6">ข้อมูลผู้รับ:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="recipientFirstName" className="block text-sm font-medium text-gray-300 mb-2">
                                    ชื่อผู้รับ
                                </label>
                                <input
                                    type="text"
                                    id="recipientFirstName"
                                    name="recipientFirstName"
                                    value={formData.recipientFirstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.recipientFirstName ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.recipientFirstName && (
                                    <p className="mt-1 text-sm text-red-400">{errors.recipientFirstName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="recipientLastName" className="block text-sm font-medium text-gray-300 mb-2">
                                    นามสกุลผู้รับ
                                </label>
                                <input
                                    type="text"
                                    id="recipientLastName"
                                    name="recipientLastName"
                                    value={formData.recipientLastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.recipientLastName ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.recipientLastName && (
                                    <p className="mt-1 text-sm text-red-400">{errors.recipientLastName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-300 mb-2">
                                    อีเมลผู้รับ
                                </label>
                                <input
                                    type="email"
                                    id="recipientEmail"
                                    name="recipientEmail"
                                    value={formData.recipientEmail}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.recipientEmail ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.recipientEmail && (
                                    <p className="mt-1 text-sm text-red-400">{errors.recipientEmail}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmRecipientEmail" className="block text-sm font-medium text-gray-300 mb-2">
                                    ยืนยันอีเมลผู้รับ
                                </label>
                                <input
                                    type="email"
                                    id="confirmRecipientEmail"
                                    name="confirmRecipientEmail"
                                    value={formData.confirmRecipientEmail}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-gray-800 text-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400 ${errors.confirmRecipientEmail ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                />
                                {errors.confirmRecipientEmail && (
                                    <p className="mt-1 text-sm text-red-400">{errors.confirmRecipientEmail}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gift Card Info */}
                    <div>
                        <h2 className="text-xl font-medium text-white mb-6">ข้อมูลบัตรของขวัญ:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="giftCardType" className="block text-sm font-medium text-gray-300 mb-2">
                                    ประเภทบัตรของขวัญ
                                </label>
                                <select
                                    id="giftCardType"
                                    name="giftCardType"
                                    value={formData.giftCardType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                                >
                                    <option value="บัตรของขวัญอิเล็กทรอนิกส์ทางอีเมล">บัตรของขวัญอิเล็กทรอนิกส์ทางอีเมล</option>
                                    <option value="บัตรของขวัญแบบกระดาษ">บัตรของขวัญแบบกระดาษ</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="giftCardAmount" className="block text-sm font-medium text-gray-300 mb-2">
                                    จำนวนเงินในบัตรของขวัญ
                                </label>
                                <select
                                    id="giftCardAmount"
                                    name="giftCardAmount"
                                    value={formData.giftCardAmount}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                                >
                                    {giftCardAmounts.map(amount => (
                                        <option key={amount} value={amount}>
                                            {amount}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label htmlFor="giftCardMessage" className="block text-sm font-medium text-gray-300 mb-2">
                                ข้อความในบัตรของขวัญ (ไม่บังคับ)
                            </label>
                            <textarea
                                id="giftCardMessage"
                                name="giftCardMessage"
                                value={formData.giftCardMessage}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400"
                                placeholder="เพิ่มข้อความส่วนตัวในบัตรของขวัญของคุณ..."
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900"
                        >
                            ส่งข้อมูล
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}