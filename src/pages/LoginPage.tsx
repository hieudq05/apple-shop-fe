import React from 'react';
import Navbar from "../components/layout/Navbar.tsx";
import {Button} from "@headlessui/react";
import {ArrowUpRightIcon, ChevronRightIcon} from "@heroicons/react/24/outline";

const LoginPage: React.FC = () => {
    return (
        <>
            <Navbar/>
            <div className={"max-w-7xl mx-auto container text-black"}>
                <div aria-label={"Title"} className={"md:text-5xl text-3xl font-semibold text-start md:py-12 py-6"}>
                    Đăng nhập để thanh toán nhanh hơn.
                </div>
                <div className={"flex w-full h-fit space-x-12"}>
                    <div className={"flex-1 size-full flex flex-col space-y-12"}>
                        <div className={"text-2xl font-semibold text-gray-700"}>Đăng nhập vào Apple Store</div>
                        <Button
                            className={"flex gap-4 justify-center items-center rounded-xl bg-gray-50 py-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}>
                            <img
                                src={"https://www.gstatic.com/marketing-cms/assets/images/82/9c/5e08f4b14c35b84be1821d200793/about-10things-google.png=s64-fcrop64=1,00000000ffffffff-rw"}
                                className={"size-5"} alt={"Google Logo"}/>
                            Đăng nhập bằng Google
                        </Button>
                        <div className={"flex items-center"}>
                            <hr className={"border-gray-300 w-full"}/>
                            <span className={"px-4 text-gray-500 text-xs"}>Hoặc</span>
                            <hr className={"border-gray-300 w-full"}/>
                        </div>
                        <form action={"#"} method={"POST"}>
                            <div className={"relative"} id={"email-container"}>
                                <label htmlFor={"email"}
                                       className={"absolute left-4 top-2 text-xs text-gray-500"}>Email</label>
                                <input type={"email"} id={"email"} name={"email"} required
                                       placeholder={"nguyenvana@example.com"}
                                       onFocus={() => document.getElementById("email-container")?.classList.add("z-10")}
                                       onBlur={() => document.getElementById("email-container")?.classList.remove("z-10")}
                                       className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-b-none rounded-ee-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}/>
                            </div>
                            <div className={"relative top-[-1px] z-0"} id={"password-container"}>
                                <label htmlFor={"password"}
                                       className={"absolute left-4 top-2 text-xs text-gray-500"}>Mật khẩu</label>
                                <input type={"password"} id={"password"} name={"password"} required
                                       placeholder={"nguyenvana"}
                                       onFocus={() => document.getElementById("password-container")?.classList.add("z-10")}
                                       onBlur={() => document.getElementById("password-container")?.classList.remove("z-10")}
                                       className={"w-full text-lg px-4 pb-3 pt-6 border border-gray-300 rounded-xl rounded-ss-none rounded-se-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}/>
                                <button type={"submit"} className={"p-2 pl-2.5 rounded-full border border-gray-300 absolute right-4 top-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"}>
                                    <ChevronRightIcon className={"size-6"}/>
                                </button>
                            </div>
                        </form>
                        <div className={"flex flex-col space-y-2 items-center"}>
                            <a href={"#"} className={"text-blue-500 text-sm hover:underline flex gap-1 items-center w-fit"}>
                                Bạn đã quên mật khẩu?
                                <ArrowUpRightIcon className={"size-3"}/>
                            </a>
                            <div className={"flex items-center gap-1"}>
                                <span className={"text-gray-500 text-sm"}>Bạn không có tài khoản Apple? </span>
                                <a href={"#"} className={"text-blue-500 text-sm hover:underline flex gap-1 items-center"}>
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
