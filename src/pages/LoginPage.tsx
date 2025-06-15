import React, {useState} from 'react';
import {ArrowUpRightIcon, ChevronRightIcon, ExclamationCircleIcon} from "@heroicons/react/24/outline";
import axios from "axios";
import {setAccessToken, setRefreshToken} from "../utils/storage.ts";
import {GoogleLogin} from "@react-oauth/google";

const LoginPage: React.FC = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await handleSubmitLogin();
    };

    const handleSubmitLogin = async () => {
        try {
            const response = await axios.post("http://localhost:8080/api/v1/auth/login", formData);
            if (response.data.success) {
                setAccessToken(response.data.data.accessToken);
                setRefreshToken(response.data.data.refreshToken);
                window.location.href = "/";
                setIsLoading(false);
            }
        } catch (error: any) {
            console.log(error);
            if (error.response.data.error.errors) {
                setErrors(error.response.data.error.errors.map((error: any) => error.message));
            } else {
                setErrors([error.response.data.error.message]);
            }
            setIsLoading(false);
        }
    }

    const handleLoginSuccess = async (credentialResponse: any) => {
        const idToken = credentialResponse.credential;

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/google', {
                token: idToken
            });

            if (response.data.success) {
                setAccessToken(response.data.data.accessToken);
                setRefreshToken(response.data.data.refreshToken);
                window.location.href = "/";
            }

        } catch (error: any) {
            setErrors([error])
        }
    };

    const handleError = () => {
        console.log('Login failed');
    };

    return (
        <>
            <div className={"max-w-7xl mx-auto container text-black"}>
                <div aria-label={"Title"} className={"md:text-5xl text-3xl font-semibold text-start md:py-12 py-6"}>
                    Đăng nhập để thanh toán nhanh hơn.
                </div>
                <div className={"flex w-full h-fit space-x-12"}>
                    <div className={"flex-1 size-full flex flex-col space-y-12"}>
                        <div className={"text-2xl font-semibold text-gray-700"}>Đăng nhập vào Apple Store</div>
                        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleError}/>
                        <div className={"flex items-center"}>
                            <hr className={"border-gray-300 w-full"}/>
                            <span className={"px-4 text-gray-500 text-xs"}>Hoặc</span>
                            <hr className={"border-gray-300 w-full"}/>
                        </div>
                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400"/>
                                <>
                                    {errors.map((error, index) => (
                                        <p key={index} className="text-red-600 text-sm">{error}</p>
                                    ))}
                                </>
                            </div>
                        )}
                        <form onSubmit={handleLogin}>
                            <div className={"relative"} id={"email-container"}>
                                <label htmlFor={"email"}
                                       className={"absolute left-4 top-2 text-xs text-gray-500"}>Email</label>
                                <input type={"email"} id={"email"} name={"email"} required
                                       placeholder={"nguyenvana@example.com"}
                                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                                       onFocus={() => document.getElementById("email-container")?.classList.add("z-10")}
                                       onBlur={() => document.getElementById("email-container")?.classList.remove("z-10")}
                                       className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-b-none rounded-ee-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}/>
                            </div>
                            <div className={"relative top-[-1px] z-0"} id={"password-container"}>
                                <label htmlFor={"password"}
                                       className={"absolute left-4 top-2 text-xs text-gray-500"}>Mật khẩu</label>
                                <input type={"password"} id={"password"} name={"password"} required
                                       placeholder={"nguyenvana"}
                                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                                       onFocus={() => document.getElementById("password-container")?.classList.add("z-10")}
                                       onBlur={() => document.getElementById("password-container")?.classList.remove("z-10")}
                                       className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-ss-none rounded-se-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}/>
                                <button type={"submit"} disabled={isLoading}
                                        className={"p-2 pl-2.5 rounded-full border border-gray-300 absolute right-4 top-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}>
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
                                <span className={"text-gray-500 text-sm"}>Bạn không có tài khoản Apple? </span>
                                <a href={"/register"}
                                   className={"text-blue-500 text-sm hover:underline flex gap-1 items-center"}>
                                    Đăng ký ngay
                                    <ArrowUpRightIcon className={"size-3"}/>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className={"flex-1 size-[35rem] rounded-2xl"} style={{
                        backgroundImage: "url('https://www.apple.com/v/home/ce/images/promos/airpods-4/promo_airpods_4_avail__bl22kvpg6ez6_large_2x.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}>

                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
