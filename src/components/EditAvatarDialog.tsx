import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { UpdateMyInfoData } from "@/services/userService";

interface EditAvatarDialogProps {
    children: React.ReactNode;
    currentImage?: string;
    currentInfo: UpdateMyInfoData;
    onSave: (imageFile: File | null, updateInfo: UpdateMyInfoData) => Promise<void>;
}

const EditAvatarDialog: React.FC<EditAvatarDialogProps> = ({
    children,
    currentImage,
    currentInfo,
    onSave,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh!');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB!');
                return;
            }

            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave(selectedFile, currentInfo);
            setIsOpen(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
            alert('Có lỗi xảy ra khi cập nhật ảnh. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset to current state
        setSelectedImage(currentImage || null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa ảnh hồ sơ</DialogTitle>
                    <DialogDescription>
                        Chọn ảnh mới cho hồ sơ của bạn. Kích thước tối đa: 5MB.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current/Preview Image */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt="Avatar preview"
                                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            
                            {selectedImage && (
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-1 right-1 flex justify-center items-center p-1 bg-red-500 text-white cursor-pointer rounded-full hover:bg-red-600 transition-colors"
                                    type="button"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* File Input */}
                    <div className="space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="avatar-upload"
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            <PhotoIcon className="w-5 h-5 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-600">
                                Chọn ảnh từ thiết bị
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 text-center">
                            Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang lưu..." : "Lưu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditAvatarDialog;
