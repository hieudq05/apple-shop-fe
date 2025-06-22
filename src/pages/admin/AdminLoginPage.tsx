import React, { useState } from 'react';
import { ArrowUpRightIcon, ChevronRightIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { setAccessToken, setRefreshToken } from "../../utils/storage";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminLoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);

        await handleSubmitLogin();
    };

    const handleSubmitLogin = async () => {
        try {
            const response = await axios.post("http://localhost:8080/api/v1/auth/login", formData);
            if (response.data.success) {
                const accessToken = response.data.data.accessToken;
                const refreshToken = response.data.data.refreshToken;

                // Store tokens
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);

                // Update auth context
                login(accessToken, refreshToken);

                // Navigate to admin dashboard (ProtectedRoute will handle role checking)
                navigate("/admin/dashboard");
            }
        } catch (error: any) {
            console.log(error);
            if (error.response?.data?.error?.errors) {
                setErrors(error.response.data.error.errors.map((error: any) => error.message));
            } else {
                setErrors([error.response?.data?.error?.errorMessage || error.response?.data?.message || 'Đăng nhập thất bại']);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={"h-full flex items-center justify-center"}>
            <div className={"max-w-xl mx-auto my-auto container text-black"}>
                <div aria-label={"Title"} className={"md:text-5xl text-4xl font-semibold text-start pb-6"}>
                    Đăng nhập vào trang quản trị.
                </div>
                <div className={"flex w-full h-fit justify-center"}>
                    <div className={"flex-1 size-full flex flex-col space-y-12"}>
                        <div className={"text-2xl font-semibold text-gray-700"}>Đăng nhập quản trị viên</div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-white text-xs font-bold">!</span>
                            </div>
                            <div>
                                <p className="text-blue-800 text-sm font-semibold">
                                    Trang dành cho quản trị viên
                                </p>
                                <p className="text-blue-700 text-sm">
                                    Chỉ tài khoản có quyền quản trị mới có thể truy cập
                                </p>
                            </div>
                        </div>

                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400"/>
                                <div>
                                    {errors.map((error, index) => (
                                        <p key={index} className="text-red-600 text-sm">{error}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <form onSubmit={handleLogin}>
                            <div className={"relative"} id={"email-container"}>
                                <label htmlFor={"email"}
                                       className={"absolute left-4 top-2 text-xs text-gray-500"}>Email</label>
                                <input type={"email"} id={"email"} name={"email"} required
                                       placeholder={"admin@appleshop.com"}
                                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                                       onFocus={() => document.getElementById("email-container")?.classList.add("z-10")}
                                       onBlur={() => document.getElementById("email-container")?.classList.remove("z-10")}
                                       className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-b-none rounded-ee-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}/>
                            </div>
                            <div className={"relative top-[-1px] z-0"} id={"password-container"}>
                                <label htmlFor={"password"}
                                       className={"absolute left-4 top-2 text-xs text-gray-500"}>Mật khẩu</label>
                                <input type={"password"} id={"password"} name={"password"} required
                                       placeholder={"Mật khẩu quản trị"}
                                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                                       onFocus={() => document.getElementById("password-container")?.classList.add("z-10")}
                                       onBlur={() => document.getElementById("password-container")?.classList.remove("z-10")}
                                       className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-ss-none rounded-se-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}/>
                                <button type={"submit"} disabled={isLoading}
                                        className={"p-2 pl-2.5 rounded-full border border-gray-300 absolute right-4 top-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"}>
                                    <ChevronRightIcon className={"size-6"}/>
                                </button>
                            </div>
                        </form>
                        
                        <div className={"flex flex-col space-y-2 items-center"}>
                            <a href={"#"}
                               className={"text-blue-500 text-sm hover:underline flex gap-1 items-center w-fit"}>
                                Bạn đã quên mật khẩu?
                                <ArrowUpRightIcon className={"size-3"}/>
                            </a>
                            <div className={"flex items-center gap-1"}>
                                <span className={"text-gray-500 text-sm"}>Quay lại trang chủ? </span>
                                <a href={"/"}
                                   className={"text-blue-500 text-sm hover:underline flex gap-1 items-center"}>
                                    Trang chủ
                                    <ArrowUpRightIcon className={"size-3"}/>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
