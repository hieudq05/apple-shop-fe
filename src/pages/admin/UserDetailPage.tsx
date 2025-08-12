import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, UserIcon } from "@heroicons/react/24/outline";
import userService, { type User } from "../../services/userService";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";

const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUserDetail();
    }, [id]);

    const fetchUserDetail = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await userService.getUserById(parseInt(id));

            if (response.success) {
                setUser(response.data);
            } else {
                setError("Không thể tải thông tin người dùng");
            }
        } catch (error) {
            console.error("Error fetching user detail:", error);
            setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserStatus = async () => {
        if (!user) return;

        setIsUpdating(true);
        try {
            const response = await userService.toggleUserStatus(
                user.id,
                !user.enabled
            );

            if (response.success) {
                setUser((prev) =>
                    prev ? { ...prev, enabled: !prev.enabled } : null
                );
            } else {
                setError("Không thể thay đổi trạng thái người dùng");
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
            setError(
                "Không thể thay đổi trạng thái người dùng. Vui lòng thử lại."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatBirthDate = (dateString: string | null) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const getFullName = (user: User) => {
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        return `${firstName} ${lastName}`.trim() || "--";
    };

    const getRoleText = (roleName: string) => {
        switch (roleName) {
            case "ROLE_USER":
                return "Người dùng";
            case "ROLE_ADMIN":
                return "Quản trị viên";
            case "ROLE_STAFF":
                return "Nhân viên";
            default:
                return roleName;
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-48 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy người dùng
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Người dùng có thể đã bị xóa hoặc không tồn tại.
                    </p>
                    <button
                        onClick={() => navigate("/admin/users")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <Helmet>
                <title>Chi tiết - {getFullName(user)}</title>
                <meta
                    name="description"
                    content={`Chi tiết thông tin người dùng ${getFullName(
                        user
                    )}`}
                />
            </Helmet>
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/5 border rounded-2xl">
                    <p className="text-destructive">{error}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate("/admin/users")}
                        className="p-2 hover:bg-foreground/5 cursor-pointer rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-muted-foreground flex items-center justify-center overflow-hidden">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={getFullName(user)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-6 h-6 text-foreground" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {getFullName(user)}
                            </h1>
                            <p className="text-muted-foreground">
                                ID: {user.id}
                            </p>
                        </div>
                    </div>
                </div>

                {!user.roles.map((role) => role.name === "ROLE_ADMIN") && (
                    <div className="flex items-center space-x-3">
                        <Button
                            variant={"destructive"}
                            onClick={toggleUserStatus}
                            disabled={isUpdating}
                            className={`rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.enabled
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                        >
                            {isUpdating
                                ? "Đang cập nhật..."
                                : user.enabled
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* User Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-foreground/3 rounded-3xl border p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Thông tin cá nhân
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-10">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Họ và tên
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {getFullName(user)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Số điện thoại
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {user.phone || "--"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Ngày sinh
                                        </p>
                                        <p className="font-medium text-foreground">
                                            {formatBirthDate(user.birth)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Vai trò
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {user.roles.map((role, index) => (
                                            <Badge
                                                variant={"secondary"}
                                                key={index}
                                            >
                                                {getRoleText(role.name)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Ngày tham gia
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {user.createdAt
                                            ? formatDate(user.createdAt)
                                            : "--"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Note */}
                    <div className="bg-foreground/3 rounded-3xl border p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Thông tin bổ sung
                        </h2>
                        <div className="bg-blue-500/10 border rounded-lg p-4">
                            <p className="text-blue-500 text-sm">
                                Thông tin đơn hàng, địa chỉ và thống kê chi tiết
                                sẽ được hiển thị khi có API tương ứng.
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Status */}
                <div className="space-y-6">
                    <div className="bg-foreground/3 rounded-3xl border p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Trạng thái tài khoản
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">
                                    Trạng thái
                                </span>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.enabled
                                            ? "bg-green-500/10 text-green-500"
                                            : "bg-red-500/10 text-red-500"
                                    }`}
                                >
                                    {user.enabled ? "Hoạt động" : "Đã khóa"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Số vai trò
                                </span>
                                <span className="text-lg border px-2 rounded-lg bg-foreground text-background font-bold">
                                    {user.roles.length}
                                </span>
                            </div>

                            <div className="text-center p-3 bg-blue-500/10 border rounded-lg">
                                <p className="text-sm text-blue-500">
                                    Thông tin thống kê chi tiết sẽ được bổ sung
                                    khi có API tương ứng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
