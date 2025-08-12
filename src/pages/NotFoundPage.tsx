import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { fetchCategories, type Category } from "@/services/categoryService";

const NotFoundPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data.data);
            } catch (error) {
                console.error("Error loading categories:", error);
                // Fallback to default categories if API fails
                setCategories([
                    { id: 1, name: "iPhone", description: "", image: "" },
                    { id: 2, name: "Mac", description: "", image: "" },
                    { id: 3, name: "iPad", description: "", image: "" },
                    { id: 4, name: "Apple Watch", description: "", image: "" },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 pb-24">
            <div className="max-w-md w-full text-center">
                {/* Apple Logo */}
                <div className="mb-8">
                    <svg
                        height="80"
                        viewBox="0 0 14 44"
                        width="32"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto"
                    >
                        <path
                            d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                            fill="#000000"
                        />
                    </svg>
                </div>

                {/* 404 Error */}
                <div className="mb-8">
                    <img
                        src="/public/404 Page Not Found.png"
                        className="h-80 object-cover w-full object-center"
                    />
                    <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                        Trang không tồn tại
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm
                        kiếm. Có thể trang đã được di chuyển hoặc không còn tồn
                        tại.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <HomeIcon className="w-5 h-5 mr-2" />
                        Về trang chủ
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Quay lại trang trước
                    </button>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                        Có thể bạn đang tìm kiếm:
                    </h3>
                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-dashed rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {categories?.slice(0, 4).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/products/${category.id}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {category.name}
                                </Link>
                            ))}
                            <Link
                                to="/cart"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Giỏ hàng
                            </Link>
                            <Link
                                to="/support"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Hỗ trợ
                            </Link>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="mt-8 text-sm text-gray-500">
                    <p>Cần hỗ trợ? Liên hệ với chúng tôi:</p>
                    <p className="mt-1">
                        <a
                            href="tel:1900-1234"
                            className="text-blue-600 hover:underline"
                        >
                            1900-1234
                        </a>
                        {" hoặc "}
                        <a
                            href="mailto:support@appleshop.vn"
                            className="text-blue-600 hover:underline"
                        >
                            support@appleshop.vn
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
