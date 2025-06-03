import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {type CartItem, useCart} from '../contexts/CartContext';
import {ChevronDownIcon, ChevronLeftIcon} from "@heroicons/react/24/outline";

interface Province {
    id: string;
    name: string;
}

interface District {
    id: string;
    name: string;
    provinceId: string;
}

interface Ward {
    id: string;
    name: string;
    districtId: string;
}

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const {cartItems, getCartCount} = useCart();
    const [currentStep, setCurrentStep] = useState(1);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    // Step 1 state
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedWard, setSelectedWard] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [selectedAddress, setSelectedAddress] = useState<string>('');

    // Step 2 state
    const [fullName, setFullName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('cod');

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                // Replace with actual API call to fetch provinces
                const response = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
                const data = await response.json();
                setProvinces(data.data);
            } catch (error) {
                console.error('Error fetching provinces:', error);
            }
        };

        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (selectedProvince) {
            const fetchDistricts = async () => {
                try {
                    // Replace with actual API call to fetch districts based on selected province
                    const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvince}.htm`);
                    const data = await response.json();
                    setDistricts(data.data);
                    setSelectedDistrict('');
                    setSelectedWard('');
                    setWards([]);
                } catch (error) {
                    console.error('Error fetching districts:', error);
                }
            };

            fetchDistricts();
        }
    }, [selectedProvince]);

    // Fetch wards when district changes
    useEffect(() => {
        if (selectedDistrict) {
            const fetchWards = async () => {
                try {
                    // Replace with actual API call to fetch wards based on selected district
                    const response = await fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`);
                    const data = await response.json();
                    setWards(data.data);
                    setSelectedWard('');
                } catch (error) {
                    console.error('Error fetching wards:', error);
                }
            };

            fetchWards();
        }
    }, [selectedDistrict]);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProvince(e.target.value);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDistrict(e.target.value);
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWard(e.target.value);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress(e.target.value);
    };

    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(e.target.value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedPhone = e.target.value.replace(/\D/g, '');
        setPhone(formattedPhone);
    };

    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentMethod(e.target.value);
    };

    const openAddressDialog = () => {
        setIsAddressDialogOpen(true);
    };

    const closeAddressDialog = () => {
        setIsAddressDialogOpen(false);
    };

    const handleSaveAddress = () => {
        // Validate address data
        if (!selectedProvince || !selectedDistrict || !selectedWard || !address) {
            alert('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng');
            return;
        }

        const provinceName = provinces.find(p => p.id === selectedProvince)?.name || '';
        const districtName = districts.find(d => d.id === selectedDistrict)?.name || '';
        const wardName = wards.find(w => w.id === selectedWard)?.name || '';

        // Format the full address
        const formattedAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;
        setSelectedAddress(formattedAddress);

        closeAddressDialog();
    };

    const handleNextStep = () => {
        // Validate step 1 data
        if (!selectedAddress) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        setCurrentStep(2);
    };

    const handlePreviousStep = () => {
        setCurrentStep(1);
    };

    const handleSubmitOrder = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate step 2 data
        if (!fullName || !email || !phone) {
            alert('Vui lòng điền đầy đủ thông tin liên hệ');
            return;
        }

        // Create order data
        const orderData = {
            shippingAddress: {
                province: provinces.find(p => p.id === selectedProvince)?.name,
                district: districts.find(d => d.id === selectedDistrict)?.name,
                ward: wards.find(w => w.id === selectedWard)?.name,
                address,
            },
            contactInfo: {
                fullName,
                email,
                phone,
            },
            paymentMethod,
            products: cartItems,
            getCartCount,
        };

        // Send order data to API
        console.log('Order data:', orderData);

        // Redirect to confirmation page or show success message
        alert('Đặt hàng thành công!');
        navigate('/');
    };

    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn trống</h2>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => navigate('/products')}
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="bg-gray-100 text-lg py-5 font-semibold">
                <div className={"container mx-auto"}>Thanh toán</div>
            </h1>
            <div className="container mx-auto py-12 px-4 space-y-12">
                <div className={"flex flex-col space-y-12"}>
                    <div className={"py-12 text-center space-y-10 border-b"}>
                        <h2 className={"text-5xl font-semibold"}>Bạn muốn nhận được hàng bằng cách nào?</h2>
                        <div className={"flex justify-center items-center space-x-1"}>
                            <p>Giao hàng đến:</p>
                            {selectedAddress ? (
                                <div className="flex justify-between items-center">
                                    <button
                                        className="text-blue-600 p-0 focus:outline-none underline underline-offset-2"
                                        onClick={openAddressDialog}
                                    >
                                        {selectedAddress}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-fit p-0 text-blue-600 focus:outline-none underline"
                                    onClick={openAddressDialog}
                                >
                                    Tỉnh/Thành phố
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Step 1: Delivery Address */}
                    {currentStep === 1 && (
                        <div>
                            <div className={"pb-12"}>
                                <h2 className="text-2xl font-semibold mb-4">Còn hàng</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-12">
                                        {cartItems.map((item: CartItem, index: number) => (
                                            <div key={index}
                                                 className="flex gap-4">
                                                <img
                                                    src={item.imageUrl || 'https://via.placeholder.com/50'}
                                                    alt={item.name}
                                                    className="w-[10rem] object-cover aspect-[8/10] rounded-xl"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{item.name} {item.storage.name} {item.color.name}</p>
                                                    <p className="text-xs text-gray-500">Số
                                                        lượng: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={"grid grid-cols-2 gap-6"}>
                                        <h3 className={"text-xl col-span-2"}>Phương thức giao hàng của bạn:</h3>
                                        <button
                                            className={"bg-gray-50 rounded-xl border border-blue-500 text-start flex items-center justify-between p-4 w-full hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"}>
                                            <div>
                                                <div className={"text-gray-500 text-sm"}>Giao hàng hôm nay</div>
                                                <div className={"text-lg"}>
                                                    Dự kiến nhận hàng vào {new Date().toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    weekday: 'short'
                                                })}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={"text-gray-500 text-sm uppercase text-end"}>Miễn phí
                                                </div>
                                            </div>
                                        </button>
                                        <div className={"text-sm space-y-2"}>
                                            <div className={"font-semibold"}>Một số điều cần ghi nhớ:</div>
                                            <ul className={"list-disc list-inside"}>
                                                <li>Đơn vị vận chuyển có thể yêu cầu bạn ký tên khi giao hàng.</li>
                                                <li>Thời gian giao hàng tiêu chuẩn là từ 8 giờ sáng đến 8 giờ tối, từ
                                                    Thứ Hai đến Thứ Bảy.
                                                </li>
                                            </ul>
                                        </div>
                                        <button
                                            className="bg-blue-600 text-white py-3 rounded-xl font-normal w-full hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            onClick={handleNextStep}
                                        >
                                            Tiếp tục đến thông tin thanh toán
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact and Payment Information */}
                    {currentStep === 2 && (
                        <div className="md:col-span-2">
                            <div>
                                <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
                                <form onSubmit={handleSubmitOrder} className="space-y-6">
                                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-6"}>
                                        <div className={"relative"}>
                                            <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">Họ và
                                                tên</label>
                                            <input
                                                type="text"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                                placeholder="Nhập họ và tên"
                                                value={fullName}
                                                onChange={handleFullNameChange}
                                                required
                                            />
                                        </div>

                                        <div className={"relative"}>
                                            <label
                                                className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">Email</label>
                                            <input
                                                type="email"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                                placeholder="Nhập email"
                                                value={email}
                                                onChange={handleEmailChange}
                                                required
                                            />
                                        </div>

                                        <div className={"relative"}>
                                            <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">Số điện
                                                thoại</label>
                                            <input
                                                type="tel"
                                                className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                                placeholder="Nhập số điện thoại"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold mb-4 mt-8">Phương thức thanh toán</h2>
                                        <div className="grid gap-4 2xl:grid-cols-4 md:grid-cols-2 grid-cols-1">
                                            <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${paymentMethod === 'cod' ? 'border-blue-600 text-black bg-blue-50' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    id="cod"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={handlePaymentMethodChange}
                                                    className="size-3.5 cursor-pointer focus:outline-none"
                                                    style={{
                                                        accentColor: '#007bff'
                                                    }}
                                                />
                                                <label htmlFor="cod" className={"cursor-pointer"}>Thanh toán khi nhận
                                                    hàng (COD)</label>
                                            </div>

                                            <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${paymentMethod === 'momo' ? 'border-blue-600 text-black bg-blue-50' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    id="momo"
                                                    name="paymentMethod"
                                                    value="momo"
                                                    checked={paymentMethod === 'momo'}
                                                    onChange={handlePaymentMethodChange}
                                                    className="size-3.5 focus:outline-none cursor-pointer"
                                                    style={{
                                                        accentColor: '#007bff'
                                                    }}
                                                />
                                                <div className={"flex justify-between w-full items-center"}>
                                                    <label htmlFor="momo" className={"cursor-pointer"}>Thanh toán bằng
                                                        MOMO</label>
                                                    <img src={"public/momo_square_pinkbg.svg"} alt={"Momo Logo"}
                                                         className={"size-7 rounded-md"}/>
                                                </div>
                                            </div>

                                            <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${paymentMethod === 'vnpay' ? 'border-blue-600 text-black bg-blue-50' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    id="vnpay"
                                                    name="paymentMethod"
                                                    value="vnpay"
                                                    checked={paymentMethod === 'vnpay'}
                                                    onChange={handlePaymentMethodChange}
                                                    className="size-3.5 focus:outline-none cursor-pointer"
                                                    style={{
                                                        accentColor: '#007bff'
                                                    }}
                                                />
                                                <div className={"flex justify-between w-full items-center"}>
                                                    <label htmlFor="vnpay" className={"cursor-pointer"}>Thanh toán bằng
                                                        VNPAY</label>
                                                    <img
                                                        src={"https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg"}
                                                        alt={"VNPAY Logo"} className={"h-5"}/>
                                                </div>
                                            </div>

                                            <div
                                                className={`flex gap-2 items-center border transition py-4 px-6 rounded-xl ${paymentMethod === 'paypal' ? 'border-blue-600 text-black bg-blue-50' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
                                                <input
                                                    type="radio"
                                                    id="paypal"
                                                    name="paymentMethod"
                                                    value="paypal"
                                                    checked={paymentMethod === 'paypal'}
                                                    onChange={handlePaymentMethodChange}
                                                    className="size-3.5 focus:outline-none cursor-pointer"
                                                    style={{
                                                        accentColor: '#007bff'
                                                    }}
                                                />
                                                <div className={"flex justify-between w-full items-center"}>
                                                    <label htmlFor="paypal" className={"cursor-pointer"}>Thanh toán bằng
                                                        PayPal</label>
                                                    <img
                                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PayPal_logo.svg/500px-PayPal_logo.svg.png"
                                                        alt="PayPal Logo" className={"h-4"}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-6">
                                        <button
                                            type="button"
                                            className="text-gray-700 p-0 flex gap-1 items-center hover:underline focus:outline-none"
                                            onClick={handlePreviousStep}
                                        >
                                            <ChevronLeftIcon className={"size-4 mt-0.5"}/>
                                            Quay lại
                                        </button>

                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-6 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition hover:bg-blue-500"
                                        >
                                            Tiến hành thanh toán
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Address Dialog */}
                {isAddressDialogOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div
                            className="bg-white rounded-3xl py-5 px-5 w-full max-w-2xl h-fit overflow-y-auto space-y-4">
                            <div className="flex flex-col pb-6">
                                <div className={"flex justify-end"}>
                                    <button
                                        className="text-gray-400 w-fit hover:text-gray-600 transition bg-gray-100 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        onClick={closeAddressDialog}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                                <h2 className="text-3xl font-semibold text-center">Chọn địa chỉ giao hàng</h2>
                            </div>

                            <div className="space-y-4 px-20">
                                <div className={"relative"}>
                                    <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">Tỉnh/Thành
                                        phố <span className={"text-red-600"}>*</span></label>
                                    <select
                                        className="w-full text-lg cursor-pointer disabled:cursor-not-allowed px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                        value={selectedProvince}
                                        onChange={handleProvinceChange}
                                    >
                                        <option value="">Chọn Tỉnh/Thành phố</option>
                                        {provinces.map(province => (
                                            <option key={province.id} value={province.id}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className={"size-5 text-gray-500 absolute top-5 right-3"}/>
                                </div>

                                <div className={"relative"}>
                                    <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">Quận/Huyện <span
                                        className={"text-red-600"}>*</span></label>
                                    <select
                                        className="w-full text-lg cursor-pointer disabled:cursor-not-allowed px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:text-gray-500"
                                        value={selectedDistrict}
                                        onChange={handleDistrictChange}
                                        disabled={!selectedProvince}
                                    >
                                        <option value="">Chọn Quận/Huyện</option>
                                        {districts.map(district => (
                                            <option key={district.id} value={district.id}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className={"size-5 text-gray-500 absolute top-5 right-3"}/>
                                </div>

                                <div className={"relative"}>
                                    <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">Phường/Xã <span
                                        className={"text-red-600"}>*</span></label>
                                    <select
                                        className="w-full text-lg cursor-pointer disabled:cursor-not-allowed px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:text-gray-500"
                                        value={selectedWard}
                                        onChange={handleWardChange}
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        {wards.map(ward => (
                                            <option key={ward.id} value={ward.id}>
                                                {ward.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className={"size-5 text-gray-500 absolute top-5 right-3"}/>
                                </div>

                                <div className={"relative"}>
                                    <label className="absolute top-2 left-3 text-gray-500 mb-1 text-xs">Địa chỉ cụ
                                        thể <span className={"text-red-600"}>*</span></label>
                                    <input
                                        type="text"
                                        className="w-full text-lg px-3 pt-6 pb-2 appearance-none border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                        placeholder="Số nhà, tên đường..."
                                        value={address}
                                        onChange={handleAddressChange}
                                    />
                                </div>

                                <div className="flex flex-col items-center pt-4 gap-4">
                                    <button
                                        type="button"
                                        className="bg-blue-600 text-white px-4 py-3 rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition hover:bg-blue-500"
                                        onClick={handleSaveAddress}
                                    >
                                        Lưu địa chỉ
                                    </button>
                                    <button
                                        type="button"
                                        className="p-0 rounded w-fit text-blue-600 hover:underline focus:outline-none focus:underline transition"
                                        onClick={closeAddressDialog}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
