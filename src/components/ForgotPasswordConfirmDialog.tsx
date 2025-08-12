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
import AuthService from "@/services/authService";
import { useAuth } from "@/hooks/useAuthContext";
import { CheckCircle2 } from "lucide-react";

interface ForgotPasswordConfirmDialogProps {
    children: React.ReactNode;
}

const ForgotPasswordConfirmDialog: React.FC<
    ForgotPasswordConfirmDialogProps
> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const { user } = useAuth();

    const handleConfirm = async () => {
        if (!user?.email) {
            setMessage("Không thể xác định email của người dùng");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const response = await AuthService.forgotPassword(user.email);

            if (response.success) {
                setIsSuccess(true);
                setMessage(
                    "Chúng tôi đã gửi đường dẫn khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để đặt lại mật khẩu."
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
            // Reset state when dialog closes
            setMessage("");
            setIsSuccess(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quên mật khẩu hiện tại?</DialogTitle>
                    <DialogDescription>
                        Chúng tôi sẽ gửi đường dẫn khôi phục mật khẩu đến email:{" "}
                        <strong className="text-foreground">
                            {user?.email}
                        </strong>
                        <br />
                        Bạn có muốn tiếp tục không?
                    </DialogDescription>
                </DialogHeader>

                {message && (
                    <div
                        className={`px-4 py-3 rounded-2xl mb-4 ${
                            isSuccess
                                ? "bg-foreground/5 border text-green-500"
                                : "bg-red-50 border border-red-200 text-red-700"
                        }`}
                    >
                        <p className="text-sm">{message}</p>
                    </div>
                )}

                {!isSuccess ? (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
                        >
                            {isLoading ? "Đang gửi..." : "Gửi email khôi phục"}
                        </Button>
                    </DialogFooter>
                ) : (
                    <DialogFooter>
                        <Button onClick={() => setIsOpen(false)}>Đóng</Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPasswordConfirmDialog;
