import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    Home,
    ShoppingBag,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import paymentService, {
    type PaymentVerificationRequest,
} from "../services/paymentService";

interface PaymentResultData {
    vnp_Amount?: string;
    vnp_BankCode?: string;
    vnp_BankTranNo?: string;
    vnp_CardType?: string;
    vnp_OrderInfo?: string;
    vnp_PayDate?: string;
    vnp_ResponseCode?: string;
    vnp_TmnCode?: string;
    vnp_TransactionNo?: string;
    vnp_TransactionStatus?: string;
    vnp_TxnRef?: string;
    vnp_SecureHash?: string;
}

const PaymentResultPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(true);
    const [paymentData, setPaymentData] = useState<PaymentResultData>({});
    const [verificationResult, setVerificationResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    useEffect(() => {
        // Extract payment data from URL parameters
        const data: PaymentResultData = {};
        searchParams.forEach((value, key) => {
            data[key as keyof PaymentResultData] = value;
        });
        setPaymentData(data);

        // Simulate payment verification (you can replace this with actual API call)
        verifyPayment(data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const verifyPayment = React.useCallback(async (data: PaymentResultData) => {
        try {
            setIsVerifying(true);

            // Prepare verification data
            const verificationData: PaymentVerificationRequest = {
                vnp_Amount: data.vnp_Amount,
                vnp_BankCode: data.vnp_BankCode,
                vnp_BankTranNo: data.vnp_BankTranNo,
                vnp_CardType: data.vnp_CardType,
                vnp_OrderInfo: data.vnp_OrderInfo,
                vnp_PayDate: data.vnp_PayDate,
                vnp_ResponseCode: data.vnp_ResponseCode,
                vnp_TmnCode: data.vnp_TmnCode,
                vnp_TransactionNo: data.vnp_TransactionNo,
                vnp_TransactionStatus: data.vnp_TransactionStatus,
                vnp_TxnRef: data.vnp_TxnRef,
                vnp_SecureHash: data.vnp_SecureHash,
            };

            // Call API to verify payment
            const response = await paymentService.verifyVNPayPayment(
                verificationData
            );

            if (response.success && response.data.isValid) {
                setVerificationResult({
                    success: true,
                    message:
                        response.data.message ||
                        "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.",
                });
            } else {
                setVerificationResult({
                    success: false,
                    message:
                        response.data.message ||
                        getErrorMessage(data.vnp_ResponseCode || ""),
                });
            }
        } catch (error) {
            console.error("Error verifying payment:", error);

            // Fallback to client-side verification if API fails
            if (
                data.vnp_ResponseCode === "00" &&
                data.vnp_TransactionStatus === "00"
            ) {
                setVerificationResult({
                    success: true,
                    message:
                        "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.",
                });
            } else {
                setVerificationResult({
                    success: false,
                    message: getErrorMessage(data.vnp_ResponseCode || ""),
                });
            }
        } finally {
            setIsVerifying(false);
        }
    }, []);

    const getErrorMessage = (responseCode: string): string => {
        const errorMessages: { [key: string]: string } = {
            "01": "Giao dịch chưa hoàn tất",
            "02": "Giao dịch bị lỗi",
            "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
            "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
            "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
            "07": "Giao dịch bị nghi ngờ gian lận",
            "09": "GD Hoàn trả bị từ chối",
            "10": "Đã giao hàng",
            "11": "Đã hủy (GD hoàn tiền)",
            "12": "Đã hủy (GD không hoàn tiền)",
            "13": "Đã hủy, quay lại tạo GD mới",
            "20": "Đã thanh toán (GD thành công)",
            "21": "Đã hoàn trả (GD thành công)",
            "22": "Đã giao hàng (GD thành công)",
            "30": "Chờ thanh toán",
            "31": "Chờ xác nhận",
            "32": "Đã xác nhận",
            "40": "Đã hủy",
            "50": "Đã hoàn trả",
            "24": "Khách hàng hủy giao dịch",
            "51": "Số tiền không đủ để thanh toán",
            "65": "Tài khoản của bạn đã vượt quá hạn mức giao dịch trong ngày",
            "75": "Ngân hàng thanh toán đang bảo trì",
            "79": "KH nhập sai mật khẩu quá số lần quy định",
            "99": "Lỗi không xác định",
        };

        return errorMessages[responseCode] || "Giao dịch không thành công";
    };

    const formatAmount = (amount: string): string => {
        // VNPay amount is in cents, convert to VND
        const amountInVND = parseInt(amount) / 100;
        return amountInVND.toLocaleString("vi-VN") + "đ";
    };

    const formatDateTime = (dateTime: string): string => {
        if (!dateTime || dateTime.length !== 14) return dateTime;

        // Format: YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
        const year = dateTime.substring(0, 4);
        const month = dateTime.substring(4, 6);
        const day = dateTime.substring(6, 8);
        const hour = dateTime.substring(8, 10);
        const minute = dateTime.substring(10, 12);
        const second = dateTime.substring(12, 14);

        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    const getBankName = (bankCode: string): string => {
        const banks: { [key: string]: string } = {
            NCB: "Ngân hàng NCB",
            AGRIBANK: "Ngân hàng Agribank",
            SCB: "Ngân hàng SCB",
            SACOMBANK: "Ngân hàng Sacombank",
            EXIMBANK: "Ngân hàng Eximbank",
            MSBANK: "Ngân hàng MS Bank",
            NAMABANK: "Ngân hàng Nam A Bank",
            VNMART: "Vi MoMo",
            VIETINBANK: "Ngân hàng Vietinbank",
            VIETCOMBANK: "Ngân hàng Vietcombank",
            HDBANK: "Ngân hàng HDBank",
            DONGABANK: "Ngân hàng Dong A Bank",
            TPBANK: "Ngân hàng TPBank",
            OJB: "Ngân hàng OceanBank",
            BIDV: "Ngân hàng BIDV",
            TECHCOMBANK: "Ngân hàng Techcombank",
            VPBANK: "Ngân hàng VPBank",
            MBBANK: "Ngân hàng MBBank",
            ACB: "Ngân hàng ACB",
            OCB: "Ngân hàng OCB",
            IVB: "Ngân hàng IVB",
            VISA: "Thanh toán qua VISA/MASTER",
        };

        return banks[bankCode] || bankCode;
    };

    const getStatusIcon = () => {
        if (isVerifying) {
            return <Loader2 className="h-16 w-16 animate-spin text-blue-600" />;
        }

        if (verificationResult?.success) {
            return <CheckCircle className="h-16 w-16 text-green-600" />;
        } else {
            return <XCircle className="h-16 w-16 text-red-600" />;
        }
    };

    const getStatusColor = () => {
        if (isVerifying) return "text-blue-600";
        return verificationResult?.success ? "text-green-600" : "text-red-600";
    };

    const getStatusTitle = () => {
        if (isVerifying) return "Đang xác thực thanh toán...";
        return verificationResult?.success
            ? "Thanh toán thành công!"
            : "Thanh toán thất bại";
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Status Card */}
                <Card className="mb-8">
                    <CardContent className="pt-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                {getStatusIcon()}
                            </div>
                            <h1
                                className={`text-2xl font-bold mb-2 ${getStatusColor()}`}
                            >
                                {getStatusTitle()}
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {isVerifying
                                    ? "Vui lòng đợi trong giây lát..."
                                    : verificationResult?.message}
                            </p>

                            {!isVerifying && (
                                <div className="flex justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            navigate("/order-history")
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        Xem đơn hàng
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/products/1")}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        Tiếp tục mua sắm
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/")}
                                        className="flex items-center gap-2"
                                    >
                                        <Home className="h-4 w-4" />
                                        Về trang chủ
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Details */}
                {!isVerifying && paymentData.vnp_TransactionNo && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Chi tiết giao dịch
                            </CardTitle>
                            <CardDescription>
                                Thông tin chi tiết về giao dịch thanh toán
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Mã giao dịch
                                    </label>
                                    <p className="text-sm font-mono">
                                        {paymentData.vnp_TransactionNo}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Mã đơn hàng
                                    </label>
                                    <p className="text-sm font-mono">
                                        {paymentData.vnp_TxnRef}
                                    </p>
                                </div>

                                {paymentData.vnp_Amount && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Số tiền
                                        </label>
                                        <p className="text-lg font-semibold text-blue-600">
                                            {formatAmount(
                                                paymentData.vnp_Amount
                                            )}
                                        </p>
                                    </div>
                                )}

                                {paymentData.vnp_PayDate && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Thời gian thanh toán
                                        </label>
                                        <p className="text-sm">
                                            {formatDateTime(
                                                paymentData.vnp_PayDate
                                            )}
                                        </p>
                                    </div>
                                )}

                                {paymentData.vnp_BankCode && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Ngân hàng
                                        </label>
                                        <p className="text-sm">
                                            {getBankName(
                                                paymentData.vnp_BankCode
                                            )}
                                        </p>
                                    </div>
                                )}

                                {paymentData.vnp_CardType && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Loại thẻ
                                        </label>
                                        <Badge variant="outline">
                                            {paymentData.vnp_CardType}
                                        </Badge>
                                    </div>
                                )}

                                {paymentData.vnp_BankTranNo && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500">
                                            Mã giao dịch ngân hàng
                                        </label>
                                        <p className="text-sm font-mono">
                                            {paymentData.vnp_BankTranNo}
                                        </p>
                                    </div>
                                )}

                                {paymentData.vnp_OrderInfo && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500">
                                            Thông tin đơn hàng
                                        </label>
                                        <p className="text-sm">
                                            {decodeURIComponent(
                                                paymentData.vnp_OrderInfo
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;
