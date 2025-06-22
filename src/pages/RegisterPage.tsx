import React, { useState } from 'react';
import { ArrowUpRightIcon, ChevronRightIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import type { RegisterRequest, ApiResponse, OtpResponse } from '../types/api';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<RegisterRequest>({
        firstName: '',
        lastName: '',
        birth: '',
        email: '',
        phone: '',
        password: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);

        // Validate passwords match
        if (formData.password !== confirmPassword) {
            setErrors(['Mật khẩu xác nhận không khớp']);
            setIsLoading(false);
            return;
        }

        // Validate age (must be 18+)
        const birthDate = new Date(formData.birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            setErrors(['Bạn phải đủ 18 tuổi để đăng ký']);
            setIsLoading(false);
            return;
        }

        await handleSubmitRegister();
    };

    const handleSubmitRegister = async () => {
        try {
            const response = await axios.post<ApiResponse<OtpResponse>>(
                "http://localhost:8080/api/v1/auth/register", 
                formData
            );
            
            if (response.data.success) {
                // Navigate to OTP verification page with email
                navigate('/verify-otp', { 
                    state: { 
                        email: formData.email,
                        expiredIn: response.data.data?.expiredIn || 300
                    } 
                });
            }
        } catch (error: any) {
            console.log(error);
            if (error.response?.data?.error?.errors) {
                setErrors(error.response.data.error.errors.map((err: any) => err.message));
            } else {
                setErrors([error.response?.data?.error?.errorMessage || error.response?.data?.message || 'Đăng ký thất bại']);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async (credentialResponse: any) => {
        const idToken = credentialResponse.credential;

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/google', {
                token: idToken
            });

            if (response.data.success) {
                // Google registration successful, redirect to home
                navigate("/");
            }
        } catch (error: any) {
            setErrors([error.response?.data?.message || 'Đăng ký bằng Google thất bại']);
        }
    };

    const handleError = () => {
        console.log('Google registration failed');
    };

    return (
        <>
            <div className={"max-w-7xl mx-auto container text-black"}>
                <div aria-label={"Title"} className={"md:text-5xl text-3xl font-semibold text-start md:py-12 py-6"}>
                    Tạo tài khoản Apple Store của bạn.
                </div>
                <div className={"flex w-full h-fit space-x-12"}>
                    <div className={"flex-1 size-full flex flex-col space-y-12"}>
                        <div className={"text-2xl font-semibold text-gray-700"}>Đăng ký tài khoản mới</div>
                        <GoogleLogin onSuccess={handleGoogleRegister} onError={handleError}/>
                        <div className={"flex items-center"}>
                            <hr className={"border-gray-300 w-full"}/>
                            <span className={"px-4 text-gray-500 text-xs"}>Hoặc</span>
                            <hr className={"border-gray-300 w-full"}/>
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
                        <form onSubmit={handleRegister} className="space-y-0">
                            {/* First Name and Last Name */}
                            <div className="flex">
                                <div className={"relative flex-1"} id={"firstName-container"}>
                                    <label htmlFor={"firstName"} className={"absolute left-4 top-2 text-xs text-gray-500"}>
                                        Họ
                                    </label>
                                    <input 
                                        type={"text"} 
                                        id={"firstName"} 
                                        name={"firstName"} 
                                        required
                                        placeholder={"Nguyễn"}
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        onFocus={() => document.getElementById("firstName-container")?.classList.add("z-10")}
                                        onBlur={() => document.getElementById("firstName-container")?.classList.remove("z-10")}
                                        className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-b-none rounded-ee-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}
                                    />
                                </div>
                                <div className={"relative flex-1 top-0 left-[-1px] z-0"} id={"lastName-container"}>
                                    <label htmlFor={"lastName"} className={"absolute left-4 top-2 text-xs text-gray-500"}>
                                        Tên
                                    </label>
                                    <input 
                                        type={"text"} 
                                        id={"lastName"} 
                                        name={"lastName"} 
                                        required
                                        placeholder={"Văn A"}
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        onFocus={() => document.getElementById("lastName-container")?.classList.add("z-10")}
                                        onBlur={() => document.getElementById("lastName-container")?.classList.remove("z-10")}
                                        className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-b-none rounded-ss-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}
                                    />
                                </div>
                            </div>
                            
                            {/* Birth Date */}
                            <div className={"relative top-[-1px] z-0"} id={"birth-container"}>
                                <label htmlFor={"birth"} className={"absolute left-4 top-2 text-xs text-gray-500"}>
                                    Ngày sinh
                                </label>
                                <input 
                                    type={"date"} 
                                    id={"birth"} 
                                    name={"birth"} 
                                    required
                                    value={formData.birth}
                                    onChange={(e) => setFormData({...formData, birth: e.target.value})}
                                    onFocus={() => document.getElementById("birth-container")?.classList.add("z-10")}
                                    onBlur={() => document.getElementById("birth-container")?.classList.remove("z-10")}
                                    className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}
                                />
                            </div>

                            {/* Email */}
                            <div className={"relative top-[-1px] z-0"} id={"email-container"}>
                                <label htmlFor={"email"} className={"absolute left-4 top-2 text-xs text-gray-500"}>
                                    Email
                                </label>
                                <input 
                                    type={"email"} 
                                    id={"email"} 
                                    name={"email"} 
                                    required
                                    placeholder={"nguyenvana@example.com"}
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    onFocus={() => document.getElementById("email-container")?.classList.add("z-10")}
                                    onBlur={() => document.getElementById("email-container")?.classList.remove("z-10")}
                                    className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}
                                />
                            </div>

                            {/* Phone */}
                            <div className={"relative top-[-1px] z-0"} id={"phone-container"}>
                                <label htmlFor={"phone"} className={"absolute left-4 top-2 text-xs text-gray-500"}>
                                    Số điện thoại
                                </label>
                                <input 
                                    type={"tel"} 
                                    id={"phone"} 
                                    name={"phone"} 
                                    required
                                    placeholder={"0123456789"}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    onFocus={() => document.getElementById("phone-container")?.classList.add("z-10")}
                                    onBlur={() => document.getElementById("phone-container")?.classList.remove("z-10")}
                                    className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}
                                />
                            </div>

                            {/* Password */}
                            <div className={"relative top-[-1px] z-0"} id={"password-container"}>
                                <label htmlFor={"password"} className={"absolute left-4 top-2 text-xs text-gray-500"}>
                                    Mật khẩu
                                </label>
                                <input 
                                    type={"password"} 
                                    id={"password"} 
                                    name={"password"} 
                                    required
                                    placeholder={"Mật khẩu của bạn"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    onFocus={() => document.getElementById("password-container")?.classList.add("z-10")}
                                    onBlur={() => document.getElementById("password-container")?.classList.remove("z-10")}
                                    className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className={"relative top-[-1px] z-0"} id={"confirmPassword-container"}>
                                <label htmlFor={"confirmPassword"} className={"absolute left-4 top-2 text-xs text-gray-500"}>
                                    Xác nhận mật khẩu
                                </label>
                                <input 
                                    type={"password"} 
                                    id={"confirmPassword"} 
                                    name={"confirmPassword"} 
                                    required
                                    placeholder={"Nhập lại mật khẩu"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => document.getElementById("confirmPassword-container")?.classList.add("z-10")}
                                    onBlur={() => document.getElementById("confirmPassword-container")?.classList.remove("z-10")}
                                    className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-ss-none rounded-se-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}
                                />
                                <button 
                                    type={"submit"} 
                                    disabled={isLoading}
                                    className={"p-2 pl-2.5 rounded-full border border-gray-300 absolute right-4 top-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"}
                                >
                                    <ChevronRightIcon className={"size-6"}/>
                                </button>
                            </div>
                        </form>
                        <div className={"flex flex-col space-y-2 items-center"}>
                            <div className={"flex items-center gap-1"}>
                                <span className={"text-gray-500 text-sm"}>Bạn đã có tài khoản Apple? </span>
                                <a href={"/login"}
                                   className={"text-blue-500 text-sm hover:underline flex gap-1 items-center"}>
                                    Đăng nhập ngay
                                    <ArrowUpRightIcon className={"size-3"}/>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className={"flex-1 size-[35rem] rounded-2xl"} style={{
                        backgroundImage: "url('https://www.apple.com/v/home/ce/images/promos/iphone-15-pro/promo_iphone15pro_avail__c70xiphx7fau_large_2x.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
