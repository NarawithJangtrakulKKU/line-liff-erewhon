'use client';

import React, { useState } from 'react';
import { Upload, Calendar } from 'lucide-react';

interface FormData {
    vendorName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    invoiceDate: string;
    invoiceNumber: string;
    purchaseOrderNumber: string;
    invoiceAmount: string;
    invoicePaymentAmount: string;
    claimedShortageAmount: string;
    notes: string;
    termsAccepted: boolean;
}

const VendorClaimsForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        vendorName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        invoiceDate: '',
        invoiceNumber: '',
        purchaseOrderNumber: '',
        invoiceAmount: '',
        invoicePaymentAmount: '',
        claimedShortageAmount: '',
        notes: '',
        termsAccepted: false,
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [uploadedFiles, setUploadedFiles] = useState<{
        purchaseOrder: File | null;
        invoice: File | null;
        proofOfDelivery: File | null;
    }>({
        purchaseOrder: null,
        invoice: null,
        proofOfDelivery: null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileUpload = (type: 'purchaseOrder' | 'invoice' | 'proofOfDelivery') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
            setUploadedFiles(prev => ({
                ...prev,
                [type]: file
            }));
        } else if (file) {
            alert('File size must be less than 10MB');
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.vendorName.trim()) newErrors.vendorName = 'Required field';
        if (!formData.contactName.trim()) newErrors.contactName = 'Required field';
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Required field';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Required field';
        if (!formData.invoiceDate) newErrors.invoiceDate = 'Required field';
        if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Required field';
        if (!formData.purchaseOrderNumber.trim()) newErrors.purchaseOrderNumber = 'Required field';
        if (!formData.invoiceAmount.trim()) newErrors.invoiceAmount = 'Required field';
        if (!formData.invoicePaymentAmount.trim()) newErrors.invoicePaymentAmount = 'Required field';
        if (!formData.claimedShortageAmount.trim()) newErrors.claimedShortageAmount = 'Required field';
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms of service';

        // Email validation
        if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            console.log('Form submitted:', formData);
            console.log('Uploaded files:', uploadedFiles);
            // Handle form submission here
            alert('Form submitted successfully!');
        }
    };

    const FileUploadArea: React.FC<{
        title: string;
        type: 'purchaseOrder' | 'invoice' | 'proofOfDelivery';
        required?: boolean;
    }> = ({ title, type, required = false }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {title}{required && '*'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload(type)}
                    className="hidden"
                    id={`file-${type}`}
                />
                <label htmlFor={`file-${type}`} className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">
                        {uploadedFiles[type] ? (
                            <span className="text-green-600 font-medium">{uploadedFiles[type]?.name}</span>
                        ) : (
                            <>
                                Drag and drop here or <span className="text-blue-600 underline">Browse files</span>
                                <br />
                                <span className="text-xs text-gray-500">Max file size: 10 MB</span>
                            </>
                        )}
                    </p>
                </label>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-wider">
                        EREWHON
                    </h1>
                    <h2 className="text-2xl text-gray-700">Vendor Claims</h2>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                    {/* Vendor Information */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vendor Name/Billing Entity (as shown on invoice)*
                            </label>
                            <input
                                type="text"
                                name="vendorName"
                                value={formData.vendorName}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vendorName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                            />
                            {errors.vendorName && (
                                <p className="mt-1 text-sm text-red-600">{errors.vendorName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Name*
                            </label>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.contactName && (
                                <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Email*
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.contactEmail && (
                                <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone Number*
                            </label>
                            <input
                                type="tel"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.contactPhone && (
                                <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Invoice*
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="invoiceDate"
                                    value={formData.invoiceDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.invoiceDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                            {errors.invoiceDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.invoiceDate}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Invoice Number*
                            </label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.invoiceNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Order Number*
                            </label>
                            <input
                                type="text"
                                name="purchaseOrderNumber"
                                value={formData.purchaseOrderNumber}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.purchaseOrderNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.purchaseOrderNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.purchaseOrderNumber}</p>
                            )}
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Invoice Amount*
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="invoiceAmount"
                                    value={formData.invoiceAmount}
                                    onChange={handleInputChange}
                                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.invoiceAmount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.invoiceAmount && (
                                <p className="mt-1 text-sm text-red-600">{errors.invoiceAmount}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Invoice Payment Amount*
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="invoicePaymentAmount"
                                    value={formData.invoicePaymentAmount}
                                    onChange={handleInputChange}
                                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.invoicePaymentAmount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.invoicePaymentAmount && (
                                <p className="mt-1 text-sm text-red-600">{errors.invoicePaymentAmount}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Claimed Shortage/Discrepancy Amount*
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="claimedShortageAmount"
                                    value={formData.claimedShortageAmount}
                                    onChange={handleInputChange}
                                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.claimedShortageAmount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                            {errors.claimedShortageAmount && (
                                <p className="mt-1 text-sm text-red-600">{errors.claimedShortageAmount}</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional information about your claim..."
                        />
                    </div>

                    {/* File Uploads */}
                    <div className="space-y-6">
                        <FileUploadArea title="Purchase Order" type="purchaseOrder" />
                        <FileUploadArea title="Invoice File" type="invoice" required />
                        <FileUploadArea title="Proof of Delivery" type="proofOfDelivery" required />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="text-sm text-gray-700 mb-4">
                            Erewhon&apos;s goal is to pay its Vendor Community accurately the first time. If a
                            Vendor feels it was short paid or if there is a skipped invoice, a Vendor Claim
                            inquiry needs to be submitted using this portal no later than 90 days after the
                            payment date. This will allow our Accounts Payable team to efficiently log, track
                            and investigate each issue completely. Upon completion of the investigation, a
                            response inclusive of any supporting documentation will be emailed to the
                            address provided in the original claim. If a payment/repayment is required, the
                            amount determined to be due will be paid on Erewhon&apos;s next weekly AP check
                            run. Thank you!
                        </p>

                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleInputChange}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="text-sm text-gray-700">
                                <span className="font-medium">Terms of Service*</span>
                                <br />
                                I have read the above
                            </label>
                        </div>
                        {errors.termsAccepted && (
                            <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <button
                            type="submit"
                            className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                            Submit Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorClaimsForm;