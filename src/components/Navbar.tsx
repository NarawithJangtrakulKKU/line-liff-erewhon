"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-black shadow-md py-2" : "bg-black py-4"}`}>
            <div className="w-full px-4">
                <div className="flex items-center">
                    {/* ปุ่มเมนูทางซ้าย */}
                    <div className="w-1/4 flex items-center space-x-2">
                        <button
                            onClick={toggleMenu}
                            className="focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-white" />
                            ) : (
                                <Menu className="w-6 h-6 text-white" />
                            )}
                        </button>
                        <Link href="/" className="text-xl font-bold text-white">
                            EREWHON 
                        </Link>
                    </div>


                    {/* BrandName ตรงกลาง */}
                    {/* <div className="w-2/4">
                        <Link href="/" className="text-xl font-bold text-white">
                            EREWHON SHOP
                        </Link>
                    </div> */}

                </div>

                {/* Sidebar เท่านั้น (ไม่มี overlay เต็มจอ) */}
                {isMenuOpen && (
                    <div
                        className="fixed top-0 left-0 h-full w-80 bg-black text-white z-50 shadow-lg py-8 px-4 "
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ปุ่มปิดฝั่งซ้าย */}
                        <div className="flex justify-start mb-6">
                            <button
                                onClick={toggleMenu}
                                className="focus:outline-none"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* รายการเมนู */}
                        <div className="flex flex-col space-y-4">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`py-2 px-4 hover:bg-gray-800 transition-colors rounded-md ${pathname === item.href ? "text-blue-400 font-medium" : "text-gray-300"}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
