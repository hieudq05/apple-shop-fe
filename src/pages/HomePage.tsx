import React from 'react';
import Hero, {type HeroParams} from "../components/Hero.tsx";
import Footer from "../components/Footer.tsx";

const heroDatas: HeroParams[] = [
    {
        title: "iPhone",
        subtitle: "Giới thiệu dòng iPhone 16",
        imageUrl: "https://www.apple.com/vn/home/images/heroes/iphone-family/hero_iphone_family__fuz5j2v5xx6y_largetall_2x.jpg",
        darkText: true,
        gradient: {
            from: "#bdd7f6",
            to: "#0056c5"
        }
    },
    {
        title: "iPad",
        subtitle: "Giới thiệu dòng iPad Pro mới",
        imageUrl: "https://www.apple.com/v/home/ce/images/promos/ipad-air/promo_ipad_air__bfbxzvw65c02_large_2x.jpg",
        darkText: true,
    },
    {
        title: "WATCH",
        subtitle: "Mỏng hơn. Mãi đỉnh.",
        imageUrl: "https://www.apple.com/v/home/ce/images/heroes/apple-watch-series-10/hero_apple_watch_series_10_avail_lte__esu66gaw6dci_largetall_2x.jpg",
        darkText: true,
        gradient: {
            from: "#cdcdcd",
            to: "#353535"
        }
    },
    {
        title: "MacBook",
        subtitle: "Giới thiệu MacBook Air M4 mới",
        imageUrl: "https://www.apple.com/v/home/ce/images/promos/macbook-air/promo_macbook_air_avail__e8ksaudoisey_large_2x.jpg",
        darkText: true,
    },
    {
        title: "AirPods",
        subtitle: "Âm thanh vòm. Không dây.",
        imageUrl: "https://www.apple.com/v/home/ce/images/promos/airpods-4/promo_airpods_4_avail__bl22kvpg6ez6_large_2x.jpg",
        darkText: false,
        position: "end",
    }
]

const HomePage: React.FC = () => {
    return (
        <>
            <main className={"flex flex-col space-y-6"}>
                {
                    heroDatas.map((heroData, index) => (
                        index < heroDatas.length - 2 ? (
                            <Hero
                                key={index}
                                title={heroData.title}
                                subtitle={heroData.subtitle}
                                imageUrl={heroData.imageUrl}
                                darkText={heroData.darkText}
                                gradient={heroData.gradient}
                            />
                        ) : ("")
                    ))
                }
                <div className={"grid grid-cols-1 gap-6 md:grid-cols-2"}>
                    {
                        heroDatas.map((heroData, index) => (
                            index >= heroDatas.length - 2 ? (
                                <Hero
                                    key={index}
                                    title={heroData.title}
                                    subtitle={heroData.subtitle}
                                    imageUrl={heroData.imageUrl}
                                    darkText={heroData.darkText}
                                    position={heroData.position}
                                />
                            ) : ("")
                        ))
                    }
                </div>
            </main>
            <Footer/>
        </>
    )
        ;
};

export default HomePage;
