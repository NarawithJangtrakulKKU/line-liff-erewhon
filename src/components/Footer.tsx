"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-black text-white py-16 px-6 ">
            <div className="max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex justify-center mb-12">
                    <h2 className="text-3xl font-bold tracking-widest bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                        EREWHON
                    </h2>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-16">
                    {/* SHOP */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">ช้อปปิ้ง</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/home" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">จัดส่ง | รับเอง</span>
                                </Link>
                            </li>
                            
                            <li>
                                <Link href="/giftcard" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">บัตรของขวัญ</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* COMPANY */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">บริษัท</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">ภารกิจของเรา</span>
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* CONNECT */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">ติดต่อ</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/faqs" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">คำถามที่พบบ่อย</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">ติดต่อเรา</span>
                                </Link>
                            </li>
                            
                        </ul>
                    </div>

                    {/* APP */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium mb-6 text-gray-200">แอป EREWHON</h3>
                        <p className="text-gray-400 mb-4">สร้างขึ้นเพื่อไลฟ์สไตล์ของคุณ</p>
                        <Link href="/app-download" className="inline-block text-gray-200 hover:text-white mb-6 underline-offset-4 hover:underline transition-all duration-300">
                            ดาวน์โหลดตอนนี้
                        </Link>
                    </div>
                </div>

                {/* Bottom Links */}
                <div className="border-t border-gray-800 pt-8 flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
                    <div className="w-full lg:w-auto">
                        <ul className="flex flex-wrap gap-x-6 gap-y-3">
                            <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">ข้อกำหนดและเงื่อนไข</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">นโยบายความเป็นส่วนตัว</Link></li>
                            <li><Link href="/recalls" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">การเรียกคืนสินค้า</Link></li>
                            <li><Link href="/collection-notice" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">ประกาศการเก็บข้อมูล</Link></li>
                            <li><Link href="/purchase-terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">เงื่อนไขใบสั่งซื้อ</Link></li>
                            <li><Link href="/food-allergy" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">ข้อปฏิเสธความรับผิดชอบเรื่องอาหารแพ้</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="w-full lg:w-auto">
                        <form className="flex flex-col sm:flex-row sm:max-w-md gap-3 sm:gap-0">
                            <input
                                type="email"
                                placeholder="อีเมล"
                                className="w-full sm:w-auto bg-gray-900 border border-gray-700 focus:border-gray-500 rounded sm:rounded-l px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all duration-300"
                            />
                            <button
                                type="submit"
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-200 hover:text-white rounded sm:rounded-r px-6 py-3 flex items-center justify-center transition-all duration-300 group"
                            >
                                เข้าร่วมกับเรา
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
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