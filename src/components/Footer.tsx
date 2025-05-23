
import React from "react";

export default function Footer() {
    return (
        <footer className="bg-black text-white py-16 px-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex justify-center mb-12">
                    <h2 className="text-3xl font-bold tracking-widest bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">EREWHON</h2>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-16">
                    {/* Shop Column */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">SHOP</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Delivery | Pickup</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Ship Anywhere</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Catering</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Gift Cards</span>
                            </a></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">COMPANY</h3>
                        <ul className="space-y-3">
                            <li><a href="/about" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Our Mission</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Locations</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Membership</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Careers</span>
                            </a></li>
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">CONNECT</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">FAQs</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Contact Us</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Vendor Submission</span>
                            </a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">Vendor Dashboard</span>
                            </a></li>
                        </ul>
                    </div>

                    {/* App Promotion */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">THE EREWHON APP</h3>
                        <p className="text-gray-400 mb-4">Made with your lifestyle in mind</p>
                        <a href="#" className="inline-block text-gray-200 hover:text-white mb-6 underline-offset-4 hover:underline transition-all duration-300">Download Now</a>
                        {/* <div className="relative overflow-hidden rounded-lg shadow-2xl hover:shadow-lg transition-shadow duration-500 transform hover:scale-105">
                            <img src="/images/home_2_new_8aace87050.png" alt="Erewhon mobile app" className="w-full h-auto rounded-lg" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        </div> */}
                    </div>
                    

                </div>


                {/* Bottom Links and Newsletter */}
                <div className="border-t border-gray-800 pt-8 flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0">
                    <div className="w-full lg:w-auto">
                        <ul className="flex flex-wrap gap-x-6 gap-y-3">
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Terms & Conditions</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Product Recalls</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Notice At Collection</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Purchase Order Terms</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">Food Allergy Disclaimer</a></li>
                        </ul>
                    </div>

                    <div className="w-full lg:w-auto">
                        <form className="flex max-w-md">
                            <div className="relative flex-grow">
                                <input type="email" placeholder="EMAIL" className="w-full bg-gray-900 border border-gray-700 focus:border-gray-500 rounded-l px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all duration-300" />
                            </div>
                            <button type="submit" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-200 hover:text-white rounded-r px-6 py-3 flex items-center transition-all duration-300 group">
                                JOIN US
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </footer>
    );

}