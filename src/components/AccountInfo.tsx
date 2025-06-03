import React from "react";
import {PencilIcon} from "@heroicons/react/24/outline";

export interface AccountInfoProps {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
    country: string;
    avatarUrl?: string;
}

const defaultAccountInfo: AccountInfoProps = {
    id: "1",
    firstName: "Nguyễn",
    lastName: "Hiếu",
    email: "hieu@gmail.com",
    phone: "0123456789",
    address: "123 Đường ABC",
    ward: "Phường 1",
    district: "Quận 1",
    province: "TP.HCM",
    country: "Việt Nam",
    avatarUrl: "https://i.pinimg.com/736x/27/e2/3b/27e23ba70944306a687162bae3ca09d8.jpg"
}

const AccountInfo: React.FC = () => {
    return (
        <div className={"container mx-auto py-12 space-y-10"}>
            <h1 className={"text-4xl py-6 font-semibold"}>Cài đặt tài khoản</h1>
            <div className={"grid lg:grid-cols-5 gap-6 text-lg grid-cols-2"}>
                <h2 className={"text-xl font-semibold col-span-2 lg:col-span-1"}>Thông tin cá nhân</h2>
                <div className={"lg:col-span-2 space-y-2"}>
                    <p className={"font-semibold"}>Ảnh hồ sơ</p>
                    <div className={"relative w-fit"}>
                        <img src={defaultAccountInfo.avatarUrl || "https://via.placeholder.com/150"} alt={"Avatar"}
                             className={"size-32 rounded-full"}/>
                        <button
                            className={"absolute w-fit bottom-0 right-0 p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}>
                            <PencilIcon className={"size-5"}/>
                        </button>
                    </div>
                </div>
                <div className={"lg:col-span-2 space-y-1"}>
                    <p className={"font-semibold"}>Thông tin tài khoản</p>
                    <p>{defaultAccountInfo.firstName} {defaultAccountInfo.lastName}</p>
                    <p>{defaultAccountInfo.email}</p>
                    <p>{defaultAccountInfo.phone}</p>
                    <button
                        className={"text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"}>
                        <span>Chỉnh sửa thông tin</span>
                    </button>
                    <button
                        className={"block text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"}>
                        <span>Đổi mật khẩu</span>
                    </button>
                </div>
            </div>
            <div className={"grid lg:grid-cols-5 gap-6 text-lg grid-cols-2"}>
                <h2 className={"text-xl font-semibold lg:col-span-1 col-span-2"}>Vận chuyển</h2>
                <div className={"lg:col-span-2 space-y-1"}>
                    <p className={"font-semibold"}>Địa chỉ giao hàng</p>
                    <p>{defaultAccountInfo.firstName}</p>
                    <p>{defaultAccountInfo.lastName}</p>
                    <p>{defaultAccountInfo.address},</p>
                    <p>{defaultAccountInfo.ward},</p>
                    <p>{defaultAccountInfo.district},</p>
                    <p>{defaultAccountInfo.province},</p>
                    <p>{defaultAccountInfo.country}</p>
                    <button
                        className={"text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"}>
                        <span>Chỉnh sửa</span>
                    </button>
                </div>
                <div className={"lg:col-span-2 space-y-1"}>
                    <p className={"font-semibold"}>Thông tin liên hệ</p>
                    <p>{defaultAccountInfo.email}</p>
                    <p>{defaultAccountInfo.phone}</p>
                    <button
                        className={"text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"}>
                        <span>Chỉnh sửa</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
export default AccountInfo;