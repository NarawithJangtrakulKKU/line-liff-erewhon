'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    links?: Array<{
        text: string;
        url: string;
    }>;
}

export default function FAQPage() {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const faqData: FAQItem[] = [
        {
            id: 'contact',
            question: 'ฉันจะติดต่อ Erewhon ได้อย่างไร?',
            answer: 'กรุณาติดต่อเราที่นี่',
            links: [{ text: 'ติดต่อเรา', url: '/contact' }]
        },
        {
            id: 'markets',
            question: 'ร้านของคุณตั้งอยู่ที่ไหนบ้าง?',
            answer: 'ปัจจุบันเรามีร้าน 10 แห่งในแถบแคลิฟอร์เนียใต้: Grove, Calabasas, Venice, Santa Monica, Pacific Palisades, Silver Lake, Studio City, Beverly Hills, Culver City และ Pasadena'
        },
        {
            id: 'new-stores',
            question: 'คุณมีแผนเปิดร้านใหม่หรือไม่?',
            answer: 'มีครับ! Manhattan Beach จะเปิดในช่วงฤดูร้อน 2025 West Hollywood จะเปิดในช่วงปลาย 2025 และ Glendale จะเปิดในช่วงกลาง 2026'
        },
        {
            id: 'hiring',
            question: 'คุณกำลังรับสมัครงานหรือไม่?',
            answer: 'ใช่ครับ! เรามองหาคนใหม่เข้าร่วมทีมอยู่เสมอ กรุณาดูตำแหน่งงานที่เปิดรับได้ที่นี่',
            links: [{ text: 'ตำแหน่งงานที่เปิดรับ', url: '/home' }]
        },
        {
            id: 'delete-account',
            question: 'ฉันสามารถลบบัญชีของฉันได้หรือไม่?',
            answer: 'ได้ครับ คุณสามารถลบบัญชี Erewhon ของคุณได้ที่ลิงก์ด้านล่าง',
            links: [{ text: 'ลบบัญชีของฉัน', url: '/home' }]
        },
        {
            id: 'regenerative-organic',
            question: 'Regenerative Organic Certified หมายความว่าอย่างไร?',
            answer: 'Regenerative Organic Certified (ROC) เป็นการรับรองแบบใหม่ที่ปฏิวัติวงการสำหรับอาหาร สิ่งทอ และส่วนผสมของผลิตภัณฑ์ดูแลส่วนบุคคล ฟาร์มและผลิตภัณฑ์ที่ได้รับ ROC มีมาตรฐานสูงสุดในโลกสำหรับสุขภาพดิน สวัสดิภาพสัตว์ และความยุติธรรมต่อคนงานในฟาร์ม เราค้นหาผลิตภัณฑ์ที่ได้รับการรับรอง ROC ทุกครั้งเมื่อเป็นไปได้ เพื่อนำสิ่งที่ดีที่สุดมาให้ลูกค้าของเรา'
        }
    ];

    const DataOrdering: FAQItem[] = [
        {
            id: 'order-online',
            question: 'ฉันสามารถสั่งซื้อ Erewhon ออนไลน์ได้หรือไม่?',
            answer: 'ได้ครับ! คุณสามารถสั่งซื้อได้โดยตรงผ่านแอป Erewhon หรือที่ erewhon.com'
        },
        {
            id: 'gift-card',
            question: 'ฉันสามารถซื้อบัตรของขวัญ Erewhon ได้หรือไม่?',
            answer: 'ได้ครับ คุณสามารถซื้อบัตรของขวัญแบบกายภาพได้ที่ร้านของเราทุกแห่ง คุณยังสามารถซื้อบัตรของขวัญอิเล็กทรอนิกส์ผ่านลิงก์ด้านล่างได้',
            links: [{ text: 'บัตรของขวัญ', url: '/gift-cards' }]
        },
        {
            id: 'nationwide-shipping',
            question: 'คุณจัดส่งสินค้านอก LA หรือไม่?',
            answer: 'ได้ครับ! เราจัดส่งผลิตภัณฑ์ Erewhon ที่คัดสรรแล้วทั่วประเทศ เยี่ยมชมลิงก์ด้านล่างเพื่อเลือกดู',
            links: [{ text: 'สั่งซื้อ Erewhon ทั่วประเทศ', url: '/nationwide-order' }]
        },
        {
            id: 'cancel-order',
            question: 'ฉันสามารถยกเลิกคำสั่งซื้อออนไลน์ได้หรือไม่?',
            answer: 'คำสั่งซื้อทั้งหมดที่สั่งผ่านแอป Erewhon และเว็บไซต์จะเป็นการสั่งซื้อขั้นสุดท้าย กรุณาติดต่อทีมของเราหากมีปัญหาใดๆ เพื่อให้เราสามารถช่วยเหลือคุณได้ดีที่สุด',
            links: [{ text: 'ติดต่อเรา', url: '/contact' }]
        },
        {
            id: 'modify-order',
            question: 'ฉันสามารถแก้ไขคำสั่งซื้อออนไลน์ได้หรือไม่?',
            answer: 'เพื่อแก้ไขคำสั่งซื้อ กรุณาตอบกลับข้อความ SMS ที่คุณได้รับจากทีมของเรา และเราจะยินดีให้ความช่วยเหลือ โปรดทราบว่าการสนทนา SMS จะเริ่มโดยอัตโนมัติเมื่อคำสั่งซื้อของคุณเริ่มการเตรียม',
            links: [{ text: 'ติดต่อเรา', url: '/contact' }]
        },
        {
            id: 'pickup-fee',
            question: 'มีค่าธรรมเนียมสำหรับคำสั่งซื้อแบบรับเองหรือไม่?',
            answer: 'ไม่มีครับ คำสั่งซื้อแบบรับเองที่สั่งผ่านแอป Erewhon หรือเว็บไซต์ไม่มีค่าธรรมเนียม'
        },
        {
            id: 'delivery-fee',
            question: 'มีค่าธรรมเนียมสำหรับคำสั่งซื้อแบบจัดส่งหรือไม่?',
            answer: 'ลูกค้าที่สั่งซื้อแบบจัดส่งผ่านแอป Erewhon หรือเว็บไซต์อาจจะถูกเรียกเก็บค่าธรรมเนียมดังต่อไปนี้: ค่าจัดส่งและค่าบริการ สมาชิก Erewhon Plus จะได้รับการจัดส่งฟรีสำหรับคำสั่งซื้อเกิน $150'
        }
    ];

    const Other: FAQItem[] = [
        {
            id: 'return/exchange items',
            question: 'ฉันสามารถคืน/แลกเปลี่ยนสินค้าได้หรือไม่?',
            answer: 'หากคุณไม่พอใจในการซื้อ กรุณาคืนสินค้าที่ยังไม่เปิดพร้อมใบเสร็จภายใน 14 วัน (72 ชั่วโมงสำหรับสินค้าที่เน่าเสียง่าย) ผู้ที่ไม่ใช่สมาชิกต้องคืนที่ร้านที่ซื้อ สมาชิกสามารถคืนได้ที่ร้านใดก็ได้ สินค้าสั่งพิเศษ สินค้าที่หยุดจำหน่าย และสินค้าที่เปิดแล้วไม่สามารถคืนเงินได้ หน้ากากทุกชนิดไม่สามารถคืนได้เว้นแต่จะมีข้อบกพร่อง การคืนขวด Erewhon ที่มีมูลค่ารวมเกิน $10 จะได้รับเงินคืนในรูปของบัตรของขวัญ'
        },
        {
            id: 'return my',
            question: 'ฉันจะคืนขวด/โหล Erewhon ได้อย่างไร?',
            answer: 'คุณสามารถคืนขวดและโหล Erewhon ที่ทำความสะอาดแล้วได้ที่สถานที่ Erewhon ใดก็ได้ การคืนขวด Erewhon ที่มีมูลค่ารวมเกิน $10 จะได้รับเงินคืนในรูปของบัตรของขวัญ'
        }
    ];

    const FAQAccordionItem: React.FC<{ item: FAQItem }> = ({ item }) => {
        const isExpanded = expandedItems.has(item.id);

        return (
            <div className="border-b border-gray-700">
                <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex justify-between items-center py-6 text-left hover:bg-gray-800 transition-colors duration-200 px-2"
                >
                    <span className="text-lg font-medium text-white pr-4">
                        {item.question}
                    </span>
                    <div className="flex-shrink-0">
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                </button>

                {isExpanded && (
                    <div className="pb-6 px-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="text-gray-300 leading-relaxed">{item.answer}</div>
                        {item.links?.length ? (
                            <div className="mt-4 space-y-2">
                                {item.links.map((link, index) => (
                                    <div key={index}>
                                        <a
                                            href={link.url}
                                            className="text-gray-400 underline hover:text-white transition-colors duration-200 text-sm"
                                        >
                                            {link.text}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 pt-20">
            <div className="text-center py-12 px-4">
                <h1 className="text-4xl md:text-5xl font-light text-white mb-2">
                    คำถามที่พบบ่อย
                </h1>
            </div>

            <div className="max-w-4xl mx-auto px-4 pb-16">
            <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-400 mb-6 px-2">
                        ทั่วไป
                    </h2>
                    <div className="bg-gray-900">
                        {faqData.map((item) => (
                            <FAQAccordionItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>


                <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-400 mb-6 px-2">
                        การสั่งซื้อและจัดส่ง
                    </h2>
                    <div className="bg-gray-900">
                        {DataOrdering.map((item) => (
                            <FAQAccordionItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-400 mb-6 px-2">
                    อื่นๆ
                    </h2>
                    <div className="bg-gray-900">
                        {Other.map((item) => (
                            <FAQAccordionItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                
            </div>

            <div className="fixed bottom-6 right-6">
                <button
                    className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200"
                    aria-label="ตัวเลือกการเข้าถึง"
                >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 5.5 14.6 5.4 14.5 5.3L13.5 4.7C13.1 4.3 12.6 4.1 12.1 4.1C11.2 4.1 10.5 4.7 10.5 5.6V10.5L8.5 10L8 12L10.5 12.5V22H12.5V16H13.5V22H15.5V12.5L18 13V11L15.5 10.5V9C15.5 8.2 14.8 7.5 14 7.5H12C11.2 7.5 10.5 8.2 10.5 9V10.5L8.5 10L8 12L10.5 12.5V22H12.5V16H13.5V22H15.5V12.5L18 13V11L21 9Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}