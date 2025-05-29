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
    '$25',
    '$50',
    '$75',
    '$100',
    '$150',
    '$200'
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
        giftCardType: 'Emailed E-Gift Card',
        giftCardAmount: '$25',
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
        if (!formData.senderFirstName) newErrors.senderFirstName = 'First name is required'
        if (!formData.senderLastName) newErrors.senderLastName = 'Last name is required'
        if (!formData.senderEmail) newErrors.senderEmail = 'Email is required'
        if (!formData.confirmSenderEmail) newErrors.confirmSenderEmail = 'Please confirm email'
        if (!formData.recipientFirstName) newErrors.recipientFirstName = 'First name is required'
        if (!formData.recipientLastName) newErrors.recipientLastName = 'Last name is required'
        if (!formData.recipientEmail) newErrors.recipientEmail = 'Email is required'
        if (!formData.confirmRecipientEmail) newErrors.confirmRecipientEmail = 'Please confirm email'

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (formData.senderEmail && !emailRegex.test(formData.senderEmail)) {
            newErrors.senderEmail = 'Please enter a valid email'
        }
        if (formData.recipientEmail && !emailRegex.test(formData.recipientEmail)) {
            newErrors.recipientEmail = 'Please enter a valid email'
        }

        // Email confirmation validation
        if (formData.senderEmail !== formData.confirmSenderEmail) {
            newErrors.confirmSenderEmail = 'Emails do not match'
        }
        if (formData.recipientEmail !== formData.confirmRecipientEmail) {
            newErrors.confirmRecipientEmail = 'Emails do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            console.log('Form submitted:', formData)
            // Handle form submission here
            alert('Gift card order submitted successfully!')
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-20">
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-light text-white mb-4">Gift Cards</h1>
                    <p className="text-gray-300 leading-relaxed">
                        Give the gift of Erewhon! Purchase and send an electronic gift card today. Erewhon gift cards can be redeemed in-store only at any Erewhon location. For more information contact{' '}
                        <a href="mailto:customerservice@erefmkt.com" className="underline text-blue-400 hover:text-blue-300">
                            customerservice@erefmkt.com
                        </a>
                        .
                    </p>
                </div>

                <hr className="border-gray-600 mb-8" />

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sender Information */}
                    <div>
                        <h2 className="text-xl font-medium text-white mb-6">Sender Information:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="senderFirstName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Sender First Name
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
                                    Sender Last Name
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
                                    Sender Email Address
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
                                    Confirm Sender Email Address
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
                        <h2 className="text-xl font-medium text-white mb-6">Recipient Information:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="recipientFirstName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Recipient First Name
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
                                    Recipient Last Name
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
                                    Recipient Email Address
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
                                    Confirm Recipient Email Address
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
                        <h2 className="text-xl font-medium text-white mb-6">Gift Card Info:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="giftCardType" className="block text-sm font-medium text-gray-300 mb-2">
                                    Gift Card Type
                                </label>
                                <select
                                    id="giftCardType"
                                    name="giftCardType"
                                    value={formData.giftCardType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                                >
                                    <option value="Emailed E-Gift Card">Emailed E-Gift Card</option>
                                    <option value="Physical Gift Card">Physical Gift Card</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="giftCardAmount" className="block text-sm font-medium text-gray-300 mb-2">
                                    Gift Card Amount
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
                                Gift Card Message (optional)
                            </label>
                            <textarea
                                id="giftCardMessage"
                                name="giftCardMessage"
                                value={formData.giftCardMessage}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white placeholder-gray-400"
                                placeholder="Add a personal message to your gift card..."
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <button
                            type="submit"
                            className="bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}