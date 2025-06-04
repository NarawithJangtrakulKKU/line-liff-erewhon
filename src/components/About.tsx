import Image from "next/image";
import React from "react";

export default function AboutPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full">
                <Image
                    src="/images/about-background.jpg"
                    alt="About Background"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                    priority
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                    <div className="text-white max-w-4xl space-y-6">
                        <p className="text-lg md:text-xl tracking-wide font-light uppercase leading-loose">
                            ที่ EREWHON เราตั้งใจที่จะส่งเสริมสุขภาพของชุมชนโดยการจัดหาอาหารออร์แกนิก
                            ที่มาจากแหล่งที่ถูกจริยธรรม เพื่อสนับสนุนร่างกายและโลกของเรา เราพบจุดประสงค์ในการ
                            รักษาชุมชนที่มีจุดศูนย์กลางในการดูแล ความอยากรู้อยากเห็น และการเปลี่ยนแปลงเชิงบวก
                        </p>
                        <p className="text-xl md:text-2xl font-semibold tracking-wide uppercase">
                            เราไม่ใช่แค่ร้านขายของชำ เราคือชุมชน
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="px-6 py-20 max-w-4xl mx-auto text-gray-800 space-y-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    เรื่องราวของเรา
                </h2>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    ตลอดยุค 1900 อุตสาหกรรมอาหารได้ละทิ้งความมุ่งมั่นต่อคุณค่าทางโภชนาการ
                    แรงกดดันในการเลี้ยงดูประชากรที่เพิ่มขึ้นนำไปสู่การสิ้นสุดของการเกษตรกรรมที่ยั่งยืน
                    และการลดลงอย่างรุนแรงของคุณภาพอาหาร นี่คือบริบทที่เป็นแรงบันดาลใจให้เกิด Erewhon
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    ในทศวรรษ 1960 Aveline และ Michio Kushi คู่สามีภรรยาชาวญี่ปุ่นที่กลายเป็นผู้นำ
                    ของขบวนการอาหารธรรมชาติ ตัดสินใจว่าถึงเวลาแล้วที่จะตรวจสอบสิ่งที่พวกเขาอนุญาต
                    ให้เข้าสู่ร่างกายของตน ตลาดของพวกเขาที่ชื่อ Erewhon ตามหนึ่งในหนังสือโปรดของพวกเขา
                    กลายเป็นร้านอาหารธรรมชาติแห่งแรกในประเทศ
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    ตลาดแรกของเราเป็นร้านขนาด 10' x 20' ใต้ระดับถนนในบอสตัน ซึ่งประกอบด้วย
                    เคาน์เตอร์เล็กๆ และชั้นไม้สนเซดาร์ไม่กี่ชั้น ไม่นานนัก Erewhon ย้ายไปลอสแองเจลิส
                    และกลายเป็นผู้จัดหาอาหารธรรมชาติที่หายาก โดยจัดหาผลิตภัณฑ์ออร์แกนิกที่หาได้ยาก
                    วิสัยทัศน์เบื้องหลัง Erewhon นั้นเรียบง่ายแต่ทะเยอทะยาน โดยการเติมเต็มร่างกาย
                    ด้วยสิ่งที่ดีที่สุดที่โลกมีให้ เราสามารถกลายเป็นตัวตนที่ดีที่สุดของเราได้
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest font-medium text-gray-700 uppercase">
                    หลังจากผ่านไปกว่าห้าสิบปี แนวคิดนั้นยังคงอยู่
                </p>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    ความพยายามของเรา
                </h2>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    การให้กลับไม่ใช่แค่ความรับผิดชอบที่ Erewhon มันเป็นส่วนหนึ่งของจุดประสงค์ของเรา
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    ในฐานะผู้ค้าปลีกออร์แกนิกที่ได้รับการรับรองและ B-Corp ที่จดทะเบียน พันธกิจของเรา
                    ไปไกลกว่าการจัดหาผลิตภัณฑ์ออร์แกนิกบริสุทธิ์ให้กับชุมชนของเรา รวมถึงการต่อสู้กับ
                    ความไม่มั่นคงด้านอาหาร การลดของเสีย และการสนับสนุนชุมชนที่ยากจนในลอสแองเจลิส
                    เมืองที่เราเรียกว่าบ้าน
                </p>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    ต่อไปนี้คือเสาหลักของโปรแกรมการลงทุนในชุมชนของเรา:
                </p>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">การลดความหิวโหยในท้องถิ่น</span> ทุกคนสมควรได้รับอาหารที่ดีต่อสุขภาพและออร์แกนิก
                    แต่มีผู้คนหลายพันคนในลอสแองเจลิสที่หิวโหยทุกวัน เรากำลังทำงานเพื่อเปลี่ยนแปลงสิ่งนั้น
                    โดยการบริจาคอาหารมากกว่า 25 ตันทุกปีให้กับ Midnight Mission องค์กรไม่แสวงหาผลกำไร
                    ที่เสนอบริการจำเป็นให้กับชุมชนคนไร้บ้านในลอสแองเจลิส
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">โปรแกรมการทำปุ๋ยหมัก</span> ด้วยความช่วยเหลือจาก Athens Services บริษัทรีไซเคิลที่เป็นกิจการครอบครัว
                    เราบริจาคของเสียออร์แกนิกมากกว่าหนึ่งพันตันทุกปี สสารทั้งหมดนั้นถูกนำมาใช้ใหม่
                    ลดรอยเท้าคาร์บอนของเราและลดภาระจากหลุมฝังกลบ
                </p>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">โปรแกรมการใช้แก้วซ้ำ</span> โปรแกรมการใช้แก้วซ้ำของเราช่วยให้เราลดของเสียในท้องถิ่น
                    โดยการใช้ขวดและโหลแก้วมากกว่า 2 ล้านใบซ้ำทุกปี เราไม่เพียงแค่บรรจุของเน่าเสียง่ายด้วยแก้ว
                    เรายังให้แรงจูงใจลูกค้าให้คืนภาชนะเหล่านั้นเพื่อให้เราสามารถฆ่าเชื้อและใช้ซ้ำได้
                    ขวดและโหลแก้วของเราสามารถใช้ซ้ำได้ถึง 1,000 ครั้ง
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">การสนับสนุนองค์กรไม่แสวงหาผลกำไร</span> เรามองหาวิธีการสนับสนุนองค์กรไม่แสวงหาผลกำไร
                    ในชุมชนของเราอยู่เสมอ เราบริจาคส่วนหนึ่งของรายได้จากสมูทตี้ความร่วมมือทุกแก้ว
                    ให้กับองค์กรการกุศล หลายแห่งตั้งอยู่ในแคลิฟอร์เนียใต้ สิ่งนี้ทำให้เราสามารถสนับสนุน
                    ที่พักพิงคนไร้บ้านในท้องถิ่น สมาคมสัตว์ และอื่นๆ เรายังเปิดตัวการปัดเศษร้านขายของชำ
                    2-4 ครั้งต่อปี เพื่อเสริมพลังให้ลูกค้าของเราสนับสนุนกิจกรรมท้องถิ่นผ่านการบริจาคจำนวนเล็กน้อย
                </p>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">การกุศล</span> ไม่ว่าจะเป็นการร่วมงานกับ FarmLink เพื่อลดความไม่มั่นคงด้านอาหาร
                    หรือการจัดกิจกรรมทำความสะอาดชายหาดกับ Heal the Bay เรามองหาวิธีที่เราสามารถ
                    คืนกลับให้ชุมชนของเราอยู่เสมอ
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">การเสริมพลังแบรนด์ท้องถิ่น</span> เราภูมิใจที่เป็นแพลตฟอร์มสำหรับฟาร์มและแบรนด์
                    ที่ตั้งอยู่ในแคลิฟอร์เนียใต้ สิ่งนี้ทำให้เราสามารถสนับสนุนธุรกิจขนาดเล็ก
                    หล่อเลี้ยงเศรษฐกิจท้องถิ่น และลดการปล่อยมลพิษด้วยระยะทางการขนส่งที่สั้นลง
                </p>

            </section>

            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Image
                    src="/images/About_Us_Employees_Desktop_11eadc5c78.png"
                    alt="เกี่ยวกับเรา"
                    width={400}
                    height={300}
                    priority
                    className="w-full h-auto"
                />
                <Image
                    src="/images/about/EREWHON_Storefronts_desktop_ec29b31483.png"
                    alt="เกี่ยวกับเรา"
                    width={400}
                    height={300}
                    priority
                    className="w-full h-auto"
                />
                <Image
                    src="/images/about/About_Us_Food_Desktop_d5e144c1e4.png"
                    alt="เกี่ยวกับเรา"
                    width={400}
                    height={300}
                    priority
                    className="w-full h-auto hidden md:block"
                />
            </section>


        </div>
    );
}