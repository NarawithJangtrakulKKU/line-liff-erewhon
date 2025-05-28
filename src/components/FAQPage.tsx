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
        newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
        setExpandedItems(newExpanded);
    };

    const faqData: FAQItem[] = [
        {
            id: 'contact',
            question: 'How do I contact Erewhon?',
            answer: 'Please contact us here.',
            links: [{ text: 'Contact Us', url: '/contact' }]
        },
        {
            id: 'markets',
            question: 'Where are your markets located?',
            answer: 'We currently have 10 markets in Southern California: Grove, Calabasas, Venice, Santa Monica, Pacific Palisades, Silver Lake, Studio City, Beverly Hills, Culver City, and Pasadena'
        },
        {
            id: 'new-stores',
            question: 'Do you have any new stores opening?',
            answer: 'Yes! Manhattan Beach will scheduled for summer 2025. West Hollywood is scheduled for late 2025. Glendale is scheduled for mid 2026.'
        },
        {
            id: 'hiring',
            question: 'Are you hiring?',
            answer: 'Yes! We are always looking for new people to join our team. Please see job openings here.',
            links: [{ text: 'Available Positions', url: '/home' }]
        },
        {
            id: 'delete-account',
            question: 'Can I delete my account?',
            answer: 'Yes, you can delete your Erewhon account at the link below.',
            links: [{ text: 'Delete My Account', url: '/home' }]
        },
        {
            id: 'regenerative-organic',
            question: 'What does Regenerative Organic Certified mean?',
            answer: 'Regenerative Organic Certified (ROC) is a revolutionary new certification for food, textiles, and personal care ingredients. ROC farms and products meet the highest standards in the world for soil health, animal welfare, and farmworker fairness. We seek out ROC-certified products whenever possible to bring our customers the very best.'
        }
    ];

    const DataOrdering: FAQItem[] = [
        {
            id: 'order-online',
            question: 'Can I order Erewhon online?',
            answer: 'Yes! You can place an order directly through the Erewhon app or at erewhon.com.'
        },
        {
            id: 'gift-card',
            question: 'Can I purchase an Erewhon gift card?',
            answer: 'Yes, you can purchase a physical gift card at any of our markets. You can also purchase an E-gift card via the link below.',
            links: [{ text: 'Gift Cards', url: '/gift-cards' }]
        },
        {
            id: 'nationwide-shipping',
            question: 'Do you ship products outside of LA?',
            answer: 'Yes! We ship select Erewhon products nationwide. Visit the below link to browse.',
            links: [{ text: 'Order Erewhon Nationwide', url: '/nationwide-order' }]
        },
        {
            id: 'cancel-order',
            question: 'Can I cancel an online order?',
            answer: 'All orders placed through the Erewhon app and website are final. Please don’t hesitate to drop a note to our team with any issues so we can best support you.',
            links: [{ text: 'Contact Us', url: '/contact' }]
        },
        {
            id: 'modify-order',
            question: 'Can I modify my online order?',
            answer: 'To modify an order, reply to the SMS text that you receive from our team and we’ll be happy to assist. Note that an SMS thread is automatically started once your order begins preparation.',
            links: [{ text: 'Contact Us', url: '/contact' }]
        },
        {
            id: 'pickup-fee',
            question: 'Are there fees for pickup orders?',
            answer: 'No. Pickup orders placed through the Erewhon app or website do not incur fees.'
        },
        {
            id: 'delivery-fee',
            question: 'Are there fees for delivery orders?',
            answer: 'Customers who place a delivery order through the Erewhon app or website may be charged the following fees: Delivery Fee and Service Fee. Erewhon Plus members enjoy complimentary delivery on orders over $150.'
        }
    ];

    const Other: FAQItem[] = [
        {
            id: 'return/exchange items',
            question: 'Can I return/exchange items?',
            answer: 'If you are not pleased with your purchase, please return your unopened item with the receipt within 14 days (72 hours for perishable items). Non-Members must return to the market where the item was purchased; Members can return items to any market. Special orders, discontinued items, and opened items are non-refundable. All face masks are non-refundable unless they are defective. Erewhon bottle returns totaling over $10 will be paid via gift card.'
        },
        {
            id:'return my' ,
            question:'How do I return my Erewhon bottles/jars?' ,
            answer: 'You can return cleaned Erewhon bottles and jars to any Erewhon location. Erewhon bottle returns totaling over $10 will be paid via gift card.' ,
        }]

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
                    FAQs
                </h1>
            </div>

            <div className="max-w-4xl mx-auto px-4 pb-16">
            <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-400 mb-6 px-2">
                        General
                    </h2>
                    <div className="bg-gray-900">
                        {faqData.map((item) => (
                            <FAQAccordionItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>


                <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-400 mb-6 px-2">
                        Ordering & Delivery
                    </h2>
                    <div className="bg-gray-900">
                        {DataOrdering.map((item) => (
                            <FAQAccordionItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-400 mb-6 px-2">
                    Other
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
                    aria-label="Accessibility options"
                >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5C14.8 5.5 14.6 5.4 14.5 5.3L13.5 4.7C13.1 4.3 12.6 4.1 12.1 4.1C11.2 4.1 10.5 4.7 10.5 5.6V10.5L8.5 10L8 12L10.5 12.5V22H12.5V16H13.5V22H15.5V12.5L18 13V11L15.5 10.5V9C15.5 8.2 14.8 7.5 14 7.5H12C11.2 7.5 10.5 8.2 10.5 9V10.5L8.5 10L8 12L10.5 12.5V22H12.5V16H13.5V22H15.5V12.5L18 13V11L21 9Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
