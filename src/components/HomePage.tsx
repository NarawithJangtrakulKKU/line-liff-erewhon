
import Image from 'next/image'
import Link from 'next/link'


//rfc
export default function HomePage() {
    return (
        <section className="w-full h-full bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 lg:px-0 w-full gap-2 sm:gap-0">

                {/* Left Card */}
                <div className="w-full sm:w-1/2 sm:pr-[5px] md:pr-[10px] relative">
                    <Link href="/shop">
                        <div className="relative group cursor-pointer">
                            <Image
                                src="/images/home/home1.jpg"
                                width={0}
                                height={0}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                                style={{ width: '100%', height: 'auto' }}
                                alt="Delivery and Pickup Service"
                                className="transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                                <div className="bg-black bg-opacity-40 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded text-center space-y-1 sm:space-y-2 max-w-[90%] sm:max-w-none">
                                    <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">
                                        DELIVERY | PICKUP
                                    </h2>
                                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                                        READY IN 30 MINUTES
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Right Card */}
                <div className="w-full sm:w-1/2 sm:pl-[5px] md:pl-[10px] relative">
                    <Link href="/page2">
                        <div className="relative group cursor-pointer">
                            <Image
                                src="/images/home/KITCHEN_SARBONNE_2025_8_2.jpg"
                                width={0}
                                height={0}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                                style={{ width: '100%', height: 'auto' }}
                                alt="Shipping Service"
                                className="transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                                <div className="bg-black bg-opacity-40 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded text-center space-y-1 sm:space-y-2 max-w-[90%] sm:max-w-none">
                                    <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight">
                                        SHIP ANYWHERE
                                    </h2>
                                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                                        ARRIVES IN 2 DAYS
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '500px' }}>
                <Link href="/shop" className="block relative w-full h-[500px] group">
                    <Image
                        src="/images/home/combo.jpg"
                        alt="อาหาร"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="pt-5"
                    />
                    <div className="absolute bottom-4 left-4 text-white">
                        <h2 className="text-2xl uppercase">The Cafe</h2>
                    </div>
                </Link>
            </div>
            <div className="flex flex-col md:flex-row w-full gap-4">
                <div className="w-full md:w-1/2 relative">
                    <div className="relative w-full h-[500px]">
                        <Link href="/shop" className="block relative w-full h-full group">
                            <Image
                                src="/images/home/greeentea.png"
                                alt="ชาเขียวปั่น"
                                fill
                                style={{ objectFit: 'cover' }}
                                className="pt-5"
                            />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h2 className="text-2xl uppercase">Tonic bar</h2>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="w-full md:w-1/2 relative">
                    <div className="relative w-full h-[500px]">
                        <Link href="/shop" className="block relative w-full h-full group">
                            <Image
                                src="/images/home/shots.png"
                                alt="Juices and shots"
                                fill
                                style={{ objectFit: 'cover' }}
                                className="pt-5"
                            />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h2 className="text-2xl uppercase">Juices & shots</h2>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row w-full gap-4">
                <div className="w-full md:w-1/2 relative">
                    <div className="relative w-full h-[500px]">
                        <Link href="/shop" className="block relative w-full h-full group">
                            <Image
                                src="/images/home/pantry.png"
                                alt="เครื่องเทศ"
                                fill
                                style={{ objectFit: 'cover' }}
                                className="pt-5"
                            />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h2 className="text-2xl uppercase">pantry  staples</h2>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="w-full md:w-1/2 relative">
                    <div className="relative w-full h-[500px]">
                        <Link href="/shop" className="block relative w-full h-full group">
                            <Image
                                src="/images/home/shots.png"
                                alt="Juices and shots"
                                fill
                                style={{ objectFit: 'cover' }}
                                className="pt-5"
                            />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h2 className="text-2xl uppercase">Juices & shots</h2>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>


        </section >
    );
}
