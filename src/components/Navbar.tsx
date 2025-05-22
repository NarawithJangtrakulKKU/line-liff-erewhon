"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { title: "Delivery | Pickup", href: "/delivery-pickup" },
        { title: "Ship Anywhere", href: "/shipping" },
        { title: "Catering", href: "/catering" },
        { title: "Membership", href: "/membership" },
        { title: "Digital Gift Cards", href: "/gift-cards" },
        { title: "Locations", href: "/locations" },
        { title: "FAQs", href: "/faqs" },
        { title: "Our Mission", href: "/mission" },
        { title: "Contact Us", href: "/contact" }
    ];

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-500 ease-out ${
                scrolled 
                    ? "bg-black/90 backdrop-blur-md shadow-lg py-2 border-b border-gray-800" 
                    : "bg-black/80 py-4"
            }`}>
                <div className="w-full px-4">
                    <div className="flex items-center justify-between">
                        {/* ส่วนซ้าย - เมนูและโลโก้ */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleMenu}
                                className="focus:outline-none transform transition-all duration-300 hover:scale-110 hover:bg-gray-800 rounded-full p-2 hover:rotate-90"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6 text-white transition-transform duration-300 rotate-180" />
                                ) : (
                                    <Menu className="w-6 h-6 text-white transition-transform duration-300" />
                                )}
                            </button>
                            <Link 
                                href="/home" 
                                className="text-xl font-bold text-white transition-all duration-300 hover:text-orange-400 transform hover:scale-105 hover:translate-x-1"
                            >
                                EREWHON 
                            </Link>
                        </div>

                        {/* ส่วนขวา - ตะกร้าและโปรไฟล์ */}
                        <div className="flex items-center space-x-3">
                            {/* ปุ่มตะกร้า */}
                            <Link
                                href="/cart"
                                className="relative p-2 text-white hover:text-orange-400 transition-all duration-300 hover:scale-110 hover:bg-gray-800 rounded-full group"
                                aria-label="Shopping cart"
                            >
                                <ShoppingCart className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
                                {/* Badge สำหรับจำนวนสินค้าในตะกร้า (optional) */}
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold transform transition-all duration-300 group-hover:scale-110">
                                    0
                                </span>
                            </Link>

                            {/* ปุ่มโปรไฟล์ */}
                            <Link
                                href="/profile"
                                className={`p-2 transition-all duration-300 hover:scale-110 hover:bg-gray-800 rounded-full group ${
                                    pathname === "/profile" 
                                        ? "text-orange-400 bg-orange-500/20 ring-2 ring-orange-400/50" 
                                        : "text-white hover:text-orange-400"
                                }`}
                                aria-label="User profile"
                            >
                                <User className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
                            </Link>
                        </div>
                    </div>

                    {/* Backdrop overlay */}
                    {isMenuOpen && (
                        <div 
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 animate-pulse"
                            onClick={toggleMenu}
                        />
                    )}

                    {/* Sidebar */}
                    <div
                        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-black via-gray-900 to-black text-white z-50 shadow-2xl py-8 px-4 transform transition-all duration-300 ease-out ${
                            isMenuOpen 
                                ? "translate-x-0 opacity-100" 
                                : "-translate-x-full opacity-0"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header ของ sidebar */}
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
                            <h2 className={`text-2xl font-bold text-orange-400 transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                                style={{ animationDelay: '100ms' }}>
                                เมนู
                            </h2>
                            <button
                                onClick={toggleMenu}
                                className="focus:outline-none hover:bg-gray-800 rounded-full p-2 transition-all duration-300 hover:scale-110 hover:rotate-90"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* รายการเมนู */}
                        <div className="flex flex-col space-y-2">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`py-3 px-4 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 transition-all duration-300 rounded-lg transform hover:scale-105 hover:shadow-lg hover:translate-x-2 group ${
                                        pathname === item.href 
                                            ? "text-orange-400 font-medium bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-l-4 border-orange-400 translate-x-2" 
                                            : "text-gray-300 hover:text-white"
                                    } ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                                    style={{ 
                                        transitionDelay: `${150 + index * 50}ms`,
                                        animationDelay: `${150 + index * 50}ms`
                                    }}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="relative overflow-hidden">
                                        {item.title}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Footer ของ sidebar */}
                        <div className={`absolute bottom-6 left-4 right-4 text-center transition-all duration-700 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                             style={{ transitionDelay: '600ms' }}>
                            <div className="border-t border-gray-700 pt-4">
                                <p className="text-gray-400 text-sm hover:text-orange-400 transition-colors duration-300">© 2024 EREWHON SHOP</p>
                                <p className="text-gray-500 text-xs mt-1 hover:text-gray-400 transition-colors duration-300">ขับเคลื่อนด้วยความรัก ❤️</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}