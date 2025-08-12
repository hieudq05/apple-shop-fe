import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import { Home, CheckCircle } from "lucide-react";
import AuthService from "@/services/authService";

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    const validatePasswords = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp");
            return false;
        }
        if (formData.newPassword.length < 6) {
            setErrorMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!validatePasswords()) {
            return;
        }

        if (!token) {
            setErrorMessage("Token không hợp lệ");
            return;
        }

        setIsLoading(true);

        try {
            const response = await AuthService.resetPassword(
                token,
                formData.newPassword,
                formData.confirmPassword
            );

            if (response.success) {
                setIsSuccess(true);
            } else {
                setErrorMessage(
                    response.message || "Có lỗi xảy ra khi đặt lại mật khẩu"
                );
            }
        } catch {
            setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (!token) {
        return null;
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Helmet>
                    <title>Đặt lại mật khẩu thành công - Apple Shop</title>
                </Helmet>
                <div className="max-w-md w-full mx-auto p-6">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Đặt lại mật khẩu thành công!
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Mật khẩu của bạn đã được cập nhật thành công. Bạn có
                            thể đăng nhập với mật khẩu mới.
                        </p>
                        <div className="space-y-3">
                            <Button
                                onClick={() => navigate("/login")}
                                className="w-full"
                            >
                                Đến trang đăng nhập
                            </Button>
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Helmet>
                <title>Đặt lại mật khẩu - Apple Shop</title>
            </Helmet>
            <div className="max-w-md w-full mx-auto p-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Đặt lại mật khẩu
                    </h2>
                    <p className="text-muted-foreground">
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </p>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Nhập mật khẩu mới"
                            required
                            minLength={6}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword">
                            Xác nhận mật khẩu
                        </Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Nhập lại mật khẩu mới"
                            required
                            minLength={6}
                            className="mt-1"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
