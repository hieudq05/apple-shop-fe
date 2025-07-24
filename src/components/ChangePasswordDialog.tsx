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

import { type ChangePasswordData } from "@/services/userService";

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

interface ChangePasswordDialogProps {
    onSave: (passwordData: ChangePasswordData) => Promise<void>;
    children: React.ReactNode;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
    onSave,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<ChangePasswordData>({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
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

    const validatePasswords = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp");
            return false;
        }
        if (formData.newPassword.length < 6) {
            setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
            return false;
        }
        if (formData.oldPassword === formData.newPassword) {
            setErrorMessage("Mật khẩu mới phải khác mật khẩu hiện tại");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(""); // Clear previous error

        if (!validatePasswords()) {
            return;
        }

        setIsLoading(true);

        try {
            await onSave(formData);
            setIsOpen(false);
            // Reset form after successful submission
            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: unknown) {
            console.error("Error changing password:", error);
            // Extract error message from response
            const errorObj = error as ErrorResponse;
            const message =
                errorObj?.response?.data?.error?.message ||
                errorObj?.message ||
                "Có lỗi xảy ra khi đổi mật khẩu";
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
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[475px]">
                <DialogHeader>
                    <DialogTitle>Đổi mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi mật
                        khẩu của bạn.
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
                            <Label
                                htmlFor="oldPassword"
                                className="text-right"
                            >
                                Mật khẩu hiện tại
                            </Label>
                            <Input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                value={formData.oldPassword}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newPassword" className="text-right">
                                Mật khẩu mới
                            </Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Nhập mật khẩu mới"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="confirmPassword"
                                className="text-right"
                            >
                                Xác nhận mật khẩu
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                                minLength={6}
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
                            {isLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordDialog;
