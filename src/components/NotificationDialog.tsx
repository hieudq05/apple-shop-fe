import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface NotificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    actionLabel?: string;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
    isOpen,
    onClose,
    type,
    title,
    message,
    actionLabel = "Đóng",
}) => {
    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case "error":
                return <XCircle className="h-6 w-6 text-red-600" />;
            case "warning":
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
            case "info":
                return <Info className="h-6 w-6 text-blue-600" />;
            default:
                return <Info className="h-6 w-6 text-blue-600" />;
        }
    };

    const getTitleColor = () => {
        switch (type) {
            case "success":
                return "text-green-800";
            case "error":
                return "text-red-800";
            case "warning":
                return "text-yellow-800";
            case "info":
                return "text-blue-800";
            default:
                return "text-blue-800";
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case "success":
                return "bg-green-600 hover:bg-green-700";
            case "error":
                return "bg-red-600 hover:bg-red-700";
            case "warning":
                return "bg-yellow-600 hover:bg-yellow-700";
            case "info":
                return "bg-blue-600 hover:bg-blue-700";
            default:
                return "bg-blue-600 hover:bg-blue-700";
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {getIcon()}
                        <AlertDialogTitle
                            className={`text-lg font-semibold ${getTitleColor()}`}
                        >
                            {title}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        onClick={onClose}
                        className={`${getButtonColor()} text-white`}
                    >
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default NotificationDialog;
