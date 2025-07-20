import React, {useEffect, useState} from 'react';
import {MagnifyingGlassIcon, ShoppingBagIcon} from "@heroicons/react/24/outline";
import {Menu, MenuButton, MenuItems, Transition} from "@headlessui/react";
import { fetchCategories } from '@/services/categoryService';

const navbarParams = [
    {
        name: "Cửa hàng", href: "#", childLinks: [
            {name: "Mac", href: "#"},
            {name: "iPad", href: "#"},
            {name: "iPhone", href: "#"},
            {name: "Watch", href: "#"},
            {name: "AirPods", href: "#"},
        ]
    },
    {
        name: "Mac", href: "#", childLinks: [
            {name: "MacBook", href: "#"},
            {name: "MacBook Air", href: "#"},
            {name: "MacBook Pro", href: "#"},
            {name: "iMac", href: "#"},
            {name: "Mac Mini", href: "#"},
            {name: "Mac Pro", href: "#"},
        ], accessories: [
            {name: "MacBook Cases", href: "#"},
            {name: "MacBook Chargers", href: "#"},
            {name: "MacBook Keyboards", href: "#"},
            {name: "MacBook Screen Protectors", href: "#"},
            {name: "Mac Accessories", href: "#"},
        ]
    },
    {
        name: "Apple Watch", href: "#", childLinks: [
            {name: "Apple Watch Series 9", href: "#"},
            {name: "Apple Watch Ultra 2", href: "#"},
            {name: "Apple Watch SE", href: "#"},
        ], accessories: [
            {name: "Apple Watch Bands", href: "#"},
            {name: "Apple Watch Chargers", href: "#"},
            {name: "Apple Watch Cases", href: "#"},
            {name: "Apple Watch Screen Protectors", href: "#"},
        ]
    },
    {
        name: "iPad", href: "#", childLinks: [
            {name: "iPad Pro", href: "#"},
            {name: "iPad Air", href: "#"},
            {name: "iPad", href: "#"},
            {name: "iPad mini", href: "#"}
        ], accessories: [
            {name: "iPad Cases", href: "#"},
            {name: "iPad Keyboards", href: "#"},
            {name: "Apple Pencil", href: "#"},
            {name: "iPad Chargers", href: "#"},
            {name: "iPad Cables", href: "#"}
        ]
    },
    {
        name: "iPhone", href: "#", childLinks: [
            {name: "iPhone 15 Pro", href: "#"},
            {name: "iPhone 15 Pro Max", href: "#"},
            {name: "iPhone 15", href: "#"},
            {name: "iPhone 15 Plus", href: "#"}
        ], accessories: [
            {name: "iPhone Cases", href: "#"},
            {name: "iPhone Screen Protectors", href: "#"},
            {name: "iPhone Chargers", href: "#"},
            {name: "iPhone Cables", href: "#"}
        ]
    },
    {
        name: "AirPods", href: "#", childLinks: [
            {name: "AirPods Pro", href: "#"},
            {name: "AirPods (3rd generation)", href: "#"},
            {name: "AirPods Max", href: "#"}
        ], accessories: [
            {name: "AirPods Case", href: "#"},
            {name: "AirPods Pro Case", href: "#"},
            {name: "AirPods Max Case", href: "#"}
        ]
    },
    {
        name: "Blog", href: "#", childLinks: [
            {name: "Tin tức", href: "#"},
            {name: "Hướng dẫn", href: "#"},
            {name: "Đánh giá", href: "#"},
        ], accessories: [
            {name: "Phụ kiện", href: "#"},
            {name: "Apple TV", href: "#"},
            {name: "HomePod", href: "#"},
            {name: "AirTag", href: "#"},
            {name: "Apple Gift Card", href: "#"},
        ]
    },
    {
        name: "Liên hệ", href: "#", childLinks: [
            {name: "Hỗ trợ", href: "#"},
            {name: "Bảo hành", href: "#"},
            {name: "Đổi trả", href: "#"},
        ]
    }
]

const Navbar: React.FC = () => {
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

    return (
        <>
            <nav className="bg-white text-black py-1 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <a href="/" className="text-black">
                            <svg height="44" viewBox="0 0 14 44" width="14" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                                    fill="#000000"/>
                            </svg>
                        </a>
                    </div>
                    <div className="flex items-center space-x-12">
                        {
                            navbarParams.map((link, index) => {
                                return (
                                    <Menu
                                        as="div"
                                        className="inline-block text-left"
                                        key={index}
                                        onMouseEnter={() => setOpenMenuIndex(index)}
                                        onMouseLeave={() => setOpenMenuIndex(null)}
                                    >
                                        <div>
                                            <MenuButton className="text-xs font-normal focus:outline-none">
                                                {link.name}
                                            </MenuButton>
                                        </div>
                                        <Transition
                                            show={openMenuIndex === index}
                                            as={React.Fragment}
                                            enter="transition ease-out duration-500"
                                            enterFrom="transform opacity-0"
                                            enterTo="transform opacity-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100"
                                            leaveTo="transform opacity-0"
                                        >
                                            <MenuItems
                                                static
                                                className="absolute left-1/2 -translate-x-1/2 mt-2 w-screen origin-top border-t-0 bg-white shadow-lg ring-black/5 focus:outline-none z-[45]"
                                            >
                                                <div className={"flex space-x-24 py-10 max-w-7xl mx-auto"}>
                                                    <div className={"space-y-4"}>
                                                        <div className={"text-xs text-gray-500"}>Mua hàng</div>
                                                        <div className={"space-y-2 flex flex-col"}>
                                                            {
                                                                link.childLinks.map((childLink, index) => (
                                                                    <a href={childLink.href} key={index}
                                                                       className={"text-2xl font-semibold hover:underline"}>
                                                                        {childLink.name}
                                                                    </a>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                    {
                                                        link.accessories && link.accessories.length > 0 && (
                                                            <div className={"space-y-4"}>
                                                                <div className={"text-xs text-gray-500"}>Phụ kiện</div>
                                                                <div className={"space-y-2 flex flex-col"}>
                                                                    {
                                                                        link.accessories.map((accessory, index) => (
                                                                            <a href={accessory.href} key={index}
                                                                               className={"text-xs font-semibold hover:underline"}>
                                                                                {accessory.name}
                                                                            </a>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </MenuItems>
                                        </Transition>
                                    </Menu>
                                )
                            })
                        }
                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="#" className="">
                            <MagnifyingGlassIcon className={"size-4"}/>
                        </a>
                        <a href="/bag" className="">
                            <ShoppingBagIcon className={"size-4"}/>
                        </a>
                    </div>
                </div>
            </nav>
            {openMenuIndex !== null && (
                <div
                    className="fixed inset-0 z-40"
                    aria-hidden="true"
                    onClick={() => setOpenMenuIndex(null)}
                />
            )}
        </>
    );
};

export default Navbar;
