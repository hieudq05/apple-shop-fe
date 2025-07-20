import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type MyInfo, type UpdateMyInfoData } from "@/services/userService";

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

interface EditUserInfoDialogProps {
    userInfo: MyInfo;
    onSave: (updatedInfo: UpdateMyInfoData) => void;
    children: React.ReactNode;
}

const EditUserInfoDialog: React.FC<EditUserInfoDialogProps> = ({
    userInfo,
    onSave,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        phone: userInfo.phone || "",
        birth: userInfo.birth || "",
        image: userInfo.image || "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(""); // Clear previous error

        try {
            await onSave(formData);
            setIsOpen(false);
        } catch (error: unknown) {
            console.error("Error updating user info:", error);
            // Extract error message from response
            const errorObj = error as ErrorResponse;
            const message =
                errorObj?.response?.data?.error?.message ||
                "Có lỗi xảy ra khi cập nhật thông tin";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Reset form data and error message when dialog opens
            setErrorMessage("");
            setFormData({
                firstName: userInfo.firstName || "",
                lastName: userInfo.lastName || "",
                phone: userInfo.phone || "",
                birth: userInfo.birth || "",
                image: userInfo.image || "",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin cá nhân của bạn. Nhấn lưu để hoàn
                        tất.
                    </DialogDescription>
                </DialogHeader>
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">
                                Họ
                            </Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Nhập họ của bạn"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">
                                Tên
                            </Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Nhập tên của bạn"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Số điện thoại
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="birth" className="text-right">
                                Ngày sinh
                            </Label>
                            <Input
                                id="birth"
                                name="birth"
                                type="date"
                                value={formData.birth}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Chọn ngày sinh"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={userInfo.email}
                                className="col-span-3"
                                disabled
                                placeholder="Email không thể thay đổi"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserInfoDialog;
