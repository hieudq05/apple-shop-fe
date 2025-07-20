import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Định nghĩa các props mà component sẽ nhận
interface ConfirmDialogProps {
    isOpen: boolean;         // Trạng thái đóng/mở dialog
    onClose: () => void;       // Hàm được gọi khi đóng dialog (bằng nút Hủy hoặc click ra ngoài)
    onConfirm: () => void;     // Hàm được gọi khi nhấn nút Xác nhận
    title: string;             // Tiêu đề của dialog
    description: string;       // Nội dung mô tả chi tiết
}

function ConfirmDialog({
                                  isOpen,
                                  onClose,
                                  onConfirm,
                                  title,
                                  description,
                              }: ConfirmDialogProps) {
    // Component này là một "controlled component", nó không tự mở.
    // Nó chỉ hiển thị khi prop `isOpen` là true.
    if (!isOpen) {
        return null;
    }

    return (
        // onOpenChange sẽ được gọi khi người dùng nhấn nút Hủy hoặc click ra ngoài
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Xác nhận</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default ConfirmDialog;