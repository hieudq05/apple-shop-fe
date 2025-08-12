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
import AuthService from "@/services/authService";

interface ForgotPasswordDialogProps {
    children: React.ReactNode;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const response = await AuthService.forgotPassword(email);

            if (response.success) {
                setIsSuccess(true);
                setMessage(
                    "Chúng tôi đã gửi đường dẫn khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư."
                );
            } else {
                setIsSuccess(false);
                setMessage(
                    response.message || "Có lỗi xảy ra. Vui lòng thử lại."
                );
            }
        } catch {
            setIsSuccess(false);
            setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset form when dialog closes
            setEmail("");
            setMessage("");
            setIsSuccess(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quên mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập địa chỉ email của bạn để nhận đường dẫn khôi phục
                        mật khẩu.
                    </DialogDescription>
                </DialogHeader>

                {message && (
                    <div
                        className={`px-4 py-3 rounded mb-4 ${
                            isSuccess
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                    >
                        <p className="text-sm">{message}</p>
                    </div>
                )}

                {!isSuccess && (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="col-span-3"
                                    placeholder="nguyenvana@example.com"
                                    required
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
                                {isLoading
                                    ? "Đang gửi..."
                                    : "Gửi đường dẫn khôi phục"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {isSuccess && (
                    <DialogFooter>
                        <Button onClick={() => setIsOpen(false)}>Đóng</Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPasswordDialog;
