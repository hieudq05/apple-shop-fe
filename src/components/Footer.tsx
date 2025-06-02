import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-8 px-6 mt-6">
      <div className="container mx-auto">
        {/* Footer notes */}
        <div className="border-b border-gray-300 pb-5 text-xs">
          <p className="mb-2">
            1. Trade-in values will vary based on the condition, year, and configuration of your eligible trade-in device. Not all devices are eligible for credit. You must be at least 18 years old to be eligible to trade in for credit or for an Apple Gift Card. Trade-in value may be applied toward qualifying new device purchase, or added to an Apple Gift Card. Actual value awarded is based on receipt of a qualifying device matching the description provided when estimate was made. Sales tax may be assessed on full value of a new device purchase. In-store trade-in requires presentation of a valid photo ID. Offer may not be available in all stores, and may vary between in-store and online trade-in. Some stores may have additional requirements. Apple or its trade-in partners reserve the right to refuse or limit quantity of any trade-in transaction for any reason. More details are available from Apple's trade-in partner for trade-in and recycling of eligible devices. Restrictions and limitations may apply.
          </p>
          <p className="mb-2">
            Apple Vision Pro has not been authorized as required by the rules of the Federal Communications Commission. This device is not, and may not be, offered for sale or lease, or sold or leased, until authorization is obtained.
          </p>
          <p className="mb-2">
            Apple TV+ is $6.99/month after free trial. One subscription per Family Sharing group. Offer good for 3 months after eligible device activation. Plan automatically renews until cancelled. Restrictions and other terms apply.
          </p>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-8 text-xs">
          <div className={"text-left"}>
            <h3 className="font-semibold mb-3">Shop and Learn</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Store</a></li>
              <li><a href="#" className="hover:underline">Mac</a></li>
              <li><a href="#" className="hover:underline">iPad</a></li>
              <li><a href="#" className="hover:underline">iPhone</a></li>
              <li><a href="#" className="hover:underline">Watch</a></li>
              <li><a href="#" className="hover:underline">AirPods</a></li>
              <li><a href="#" className="hover:underline">TV & Home</a></li>
              <li><a href="#" className="hover:underline">AirTag</a></li>
              <li><a href="#" className="hover:underline">Accessories</a></li>
              <li><a href="#" className="hover:underline">Gift Cards</a></li>
            </ul>
          </div>
          <div className={"text-left"}>
            <h3 className="font-semibold mb-3">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Apple Music</a></li>
              <li><a href="#" className="hover:underline">Apple TV+</a></li>
              <li><a href="#" className="hover:underline">Apple Fitness+</a></li>
              <li><a href="#" className="hover:underline">Apple News+</a></li>
              <li><a href="#" className="hover:underline">Apple Arcade</a></li>
              <li><a href="#" className="hover:underline">iCloud</a></li>
              <li><a href="#" className="hover:underline">Apple One</a></li>
              <li><a href="#" className="hover:underline">Apple Card</a></li>
              <li><a href="#" className="hover:underline">Apple Books</a></li>
              <li><a href="#" className="hover:underline">Apple Podcasts</a></li>
              <li><a href="#" className="hover:underline">App Store</a></li>
            </ul>
          </div>
          <div className={"text-left"}>
            <h3 className="font-semibold mb-3">Apple Store</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Find a Store</a></li>
              <li><a href="#" className="hover:underline">Genius Bar</a></li>
              <li><a href="#" className="hover:underline">Today at Apple</a></li>
              <li><a href="#" className="hover:underline">Apple Camp</a></li>
              <li><a href="#" className="hover:underline">Apple Store App</a></li>
              <li><a href="#" className="hover:underline">Certified Refurbished</a></li>
              <li><a href="#" className="hover:underline">Apple Trade In</a></li>
              <li><a href="#" className="hover:underline">Financing</a></li>
              <li><a href="#" className="hover:underline">Order Status</a></li>
              <li><a href="#" className="hover:underline">Shopping Help</a></li>
            </ul>
          </div>
          <div className={"text-left"}>
            <h3 className="font-semibold mb-3">For Business</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Apple and Business</a></li>
              <li><a href="#" className="hover:underline">Shop for Business</a></li>
            </ul>
            <h3 className="font-semibold mb-3 mt-6">For Education</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Apple and Education</a></li>
              <li><a href="#" className="hover:underline">Shop for K-12</a></li>
              <li><a href="#" className="hover:underline">Shop for College</a></li>
            </ul>
          </div>
          <div className={"text-left"}>
            <h3 className="font-semibold mb-3">Apple Values</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Accessibility</a></li>
              <li><a href="#" className="hover:underline">Education</a></li>
              <li><a href="#" className="hover:underline">Environment</a></li>
              <li><a href="#" className="hover:underline">Inclusion and Diversity</a></li>
              <li><a href="#" className="hover:underline">Privacy</a></li>
              <li><a href="#" className="hover:underline">Racial Equity and Justice</a></li>
              <li><a href="#" className="hover:underline">Supplier Responsibility</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright and legal */}
        <div className="border-t border-gray-300 pt-5 text-xs">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <p>Copyright © 2023 Apple Inc. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Use</a>
              <a href="#" className="hover:underline">Sales and Refunds</a>
              <a href="#" className="hover:underline">Legal</a>
              <a href="#" className="hover:underline">Site Map</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;