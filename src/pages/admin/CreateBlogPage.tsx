import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    EyeIcon,
    CloudArrowUpIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";
import blogService from "../../services/blogService";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { X } from "lucide-react";
import MarkdownEditor from "@/components/MarkdownEditor.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import MarkdownRenderer from "@/components/MarkdownRenderer.tsx";
import { Helmet } from "react-helmet-async";

interface BlogForm {
    title: string;
    content: string;
    thumbnail: string;
    isPublished: boolean;
}

const CreateBlogPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<BlogForm>({
        title: "",
        content: "",
        thumbnail: "",
        isPublished: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");

    // File upload handlers
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh hợp lệ");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file không được vượt quá 5MB");
            return;
        }

        setIsUploading(true);
        const uploadToast = toast.loading("Đang tải ảnh lên...", {
            duration: Infinity,
        });

        try {
            // Simulate file upload - replace with your actual upload logic
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Create preview URL
            const imageUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, thumbnail: imageUrl }));

            toast.dismiss(uploadToast);
            toast.success("Tải ảnh lên thành công!");
        } catch (error) {
            toast.dismiss(uploadToast);
            toast.error("Lỗi khi tải ảnh lên");
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlChange = (url: string) => {
        setFormData((prev) => ({ ...prev, thumbnail: url }));
    };

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url);
            return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài viết");
            return;
        }

        if (!formData.content.trim()) {
            toast.error("Vui lòng nhập nội dung bài viết");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Đang tạo bài viết...", {
            duration: Infinity,
        });

        try {
            await blogService.createBlog({
                title: formData.title,
                content: formData.content,
                thumbnail: formData.thumbnail || undefined,
                isPublished: formData.isPublished,
            });

            toast.dismiss(loadingToast);
            toast.success("Tạo bài viết thành công!");
            navigate("/admin/blog");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Có lỗi xảy ra khi tạo bài viết");
            console.error("Create blog error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === "s") {
                    e.preventDefault();
                    const form = document.querySelector("form");
                    if (form) {
                        form.requestSubmit();
                    }
                }
            }
            if (e.key === "Escape") {
                navigate("/admin/blog");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [navigate]);

    return (
        <div className="min-h-screen py-8">
            <Helmet>
                <title>Tạo bài viết mới - Apple</title>
                <meta
                    name="description"
                    content="Tạo và quản lý bài viết blog của bạn"
                />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Tạo bài viết mới
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Tạo và xuất bản bài viết mới cho blog của bạn
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    showPreview
                                        ? "bg-blue-600 text-foreground hover:bg-blue-700"
                                        : ""
                                }`}
                            >
                                <EyeIcon className="w-4 h-4 inline" />
                                {showPreview ? "Ẩn xem trước" : "Xem trước"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div
                    className={`grid gap-8 ${
                        showPreview ? "lg:grid-cols-3" : "lg:grid-cols-1"
                    }`}
                >
                    {/* Form Panel */}
                    <div
                        className={
                            showPreview ? "lg:col-span-2" : "lg:col-span-1"
                        }
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-foreground/3 p-6 rounded-2xl shadow-sm border">
                                <h2 className="text-lg font-semibold text-foreground mb-4">
                                    Thông tin cơ bản
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Tiêu đề bài viết{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                            placeholder="Nhập tiêu đề bài viết"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Trạng thái
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <Input
                                                    type="radio"
                                                    name="isPublished"
                                                    checked={
                                                        !formData.isPublished
                                                    }
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            isPublished: false,
                                                        }))
                                                    }
                                                    className="mr-2 size-4"
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    Bản nháp
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <Input
                                                    type="radio"
                                                    name="isPublished"
                                                    checked={
                                                        formData.isPublished
                                                    }
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            isPublished: true,
                                                        }))
                                                    }
                                                    className="mr-2 size-4"
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    Xuất bản ngay
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail */}
                            <div className="bg-foreground/3 p-6 rounded-2xl shadow-sm border">
                                <h2 className="text-lg font-semibold text-foreground mb-4">
                                    Ảnh đại diện
                                </h2>

                                <div className="space-y-4">
                                    {/* Upload Method Selector */}
                                    <div className="flex space-x-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setUploadMethod("url")
                                            }
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                uploadMethod === "url"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            Nhập URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setUploadMethod("file")
                                            }
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                uploadMethod === "file"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            Tải file lên
                                        </button>
                                    </div>

                                    {uploadMethod === "url" ? (
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                URL ảnh đại diện
                                            </label>
                                            <Input
                                                type="url"
                                                value={formData.thumbnail}
                                                onChange={(e) =>
                                                    handleUrlChange(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleFileSelect}
                                                disabled={isUploading}
                                                className="w-full cursor-pointer h-48 border-2 border-dashed rounded-2xl hover:border-blue-400 hover:bg-foreground/5 bg-foreground/3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="text-center">
                                                    <CloudArrowUpIcon className="size-20 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground mb-1">
                                                        {isUploading
                                                            ? "Đang tải lên..."
                                                            : "Chọn ảnh để tải lên"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/50">
                                                        PNG, JPG, GIF (tối đa
                                                        5MB)
                                                    </p>
                                                </div>
                                            </Button>
                                        </div>
                                    )}

                                    {/* Image Preview */}
                                    {formData.thumbnail ? (
                                        <div className="relative">
                                            <img
                                                src={formData.thumbnail}
                                                alt="Preview"
                                                className="w-full aspect-video object-cover rounded-2xl"
                                                onError={(e) => {
                                                    e.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        thumbnail: "",
                                                    }))
                                                }
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className={"size-4"} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
                                            <div className="text-center">
                                                <PhotoIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                                                <p className="text-muted-foreground">
                                                    Chưa có ảnh đại diện
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-foreground/3 p-6 rounded-2xl shadow-sm border">
                                <h2 className="text-lg font-semibold text-foreground mb-4">
                                    Nội dung bài viết
                                </h2>

                                <div>
                                    <MarkdownEditor
                                        value={formData.content}
                                        onChange={(value) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                content: value,
                                            }));
                                        }}
                                        height={500}
                                        placeholder="Nhập nội dung bài viết..."
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Hỗ trợ Markdown: **bold**, *italic*,
                                        [link](url), ![image](url)
                                    </p>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="bg-foreground/3 p-6 rounded-2xl shadow-sm border">
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                    >
                                        {isLoading
                                            ? "Đang tạo..."
                                            : formData.isPublished
                                            ? "Tạo và xuất bản"
                                            : "Lưu bản nháp"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/blog")}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="bg-foreground/3 p-6 rounded-2xl shadow-sm border sticky top-6">
                                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                    Xem trước
                                </h2>

                                <div className="space-y-4">
                                    {formData.thumbnail && (
                                        <img
                                            src={formData.thumbnail}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    )}

                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">
                                            {formData.title ||
                                                "Tiêu đề bài viết"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {new Date().toLocaleDateString(
                                                "vi-VN"
                                            )}{" "}
                                            •
                                            <Badge
                                                variant={"outline"}
                                                className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                                                    formData.isPublished
                                                        ? "bg-green-500/10 text-green-500"
                                                        : "bg-yellow-500/10 text-yellow-500"
                                                }`}
                                            >
                                                {formData.isPublished
                                                    ? "Sẽ xuất bản"
                                                    : "Bản nháp"}
                                            </Badge>
                                        </p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-muted-foreground mb-2">
                                            Nội dung:
                                        </h4>
                                        <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto">
                                            {formData.content ? (
                                                <MarkdownRenderer
                                                    content={formData.content.substring(
                                                        0,
                                                        200
                                                    )}
                                                />
                                            ) : (
                                                <p className="italic">
                                                    Chưa có nội dung
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateBlogPage;
