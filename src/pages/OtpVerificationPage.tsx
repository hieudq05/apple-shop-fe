import React, { useState, useEffect } from "react";
import {
    ChevronRightIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";
import { setAccessToken, setRefreshToken } from "../utils/storage";
import type {
    OtpValidationRequest,
    ApiResponse,
    AuthenticationResponse,
} from "../types/api";

const OtpVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Get email and expiredIn from navigation state
    const email = location.state?.email;
    const expiredIn = location.state?.expiredIn || 300;

    useEffect(() => {
        if (!email) {
            navigate("/register");
            return;
        }

        setTimeLeft(expiredIn);
    }, [email, expiredIn, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);

        if (otp.length !== 6) {
            setErrors(["Mã OTP phải có 6 chữ số"]);
            setIsLoading(false);
            return;
        }

        try {
            const verifyData: OtpValidationRequest = {
                email: email,
                otp: otp,
            };

            const response = await axios.post<
                ApiResponse<AuthenticationResponse>
            >("http://localhost:8080/api/v1/auth/register/verify", verifyData);

            if (response.data.success && response.data.data) {
                // Store tokens
                setAccessToken(response.data.data.accessToken);
                setRefreshToken(response.data.data.refreshToken);

                // Update auth context
                login(
                    response.data.data.accessToken,
                    response.data.data.refreshToken
                );

                // Navigate to home page
                navigate("/");
            }
        } catch (error: any) {
            console.log(error);
            if (error.response?.data?.error?.errors) {
                setErrors(
                    error.response.data.error.errors.map(
                        (err: any) => err.message
                    )
                );
            } else {
                setErrors([
                    error.response?.data?.error?.errorMessage ||
                        error.response?.data?.message ||
                        "Xác thực OTP thất bại",
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        setErrors([]);

        try {
            const response = await axios.post(
                "http://localhost:8080/api/v1/otp/send",
                {
                    email: email,
                }
            );

            if (response.data.success) {
                setTimeLeft(300); // Reset timer to 5 minutes
                setCanResend(false);
                setOtp(""); // Clear current OTP input
            }
        } catch (error: any) {
            setErrors([
                error.response?.data?.message || "Gửi lại mã OTP thất bại",
            ]);
        } finally {
            setIsResending(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    return (
        <>
            <div className={"max-w-7xl mx-auto container text-black"}>
                <div
                    aria-label={"Title"}
                    className={
                        "md:text-5xl text-3xl font-semibold text-start md:py-12 py-6"
                    }
                >
                    Xác thực email của bạn.
                </div>
                <div className={"flex w-full h-fit space-x-12"}>
                    <div
                        className={"flex-1 size-full flex flex-col space-y-12"}
                    >
                        <div className={"text-2xl font-semibold text-gray-700"}>
                            Nhập mã xác thực
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                            <div>
                                <p className="text-blue-800 text-sm">
                                    Chúng tôi đã gửi mã xác thực 6 chữ số đến
                                    email:
                                </p>
                                <p className="text-blue-900 font-semibold text-sm">
                                    {email}
                                </p>
                            </div>
                        </div>

                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                                <div>
                                    {errors.map((error, index) => (
                                        <p
                                            key={index}
                                            className="text-red-600 text-sm"
                                        >
                                            {error}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp}>
                            <div className={"relative"} id={"otp-container"}>
                                <label
                                    htmlFor={"otp"}
                                    className={
                                        "absolute left-4 top-2 text-xs text-gray-500"
                                    }
                                >
                                    Mã xác thực (6 chữ số)
                                </label>
                                <input
                                    type={"text"}
                                    id={"otp"}
                                    name={"otp"}
                                    required
                                    placeholder={"123456"}
                                    value={otp}
                                    onChange={handleOtpChange}
                                    maxLength={6}
                                    onFocus={() =>
                                        document
                                            .getElementById("otp-container")
                                            ?.classList.add("z-10")
                                    }
                                    onBlur={() =>
                                        document
                                            .getElementById("otp-container")
                                            ?.classList.remove("z-10")
                                    }
                                    className={
                                        "w-full text-lg text-start px-4 pb-3 pt-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition text-center tracking-widest font-mono"
                                    }
                                />
                                <button
                                    type={"submit"}
                                    disabled={isLoading || otp.length !== 6}
                                    className={
                                        "p-2 pl-2.5 rounded-full border border-gray-300 absolute right-4 top-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
                                    }
                                >
                                    <ChevronRightIcon className={"size-6"} />
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-col items-center space-y-4">
                            {timeLeft > 0 ? (
                                <div className="text-gray-600 text-sm">
                                    Mã sẽ hết hạn sau:{" "}
                                    <span className="font-mono font-semibold">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-red-600 text-sm font-semibold">
                                    Mã xác thực đã hết hạn
                                </div>
                            )}

                            <button
                                onClick={handleResendOtp}
                                disabled={!canResend || isResending}
                                className={`text-sm font-semibold transition ${
                                    canResend && !isResending
                                        ? "text-blue-500 hover:underline cursor-pointer"
                                        : "text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {isResending
                                    ? "Đang gửi..."
                                    : "Gửi lại mã xác thực"}
                            </button>
                        </div>

                        <div className={"flex flex-col space-y-2 items-center"}>
                            <div className={"flex items-center gap-1"}>
                                <span className={"text-gray-500 text-sm"}>
                                    Bạn muốn thay đổi email?{" "}
                                </span>
                                <button
                                    onClick={() => navigate("/register")}
                                    className={
                                        "text-blue-500 text-sm hover:underline"
                                    }
                                >
                                    Quay lại đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        className={"flex-1 size-[35rem] rounded-2xl"}
                        style={{
                            backgroundImage:
                                "url('https://www.apple.com/v/home/ce/images/promos/iphone-15-pro/promo_iphone15pro_avail__c70xiphx7fau_large_2x.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    ></div>
                </div>
            </div>
        </>
    );
};

export default OtpVerificationPage;
