import {ArrowUpRightIcon, ChevronRightIcon} from "@heroicons/react/24/outline";
import React from "react";
import AccountInfo from "../components/AccountInfo.tsx";

const ProfilePage: React.FC = () => {
    return (
        <>
            <div className={"bg-gray-100 py-6"}>
                <div className={"container mx-auto space-y-4"}>
                    <div className={"flex justify-between items-center"}>
                        <div className={"text-lg font-semibold"}>Tài khoản</div>
                        <button
                            className={"text-blue-600 text-sm flex gap-1 items-center p-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}>
                            <span>Đăng xuất</span>
                            <ChevronRightIcon className={"size-4"}/>
                        </button>
                    </div>
                    <hr/>
                    <div className={"py-10 text-4xl font-semibold"}>
                        Xin chào, <span>Hiếu</span>!
                    </div>
                </div>
            </div>
            <AccountInfo/>
            <div className={"grid lg:grid-cols-2 grid-cols-1 gap-6 container mx-auto py-12"}>
                <div className={"border p-10 rounded-2xl hover:shadow-lg transition-shadow duration-300 space-y-4"}>
                    <h2 className={"text-4xl font-semibold"}>Đơn hàng của bạn</h2>
                    <div className={"space-y-1"}>
                        <p>Theo dõi, chỉnh sửa, hoặc hủy đơn hàng, hay yêu cầu trả hàng.</p>
                        <button
                            className={"mt-4 flex gap-1 items-center text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"}>
                            <span>Xem lịch sử đơn đặt hàng của tôi</span>
                            <ArrowUpRightIcon className={"size-4"}/>
                        </button>
                    </div>
                </div>
                <div className={"border p-10 rounded-2xl hover:shadow-lg transition-shadow duration-300 space-y-4"}>
                    <h2 className={"text-4xl font-semibold"}>Kiểm soát tài khoản của bạn</h2>
                    <div className={"space-y-1"}>
                        <p>Bạn giữ quyền kiểm soát thông tin cá nhân của mình và có thể quản lý dữ liệu hoặc xóa tài khoản của mình bất cứ lúc nào.</p>
                        <button
                            className={"mt-4 flex gap-1 items-center text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"}>
                            <span>
                                Quản lý quyền riêng tư và bảo mật của bạn
                            </span>
                            <ArrowUpRightIcon className={"size-4"}/>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;