import React, { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
} from "@headlessui/react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "@/services/categoryService";

const navbarParams = [
    {
        name: "Cửa hàng",
        href: "#",
        childLinks: [
            { name: "Mac", href: "/products/mac" },
            { name: "iPad", href: "/products/ipad" },
            { name: "iPhone", href: "/products/iphone" },
            { name: "Watch", href: "/products/watch" },
            { name: "AirPods", href: "/products/airpods" },
        ],
    },
    {
        name: "Mac",
        href: "#",
        childLinks: [
            { name: "Tất cả Mac", href: "/products/mac" },
            { name: "MacBook", href: "#" },
            { name: "MacBook Air", href: "#" },
            { name: "MacBook Pro", href: "#" },
            { name: "iMac", href: "#" },
            { name: "Mac Mini", href: "#" },
            { name: "Mac Pro", href: "#" },
        ],
        accessories: [
            { name: "MacBook Cases", href: "#" },
            { name: "MacBook Chargers", href: "#" },
            { name: "MacBook Keyboards", href: "#" },
            { name: "MacBook Screen Protectors", href: "#" },
            { name: "Mac Accessories", href: "#" },
        ],
    },
    {
        name: "Watch",
        href: "#",
        childLinks: [
            { name: "Tất cả Apple Watch", href: "/products/watch" },
            { name: "Apple Watch Series 9", href: "#" },
            { name: "Apple Watch Ultra 2", href: "#" },
            { name: "Apple Watch SE", href: "#" },
        ],
        accessories: [
            { name: "Apple Watch Bands", href: "#" },
            { name: "Apple Watch Chargers", href: "#" },
            { name: "Apple Watch Cases", href: "#" },
            { name: "Apple Watch Screen Protectors", href: "#" },
        ],
    },
    {
        name: "iPad",
        href: "#",
        childLinks: [
            { name: "Tất cả iPad", href: "/products/ipad" },
            { name: "iPad Pro", href: "#" },
            { name: "iPad Air", href: "#" },
            { name: "iPad", href: "#" },
            { name: "iPad mini", href: "#" },
        ],
        accessories: [
            { name: "iPad Cases", href: "#" },
            { name: "iPad Keyboards", href: "#" },
            { name: "Apple Pencil", href: "#" },
            { name: "iPad Chargers", href: "#" },
            { name: "iPad Cables", href: "#" },
        ],
    },
    {
        name: "iPhone",
        href: "#",
        childLinks: [
            { name: "Tất cả iPhone", href: "/products/iphone" },
            { name: "iPhone 15 Pro", href: "#" },
            { name: "iPhone 15 Pro Max", href: "#" },
            { name: "iPhone 15", href: "#" },
            { name: "iPhone 15 Plus", href: "#" },
        ],
        accessories: [
            { name: "iPhone Cases", href: "#" },
            { name: "iPhone Screen Protectors", href: "#" },
            { name: "iPhone Chargers", href: "#" },
            { name: "iPhone Cables", href: "#" },
        ],
    },
    {
        name: "AirPods",
        href: "#",
        childLinks: [
            { name: "Tất cả AirPods", href: "/products/airpods" },
            { name: "AirPods Pro", href: "#" },
            { name: "AirPods (3rd generation)", href: "#" },
            { name: "AirPods Max", href: "#" },
        ],
        accessories: [
            { name: "AirPods Case", href: "#" },
            { name: "AirPods Pro Case", href: "#" },
            { name: "AirPods Max Case", href: "#" },
        ],
    },
    {
        name: "Blog",
        href: "/blog",
        childLinks: [
            { name: "Tất cả bài viết", href: "/blog" },
            { name: "Tin tức", href: "/blog?category=1" },
            { name: "Đánh giá sản phẩm", href: "/blog?category=2" },
            { name: "Hướng dẫn", href: "/blog?category=3" },
            { name: "Khuyến mãi", href: "/blog?category=4" },
        ],
    },
    {
        name: "Liên hệ",
        href: "#",
        childLinks: [
            { name: "Hỗ trợ", href: "/support" },
            { name: "Bảo hành", href: "/support" },
            { name: "Đổi trả", href: "/support" },
        ],
    },
];

interface NavbarProps {
    onMenuToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
    const [openMenuIndex, setOpenMenuIndex] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { getCartCount } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const cartCount = getCartCount();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchNavbarCategories = async () => {
            try {
                const response = await fetchCategories();
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchNavbarCategories();
    }, []);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1280);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

    const handleMouseEnter = (index: string) => {
        if (!isMobile) {
            setOpenMenuIndex(index);
            if (onMenuToggle) onMenuToggle(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setOpenMenuIndex(null);
            if (onMenuToggle) onMenuToggle(false);
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        if (onMenuToggle) onMenuToggle(!mobileMenuOpen);
    };

    const toggleMobileSubmenu = (index: string) => {
        if (isMobile) {
            setOpenMenuIndex(openMenuIndex === index ? null : index);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm("");
        }
    };

    return (
        <>
            <nav className="bg-white text-black sticky top-0 z-50">
                <div className="container mx-auto px-4 flex justify-between items-center relative">
                    <div className="xl:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-black focus:outline-none bg-transparent"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="size-6" />
                            ) : (
                                <Bars3Icon className="size-6" />
                            )}
                        </button>
                    </div>

                    <div className="flex-1 xl:flex-none absolute left-1/2 xl:left-0 xl:relative flex justify-center xl:justify-start">
                        <a href="/" className="text-black">
                            <svg
                                height="44"
                                viewBox="0 0 14 44"
                                width="14"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                                    fill="#000000"
                                />
                            </svg>
                        </a>
                    </div>

                    <div className="hidden xl:flex items-center py-0 h-[44px] w-full px-36">
                        <Link
                            to="/"
                            className="text-left h-[44px] flex-1 text-xs h-full flex items-center"
                        >
                            Trang chủ
                        </Link>
                        {categories.map((link, index) => {
                            return (
                                <Menu
                                    as="div"
                                    className="inline-block text-left h-[44px] flex-1"
                                    key={index}
                                    onMouseEnter={() =>
                                        handleMouseEnter(index.toString())
                                    }
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div
                                        className={"flex justify-center w-full"}
                                    >
                                        <MenuButton className="text-xs font-normal focus:outline-none bg-transparent h-[44px]">
                                            {link.name}
                                        </MenuButton>
                                    </div>
                                    <Transition
                                        show={
                                            openMenuIndex === index.toString()
                                        }
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
                                            className="absolute left-1/2 -translate-x-1/2 w-screen origin-top border-t-0 bg-white shadow-lg ring-black/5 focus:outline-none z-[45]"
                                        >
                                            <div
                                                className={
                                                    "flex space-x-24 py-10 max-w-7xl mx-auto"
                                                }
                                            >
                                                <div className={"space-y-4"}>
                                                    <div
                                                        className={
                                                            "text-xs text-gray-500"
                                                        }
                                                    >
                                                        Mua hàng
                                                    </div>
                                                    <div
                                                        className={
                                                            "space-y-2 flex flex-col"
                                                        }
                                                    >
                                                        <a
                                                            href={`/products/${link.id}`}
                                                            key={index}
                                                            className={
                                                                "text-2xl font-semibold hover:underline"
                                                            }
                                                        >
                                                            Khám Phá Tất Cả{" "}
                                                            {link.name}
                                                        </a>
                                                        {link.products.map(
                                                            (
                                                                product,
                                                                index
                                                            ) => (
                                                                <a
                                                                    href={`/product/${link.id}/${product.id}`}
                                                                    key={index}
                                                                    className={
                                                                        "text-2xl font-semibold hover:underline"
                                                                    }
                                                                >
                                                                    {
                                                                        product.name
                                                                    }
                                                                </a>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                {link.accessories &&
                                                    link.accessories.length >
                                                        0 && (
                                                        <div
                                                            className={
                                                                "space-y-4"
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    "text-xs text-gray-500"
                                                                }
                                                            >
                                                                Phụ kiện
                                                            </div>
                                                            <div
                                                                className={
                                                                    "space-y-2 flex flex-col"
                                                                }
                                                            >
                                                                {link.accessories.map(
                                                                    (
                                                                        accessory,
                                                                        index
                                                                    ) => (
                                                                        <a
                                                                            href={
                                                                                accessory.href
                                                                            }
                                                                            key={
                                                                                index
                                                                            }
                                                                            className={
                                                                                "text-xs font-semibold hover:underline"
                                                                            }
                                                                        >
                                                                            {
                                                                                accessory.name
                                                                            }
                                                                        </a>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </MenuItems>
                                    </Transition>
                                </Menu>
                            );
                        })}
                    </div>

                    <div className="flex items-center space-x-12">
                        <button
                            onClick={() => navigate("/search")}
                            aria-label="Search"
                            className="text-black hover:text-gray-700 bg-transparent focus:outline-none px-0"
                        >
                            <MagnifyingGlassIcon className="size-4" />
                        </button>
                        <div className="hidden xl:block">
                            <Menu
                                as="div"
                                id={"user-menu"}
                                className="inline-block text-left"
                                onMouseEnter={() =>
                                    handleMouseEnter("user-menu")
                                }
                                onMouseLeave={handleMouseLeave}
                            >
                                <div>
                                    <MenuButton
                                        aria-label="User Account"
                                        className="hover:text-gray-700 bg-transparent focus:outline-none px-0"
                                    >
                                        <UserIcon className="size-4" />
                                    </MenuButton>
                                </div>
                                <Transition
                                    show={openMenuIndex === "user-menu"}
                                    as={React.Fragment}
                                    enter="transition ease-out duration-500"
                                    enterFrom="transform opacity-0"
                                    enterTo="transform opacity-100"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="transform opacity-100"
                                    leaveTo="transform opacity-0"
                                >
                                    <MenuItems
                                        static
                                        className="absolute right-0 w-80 origin-top-right bg-white shadow-lg focus:outline-none z-40 md:right-auto md:left-1/2 md:-translate-x-1/2 md:w-screen"
                                    >
                                        {isAuthenticated && user ? (
                                            <div className="py-6 md:py-10 px-4 md:px-0 md:max-w-7xl md:mx-auto">
                                                <div className="flex items-start space-x-4 pb-6 border-b border-gray-200">
                                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {user.imageUrl ? (
                                                            <img
                                                                src={
                                                                    user.imageUrl
                                                                }
                                                                alt={
                                                                    user.fullName
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <UserIcon className="w-8 h-8 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {user.fullName ||
                                                                "Người dùng"}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-4 space-y-2">
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/order-history"
                                                                className={`${
                                                                    active
                                                                        ? "bg-gray-50"
                                                                        : ""
                                                                }
                                                                    flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md`}
                                                            >
                                                                <span className="text-base">
                                                                    📦
                                                                </span>
                                                                <span className="ml-3">
                                                                    Đơn hàng
                                                                </span>
                                                            </Link>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/profile"
                                                                className={`${
                                                                    active
                                                                        ? "bg-gray-50"
                                                                        : ""
                                                                }
                                                                    flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md`}
                                                            >
                                                                <span className="text-base">
                                                                    👤
                                                                </span>
                                                                <span className="ml-3">
                                                                    Tài khoản
                                                                </span>
                                                            </Link>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={logout}
                                                                className={`${
                                                                    active
                                                                        ? "bg-gray-50"
                                                                        : ""
                                                                }
                                                                    flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md`}
                                                            >
                                                                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                                                                <span className="ml-3">
                                                                    Đăng xuất
                                                                </span>
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-6 md:py-10 px-4 md:px-0 md:max-w-7xl md:mx-auto flex flex-col space-y-4">
                                                <div
                                                    className={
                                                        "text-xs text-gray-500"
                                                    }
                                                >
                                                    Tài khoản
                                                </div>
                                                <div
                                                    className={
                                                        "flex flex-col space-y-2"
                                                    }
                                                >
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <a
                                                                href="/login"
                                                                className={`${
                                                                    active
                                                                        ? "bg-gray-100 text-gray-900"
                                                                        : "text-gray-700"
                                                                } block text-lg md:text-xl font-semibold w-fit hover:underline`}
                                                            >
                                                                Đăng nhập
                                                            </a>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <a
                                                                href="/register"
                                                                className={`${
                                                                    active
                                                                        ? "bg-gray-100 text-gray-900"
                                                                        : "text-gray-700"
                                                                } block text-lg md:text-xl font-semibold w-fit hover:underline`}
                                                            >
                                                                Đăng ký
                                                            </a>
                                                        )}
                                                    </MenuItem>
                                                </div>
                                            </div>
                                        )}
                                    </MenuItems>
                                </Transition>
                            </Menu>
                        </div>
                        <div className="relative">
                            <Link
                                to={"/cart"}
                                aria-label="Shopping Bag"
                                className="text-black hover:text-gray-700 bg-transparent focus:outline-none"
                            >
                                <ShoppingBagIcon className="size-4" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount > 9 ? "9+" : cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div
                className={`fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-white transform ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out overflow-y-auto`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <a href="/" className="text-black">
                            <svg
                                height="44"
                                viewBox="0 0 14 44"
                                width="14"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                                    fill="#000000"
                                />
                            </svg>
                        </a>
                        <button
                            onClick={toggleMobileMenu}
                            className="text-black focus:outline-none bg-transparent pr-0"
                        >
                            <XMarkIcon className="size-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Mobile Search */}
                        <div className="border-b border-gray-200 pb-6">
                            <form onSubmit={handleSearch} className="relative">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </form>
                        </div>

                        <div className="border-b border-gray-200 pb-6 text-start">
                            {isAuthenticated && user ? (
                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {user.imageUrl ? (
                                                <img
                                                    src={user.imageUrl}
                                                    alt={user.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {user.fullName || "Người dùng"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <a
                                            href="/order-history"
                                            className="flex items-center text-lg font-semibold w-fit hover:underline"
                                        >
                                            <span className="mr-2">📦</span>
                                            Đơn hàng
                                        </a>
                                        <a
                                            href="/profile"
                                            className="flex items-center text-lg font-semibold w-fit hover:underline"
                                        >
                                            <span className="mr-2">👤</span>
                                            Tài khoản
                                        </a>
                                        <button
                                            onClick={logout}
                                            className="flex items-center text-lg font-semibold w-fit hover:underline text-left"
                                        >
                                            <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-xs text-gray-500 mb-4">
                                        Tài khoản
                                    </div>
                                    <div className="space-y-3">
                                        <a
                                            href="/login"
                                            className={`block text-lg md:text-xl font-semibold w-fit hover:underline`}
                                        >
                                            Đăng nhập
                                        </a>
                                        <a
                                            href="/register"
                                            className="block text-lg md:text-xl font-semibold w-fit hover:underline"
                                        >
                                            Đăng ký
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            {navbarParams.map((link, index) => (
                                <div key={index}>
                                    <button
                                        onClick={() =>
                                            toggleMobileSubmenu(
                                                index.toString()
                                            )
                                        }
                                        className="flex justify-between items-center w-full text-left bg-transparent px-0 focus:outline-none"
                                    >
                                        <span className="text-sm font-medium">
                                            {link.name}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${
                                                openMenuIndex ===
                                                index.toString()
                                                    ? "transform rotate-180"
                                                    : ""
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {openMenuIndex === index.toString() && (
                                        <div className="pl-4 space-y-4 text-start border-l border-gray-200 mb-4">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-2">
                                                    Mua hàng
                                                </div>
                                                <div className="space-y-2 flex flex-col w-fit">
                                                    {link.childLinks.map(
                                                        (
                                                            childLink,
                                                            childIndex
                                                        ) => (
                                                            <a
                                                                key={childIndex}
                                                                href={
                                                                    childLink.href
                                                                }
                                                                className="text-2xl font-semibold hover:underline"
                                                            >
                                                                {childLink.name}
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {link.accessories &&
                                                link.accessories.length > 0 && (
                                                    <div className="mt-4">
                                                        <div className="text-xs text-gray-500 mb-2">
                                                            Phụ kiện
                                                        </div>
                                                        <div className="space-y-2 flex flex-col w-fit">
                                                            {link.accessories.map(
                                                                (
                                                                    accessory,
                                                                    accIndex
                                                                ) => (
                                                                    <a
                                                                        key={
                                                                            accIndex
                                                                        }
                                                                        href={
                                                                            accessory.href
                                                                        }
                                                                        className="text-xs font-semibold hover:underline"
                                                                    >
                                                                        {
                                                                            accessory.name
                                                                        }
                                                                    </a>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {openMenuIndex !== null && !isMobile && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-lg"
                    aria-hidden="true"
                    onClick={() => setOpenMenuIndex(null)}
                />
            )}

            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-lg"
                    aria-hidden="true"
                    onClick={toggleMobileMenu}
                />
            )}
        </>
    );
};

export default Navbar;
