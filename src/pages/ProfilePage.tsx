import {
    ArrowUpRightIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import React, {useEffect} from "react";
import AccountInfo from "../components/AccountInfo.tsx";
import UserReviews from "../components/UserReviews.tsx";
import type {MyInfo} from "@/services/userService.ts";
import userService from "@/services/userService.ts";
import { useAuth } from "@/hooks/useAuthContext.ts";

const ProfilePage: React.FC = () => {
    const [myInfo, setMyInfo] = React.useState<MyInfo | null>(null);

    const fetchMyInfo = async () => {
        try {
            const response = await userService.getMe();
            if (response.success) {
                setMyInfo(response.data);
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    const handleUserInfoUpdate = (updatedInfo: MyInfo) => {
        setMyInfo(updatedInfo);
    };

    const callBackUpdateUserInfo = (updatedInfo: Partial<MyInfo>) => {
        if (myInfo) {
            setMyInfo({
                ...myInfo,
                ...updatedInfo,
            });
        }
    };

    useEffect(() => {
        fetchMyInfo();
    }, []);

    return (
        <>
            <div className={"bg-muted py-6"}>
                <div className={"container mx-auto space-y-4"}>
                    <div className={"flex justify-between items-center"}>
                        <div className={"text-lg font-semibold"}>Tài khoản</div>
                        <button
                            onClick={async () =>
                                await logout()
                            }
                            className={
                                "text-blue-600 text-sm flex gap-1 items-center p-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                            }
                        >
                            <span>Đăng xuất</span>
                            <ChevronRightIcon className={"size-4"}/>
                        </button>
                    </div>
                    <hr/>
                    <div className={"py-10 text-4xl font-semibold"}>
                        Xin chào, <span>{myInfo?.lastName}</span>!
                    </div>
                </div>
            </div>
            {myInfo && (
                <AccountInfo
                    firstName={myInfo.firstName}
                    image={myInfo.image}
                    lastName={myInfo.lastName}
                    phone={myInfo.phone}
                    email={myInfo.email}
                    id={myInfo.id}
                    birth={myInfo.birth}
                    onUserInfoUpdate={handleUserInfoUpdate}
                    callBack={callBackUpdateUserInfo}
                />
            )}

            <div
                className={
                    "grid lg:grid-cols-2 grid-cols-1 gap-6 container mx-auto py-12"
                }
            >
                <div
                    className={
                        "border p-10 rounded-2xl hover:shadow-lg transition-shadow duration-300 space-y-4"
                    }
                >
                    <h2 className={"text-4xl font-semibold"}>
                        Đơn hàng của bạn
                    </h2>
                    <div className={"space-y-1"}>
                        <p>
                            Theo dõi, chỉnh sửa, hoặc hủy đơn hàng, hay yêu cầu
                            trả hàng.
                        </p>
                        <a
                            href="/order-history"
                            className={
                                "mt-4 flex gap-1 items-center text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"
                            }
                        >
                            <span>Xem lịch sử đơn đặt hàng của tôi</span>
                            <ArrowUpRightIcon className={"size-4"}/>
                        </a>
                    </div>
                </div>
                <div
                    className={
                        "border p-10 rounded-2xl hover:shadow-lg transition-shadow duration-300 space-y-4"
                    }
                >
                    <h2 className={"text-4xl font-semibold"}>
                        Kiểm soát tài khoản của bạn
                    </h2>
                    <div className={"space-y-1"}>
                        <p>
                            Bạn giữ quyền kiểm soát thông tin cá nhân của mình
                            và có thể quản lý dữ liệu hoặc xóa tài khoản của
                            mình bất cứ lúc nào.
                        </p>
                        <button
                            className={
                                "mt-4 flex gap-1 items-center text-blue-600 hover:underline font-normal p-0 focus:outline-none focus:shadow-outline"
                            }
                        >
                            <span>
                                Quản lý quyền riêng tư và bảo mật của bạn
                            </span>
                            <ArrowUpRightIcon className={"size-4"}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* User Reviews Section */}
            {/*<div className="container mx-auto py-8">*/}
            {/*    <UserReviews/>*/}
            {/*</div>*/}
        </>
    );
};

export default ProfilePage;
