import React, { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightStartOnRectangleIcon,
    InboxStackIcon,
    HeartIcon,
} from "@heroicons/react/24/outline";
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
} from "@headlessui/react";
import { useCart } from "@/contexts/CartContext.tsx";
import { useAuth } from "@/hooks/useAuthContext.ts";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories, type Category } from "@/services/categoryService.ts";
import { useTheme } from "@/components/theme-provider";

interface NavbarProps {
    onMenuToggle?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
    const [openMenuIndex, setOpenMenuIndex] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { getCartCount } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const cartCount = getCartCount();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchNavbarCategories = async () => {
            try {
                const response = await fetchCategories();
                setCategories(response.data || []);
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

    return (
        <>
            <nav className="bg-background text-foreground sticky top-0 z-50">
                <div className="container mx-auto px-4 flex justify-between items-center relative h-12">
                    <div className="xl:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-foreground cursor-pointer focus:outline-none bg-transparent"
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
                        <a href="/" className="text-foreground">
                            <svg
                                height="44"
                                viewBox="0 0 14 44"
                                width="14"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                                    fill={
                                        theme === "dark"
                                            ? "#ffffff"
                                            : theme === "light"
                                            ? "#000000"
                                            : new Date().getHours() >= 6 &&
                                              new Date().getHours() <= 18
                                            ? "#000000"
                                            : "#ffffff"
                                    }
                                />
                            </svg>
                        </a>
                    </div>

                    <div className="hidden xl:flex items-center py-0 h-[44px] w-full px-36">
                        <a
                            href="/"
                            className="text-left h-[44px] flex-1 text-xs flex items-center"
                        >
                            Trang chủ
                        </a>
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
                                            className="absolute left-1/2 -translate-x-1/2 w-screen origin-top border-t-0 bg-background shadow-lg ring-black/5 focus:outline-none z-[45]"
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
                                                {/* {link.accessories &&
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
                                                    )} */}
                                            </div>
                                        </MenuItems>
                                    </Transition>
                                </Menu>
                            );
                        })}
                        <a
                            href="/blog"
                            className="justify-center h-[44px] flex-1 text-xs flex items-center"
                        >
                            Newsroom
                        </a>
                    </div>

                    <div className="flex items-center space-x-12">
                        <button
                            onClick={() => navigate("/search")}
                            aria-label="Search"
                            className="text-foreground bg-transparent focus:outline-none px-0"
                        >
                            <MagnifyingGlassIcon className="size-4" />
                        </button>
                        <div className="hidden xl:block">
                            <Menu
                                as="div"
                                id={"user-menu"}
                                className="inline-block text-left mt-1"
                                onMouseEnter={() =>
                                    handleMouseEnter("user-menu")
                                }
                                onMouseLeave={handleMouseLeave}
                            >
                                <div>
                                    <MenuButton
                                        aria-label="User Account"
                                        className="bg-transparent focus:outline-none px-0"
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
                                        className="absolute right-0 w-80 origin-top-right bg-background shadow-lg focus:outline-none z-40 md:right-auto md:left-1/2 md:-translate-x-1/2 md:w-screen"
                                    >
                                        {isAuthenticated && user ? (
                                            <div className="py-6 md:py-10 px-4 md:px-0 md:max-w-7xl md:mx-auto flex flex-col items-end">
                                                <div className="flex items-start space-x-4">
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
                                                        <div className="text-lg font-semibold text-foreground">
                                                            {user.fullName ||
                                                                "Người dùng"}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <MenuItem>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/order-history"
                                                                className={`${
                                                                    active
                                                                        ? "bg-gray-50"
                                                                        : ""
                                                                }
                                                                    flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md`}
                                                            >
                                                                <span className="text-base">
                                                                    <InboxStackIcon className="w-4 h-4" />
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
                                                                to="/saved-products"
                                                                className={`${
                                                                    active
                                                                        ? "bg-gray-50"
                                                                        : ""
                                                                }
                                                                    flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md`}
                                                            >
                                                                <span className="text-base">
                                                                    <HeartIcon className="w-4 h-4" />
                                                                </span>
                                                                <span className="ml-3">
                                                                    Yêu thích
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
                                                                    flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md`}
                                                            >
                                                                <span className="text-base">
                                                                    <UserIcon className="w-4 h-4" />
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
                                                                onClick={async () =>
                                                                    await logout()
                                                                }
                                                                className={`cursor-pointer ${
                                                                    active
                                                                        ? "bg-gray-50"
                                                                        : ""
                                                                }
                                                                    flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md`}
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
                                                                        ? "bg-gray-100 text-foreground"
                                                                        : "text-foreground"
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
                                                                        ? "bg-gray-100 text-foreground"
                                                                        : "text-foreground"
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
                                className="text-foreground bg-transparent focus:outline-none"
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
                className={`fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-background transform ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out overflow-y-auto`}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <a href="/public" className="text-foreground">
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
                            className="text-foreground focus:outline-none bg-transparent pr-0"
                        >
                            <XMarkIcon className="size-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Mobile Search */}
                        <div className="border-b pb-6">
                            <Link
                                to="/search"
                                className="flex bg-foreground/5 px-4 py-3 rounded-lg transition items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5" />
                                <span>Tìm kiếm sản phẩm...</span>
                            </Link>
                        </div>

                        <div className="border-b pb-6 text-start">
                            {isAuthenticated && user ? (
                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                                            {user.imageUrl ? (
                                                <img
                                                    src={user.imageUrl}
                                                    alt={user.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground">
                                                {user.fullName || "Người dùng"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <a
                                            href="/order-history"
                                            className="flex items-center text-lg font-semibold w-fit hover:underline"
                                        >
                                            <InboxStackIcon className="w-5 h-5 mr-2" />
                                            Đơn hàng
                                        </a>
                                        <a
                                            href="/saved-products"
                                            className="flex items-center text-lg font-semibold w-fit hover:underline"
                                        >
                                            <HeartIcon className="w-5 h-5 mr-2" />
                                            Yêu thích
                                        </a>
                                        <a
                                            href="/profile"
                                            className="flex items-center text-lg font-semibold w-fit hover:underline"
                                        >
                                            <UserIcon className="w-5 h-5 mr-2" />
                                            Tài khoản
                                        </a>
                                        <button
                                            onClick={async () => await logout()}
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
                            {categories.map((link, index) => (
                                <div key={index}>
                                    <button
                                        onClick={() =>
                                            toggleMobileSubmenu(
                                                index.toString()
                                            )
                                        }
                                        className="flex justify-between items-center w-full text-left bg-transparent px-0 focus:outline-none py-3"
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
                                        <div className="pl-4 space-y-4 text-start border-l mb-4 py-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-2">
                                                    Mua hàng
                                                </div>
                                                <div className="space-y-2 flex flex-col w-fit">
                                                    <a
                                                        href={`/products/${link.id}`}
                                                        className="text-lg font-semibold hover:underline"
                                                    >
                                                        Khám Phá Tất Cả{" "}
                                                        {link.name}
                                                    </a>
                                                    {link.products &&
                                                        link.products.map(
                                                            (
                                                                product,
                                                                productIndex
                                                            ) => (
                                                                <a
                                                                    key={
                                                                        productIndex
                                                                    }
                                                                    href={`/product/${link.id}/${product.id}`}
                                                                    className="text-lg font-semibold hover:underline"
                                                                >
                                                                    {
                                                                        product.name
                                                                    }
                                                                </a>
                                                            )
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Static navigation items */}
                            <div className="border-t pt-4 mt-6">
                                <a
                                    href="/blog"
                                    className="block py-3 text-sm font-medium"
                                >
                                    Newsroom
                                </a>
                                <a
                                    href="/support"
                                    className="block py-3 text-sm font-medium"
                                >
                                    Hỗ trợ
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {openMenuIndex !== null && !isMobile && (
                <div
                    className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-lg"
                    aria-hidden="true"
                    onClick={() => setOpenMenuIndex(null)}
                />
            )}

            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-lg"
                    aria-hidden="true"
                    onClick={toggleMobileMenu}
                />
            )}
        </>
    );
};

export default Navbar;
