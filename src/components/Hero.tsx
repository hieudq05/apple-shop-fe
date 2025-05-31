import React from 'react';

export interface GradientColor {
    from: string;
    to: string;
}

export interface HeroParams {
    title: string;
    subtitle: string;
    imageUrl: string;
    darkText: boolean;
    position?: string;
    gradient?: GradientColor;
}

const Hero: React.FC<HeroParams> = ({
                                        title,
                                        subtitle,
                                        imageUrl,
                                        darkText,
                                        position = 'start', // Default position is 'start'
                                        gradient,
                                    }) => {
    return (
        <section className={`"relative h-[42rem] py-12 overflow-hidden flex items-${position}`}
                 style={{
                     backgroundImage: `url(${imageUrl})`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center'
                 }}>
            <div className={`max-w-7xl mx-auto px-6 flex flex-col items-center`}>
                <div className="text-center z-10">
                    <div className={(darkText ? "text-black" : "text-white")}>
                        <h1 className={"text-[3.5rem] font-semibold mb-2"}
                            style={
                                gradient ? {
                                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                } : {}
                            }
                        >{title}</h1>
                        <p className="text-2xl mb-4">{subtitle}</p>
                    </div>
                    <div className="flex justify-center space-x-6">
                        <a href="#" className="text-white text-base bg-blue-600 px-5 py-2 rounded-full">
                            Tìm hiểu thêm
                        </a>
                        <a href="#"
                           className="text-blue-600 text-base px-5 py-2 border rounded-full border-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                            Mua
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;