import React from 'react';

interface BannerProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

const Banner: React.FC<BannerProps> = ({
  title,
  description,
  imageUrl,
  imageAlt
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden p-6 flex items-center">
      <img 
        src={imageUrl} 
        alt={imageAlt} 
        className="w-1/3 max-w-[180px] object-cover rounded-lg mr-6"
      />
      <div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-lg mb-3">{description}</p>
        <a href="#" className="text-blue-500 hover:underline">Learn more &gt;</a>
      </div>
    </div>
  );
};

export default Banner;