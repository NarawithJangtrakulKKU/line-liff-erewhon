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
                            AT EREWHON, WE’RE DRIVEN TO ENHANCE THE HEALTH OF OUR COMMUNITY BY PROVIDING ORGANIC,
                            ETHICALLY-SOURCED FOODS THAT SUPPORT OUR BODIES AND OUR PLANET. WE FIND PURPOSE IN
                            SUSTAINING A COMMUNITY CENTERED IN CARING, CURIOSITY, AND POSITIVE CHANGE.
                        </p>
                        <p className="text-xl md:text-2xl font-semibold tracking-wide uppercase">
                            WE’RE MORE THAN A GROCERY STORE. WE’RE A COMMUNITY.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="px-6 py-20 max-w-4xl mx-auto text-gray-800 space-y-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    Our Story
                </h2>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    Throughout the 1900s, the food industry abandoned its commitment to nutritional value.
                    The pressure to feed a growing population led to the end of sustainable farming and a
                    steep decline in food quality. This was the context that inspired the birth of Erewhon.
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    In the 1960s, Aveline and Michio Kushi—a Japanese couple who became leaders of the natural
                    foods movement—decided that it was time to audit what they were allowing into their bodies.
                    Their market, named Erewhon after one of their favorite books, became the first natural foods store in the country.
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    Our first market was a 10’ by 20’ stall below street-level in Boston, which consisted of a
                    small counter and a few cedar shelves. Soon, Erewhon moved to Los Angeles and became a rare
                    provider of natural foods, sourcing organic products that were difficult to come by. The vision
                    behind Erewhon was simple yet ambitious: by filling our bodies with the best the earth has to offer,
                    we can become our best selves.
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest font-medium text-gray-700 uppercase">
                    Over fifty years later, that idea still stands.
                </p>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 uppercase tracking-wide">
                    OUR EFFORTS
                </h2>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    GIVING BACK ISN’T JUST A RESPONSIBILITY AT EREWHON. IT’S A PART OF OUR PURPOSE.
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    AS A CERTIFIED ORGANIC RETAILER AND REGISTERED B-CORP, OUR MISSION GOES BEYOND SOURCING PURE, ORGANIC PRODUCTS FOR OUR COMMUNITY.
                    IT INCLUDES FIGHTING FOOD INSTABILITY, REDUCING WASTE, AND SUPPORTING IMPOVERISHED COMMUNITIES IN LOS ANGELES, THE CITY WE CALL HOME.
                </p>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    BELOW ARE THE PILLARS OF OUR COMMUNITY INVESTMENT PROGRAM:
                </p>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">CURBING LOCAL HUNGER.</span> EVERYONE DESERVES ACCESS TO HEALTHY, ORGANIC FOODS, BUT THOUSANDS OF PEOPLE IN LA GO HUNGRY ON A DAILY BASIS. WE’RE WORKING TO CHANGE
                    THAT BY DONATING OVER 25 TONS OF FOOD EVERY YEAR TO MIDNIGHT MISSION, A NONPROFIT THAT OFFERS ESSENTIAL SERVICES TO LA’S HOMELESS COMMUNITY.
                </p>
                <span className="font-bold">COMPOSTING PROGRAM.</span> WITH THE HELP OF ATHENS SERVICES, A FAMILY-OWNED RECYCLING COMPANY, WE CONTRIBUTE OVER ONE THOUSAND
                TONS OF ORGANIC WASTE EVERY YEAR. ALL OF THAT MATTER IS REUSED, MINIMIZING OUR CARBON FOOTPRINT AND LIFTING THE BURDEN OFF OF LANDFILLS.

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">THE GLASS REUSE PROGRAM.</span> OUR GLASS REUSE PROGRAM ALLOWS US TO CUT DOWN ON LOCAL WASTE BY REUSING OVER 2 MILLION BOTTLES & JARS EVERY YEAR. NOT ONLY DO WE PACKAGE OUR PERISHABLES WITH GLASS,
                    WE INCENTIVIZE OUR CUSTOMERS TO RETURN THOSE VESSELS SO WE CAN SANITIZE AND REUSE THEM. OUR GLASS BOTTLES & JARS CAN BE REUSED UP TO 1,000 TIMES.
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">NONPROFIT SUPPORT.</span> WE’RE ALWAYS LOOKING FOR WAYS TO SUPPORT NONPROFITS IN OUR COMMUNITY. WE DONATE A PORTION OF PROCEEDS FROM EVERY COLLABORATIVE SMOOTHIE TO A CHARITABLE ORGANIZATION, MANY OF WHICH ARE BASED IN SOUTHERN CALIFORNIA. THAT’S ALLOWED US TO SUPPORT LOCAL HOMELESS SHELTERS, ANIMAL SOCIETIES,
                    AND MORE. WE ALSO LAUNCH 2-4 GROCERY ROUNDUPS EVERY YEAR, EMPOWERING OUR CUSTOMERS TO SUPPORT LOCAL CAUSES THROUGH MICRO-DONATIONS.
                </p>

                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">PHILANTHROPY.</span> WHETHER IT’S PARTNERING WITH FARMLINK TO MINIMIZE FOOD INSTABILITY OR HOSTING BEACH CLEANUPS WITH HEAL THE BAY, WE’RE ALWAYS ON THE LOOKOUT FOR WAYS WE CAN GIVE BACK TO OUR COMMUNITY.
                </p>
                <p className="text-base md:text-lg leading-loose tracking-widest uppercase">
                    <span className="font-bold">LOCAL BRAND EMPOWERMENT.</span> WE PRIDE OURSELVES ON BEING A PLATFORM FOR FARMS AND BRANDS BASED IN SOUTHERN CALIFORNIA. THAT ALLOWS US TO SUPPORT SMALL BUSINESSES, FEED THE LOCAL ECONOMY, AND REDUCE EMISSIONS WITH SHORTER TRANSPORTATION DISTANCES.
                </p>

            </section>

            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Image
                    src="/images/About_Us_Employees_Desktop_11eadc5c78.png"
                    alt="About Background"
                    width={400}
                    height={300}
                    priority
                    className="w-full h-auto"
                />
                <Image
                    src="/images/about/EREWHON_Storefronts_desktop_ec29b31483.png"
                    alt="About Background"
                    width={400}
                    height={300}
                    priority
                    className="w-full h-auto"
                />
                <Image
                    src="/images/about/About_Us_Food_Desktop_d5e144c1e4.png"
                    alt="About Background"
                    width={400}
                    height={300}
                    priority
                    className="w-full h-auto hidden md:block"
                />
            </section>


        </div>
    );
}
