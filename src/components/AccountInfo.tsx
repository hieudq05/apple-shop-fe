import React, { useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import userService, {
    type MyInfo,
    type UpdateMyInfoData,
    type ChangePasswordData,
} from "@/services/userService";
import EditUserInfoDialog from "./EditUserInfoDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";
import ShippingAddressDialog from "./ShippingAddressDialog";

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

interface AccountInfoComponentProps extends MyInfo {
    onUserInfoUpdate?: (updatedInfo: MyInfo) => void;
    callBack?: (updatedInfo: UpdateMyInfoData) => void;
}

const AccountInfo: React.FC<AccountInfoComponentProps> = ({
    email,
    image,
    firstName,
    lastName,
    phone,
    id,
    birth,
    onUserInfoUpdate,
    callBack,
}) => {
    // State để quản lý dữ liệu hiển thị local
    const [displayInfo, setDisplayInfo] = useState<MyInfo>({
        email,
        image,
        firstName,
        lastName,
        phone,
        birth,
        id,
    });

    const handleUpdateUserInfo = async (updatedInfo: UpdateMyInfoData) => {
        try {
            const response = await userService.updateMyInfo(updatedInfo);
            if (response.success) {
                console.log("Thông tin đã được cập nhật thành công!");

                // Cập nhật dữ liệu hiển thị local
                setDisplayInfo((prev) => ({
                    ...prev,
                    ...updatedInfo,
                    // Đảm bảo các field bắt buộc không bị undefined
                    firstName: updatedInfo.firstName || prev.firstName,
                    lastName: updatedInfo.lastName || prev.lastName,
                    phone: updatedInfo.phone || prev.phone,
                    birth: updatedInfo.birth || prev.birth,
                    image: updatedInfo.image || prev.image,
                }));

                // Gọi callback để cập nhật data ở parent component
                if (onUserInfoUpdate && response.data) {
                    onUserInfoUpdate(response.data);
                }

                // Gọi callback bổ sung nếu có
                if (callBack) {
                    callBack(updatedInfo);
                }
            } else {
                // Throw error with response message if update failed
                throw new Error(response.message || "Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Error updating user info:", error);
            throw error; // Re-throw để dialog có thể catch và hiển thị error
        }
    };

    const handleChangePassword = async (passwordData: ChangePasswordData) => {
        try {
            const response = await userService.changePassword(passwordData);
            if (response.success) {
                console.log("Mật khẩu đã được thay đổi thành công!");
                // Có thể thêm thông báo thành công ở đây
            } else {
                throw new Error(response.message || "Đổi mật khẩu thất bại");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            throw error; // Re-throw để dialog có thể catch và hiển thị error
        }
    };

    const currentUserInfo: MyInfo = displayInfo;

    return (
        <div className={"container mx-auto py-12 space-y-10"}>
            <h1 className={"text-4xl py-6 font-semibold"}>Cài đặt tài khoản</h1>
            <div className={"grid lg:grid-cols-5 gap-6 text-lg grid-cols-2"}>
                <h2
                    className={"text-xl font-semibold col-span-2 lg:col-span-1"}
                >
                    Thông tin cá nhân
                </h2>
                <div className={"lg:col-span-2 space-y-2"}>
                    <p className={"font-semibold"}>Ảnh hồ sơ</p>
                    <div className={"relative w-fit"}>
                        <img
                            src={displayInfo.image}
                            alt={"Avatar"}
                            className={
                                "size-32 rounded-full object-cover object-center"
                            }
                        />
                        <button
                            className={
                                "absolute w-fit bottom-0 right-0 p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                            }
                        >
                            <PencilIcon className={"size-5"} />
                        </button>
                    </div>
                </div>
                <div className={"lg:col-span-2 space-y-1"}>
                    <p className={"font-semibold"}>Thông tin tài khoản</p>
                    <p>
                        {displayInfo.firstName} {displayInfo.lastName}
                    </p>
                    <p>
                        {/* format: "dd-MM-yyyy", */}
                        {displayInfo.birth
                            ? new Date(displayInfo.birth).toLocaleDateString(
                                  "vi-VN"
                              )
                            : ""}
                    </p>
                    <p>{displayInfo.email}</p>
                    <p>{displayInfo.phone}</p>
                    <EditUserInfoDialog
                        userInfo={currentUserInfo}
                        onSave={handleUpdateUserInfo}
                    >
                        <button
                            className={
                                "text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"
                            }
                        >
                            <span>Chỉnh sửa thông tin</span>
                        </button>
                    </EditUserInfoDialog>
                    <ChangePasswordDialog onSave={handleChangePassword}>
                        <button
                            className={
                                "block text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"
                            }
                        >
                            <span>Đổi mật khẩu</span>
                        </button>
                    </ChangePasswordDialog>
                </div>
            </div>
            <div className={"grid lg:grid-cols-5 gap-6 text-lg grid-cols-2"}>
                <h2
                    className={"text-xl font-semibold lg:col-span-1 col-span-2"}
                >
                    Vận chuyển
                </h2>
                <div className={"lg:col-span-2 space-y-1"}>
                    <p className={"font-semibold"}>Địa chỉ giao hàng</p>
                    <p>Bạn có địa chỉ giao hàng đã lưu</p>
                    <ShippingAddressDialog>
                        <button
                            className={
                                "text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"
                            }
                        >
                            <span>Quản lý</span>
                        </button>
                    </ShippingAddressDialog>
                </div>
            </div>
        </div>
    );
};
export default AccountInfo;
