'use client';

import { useState } from 'react';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitted Donation Request:', formData);
    };

    return (
        <div className="min-h-screen bg-[#faf6f0] text-black p-6 flex justify-center pt-24">
            <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6">
                <h1 className="text-4xl font-bold text-center tracking-widest">EREWHON</h1>
                <h2 className="text-xl font-semibold text-center">DONATION REQUEST</h2>

                <div>
                    <label className="block font-medium mb-1">Name*</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="flex-1 border border-red-500 p-2"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="flex-1 border p-2"
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-medium mb-1">Email*</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Confirm Email*</label>
                    <input
                        type="email"
                        name="confirmEmail"
                        value={formData.confirmEmail}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Organization/School Name*</label>
                    <input
                        type="text"
                        name="orgName"
                        value={formData.orgName}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Organization/School Website*</label>
                    <input
                        type="text"
                        name="orgWebsite"
                        value={formData.orgWebsite}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">
                        Briefly describe your organization's mission and how it aligns with ours*
                    </label>
                    <textarea
                        name="mission"
                        value={formData.mission}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">How will the donation be used?*</label>
                    <textarea
                        name="usage"
                        value={formData.usage}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">What are you requesting from us?*</label>
                    <textarea
                        name="request"
                        value={formData.request}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                        rows={3}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-black text-white py-2 px-4 font-semibold hover:bg-gray-800"
                >
                    Submit Form
                </button>
            </form>
        </div>
    );
}
