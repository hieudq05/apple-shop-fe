import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowLeftIcon,
    EyeIcon,
    CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import blogService, { type Blog } from "../../services/blogService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Trash } from "lucide-react";
import MarkdownEditor from "@/components/MarkdownEditor.tsx";
import { Helmet } from "react-helmet-async";

interface BlogForm {
    title: string;
    content: string;
    thumbnail: string;
    isPublished: boolean;
}

const EditBlogPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [originalBlog, setOriginalBlog] = useState<Blog | null>(null);
    const [formData, setFormData] = useState<BlogForm>({
        title: "",
        content: "",
        thumbnail: "",
        isPublished: false,
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch actual blog data from API
            const response = await blogService.getBlogById(parseInt(id || "1"));

            if (response.success && response.data) {
                const blog = response.data;

                // Convert Blog to BlogForm
                const blogFormData: BlogForm = {
                    title: blog.title,
                    content: blog.content || "",
                    thumbnail: blog.thumbnail || "",
                    isPublished: blog.isPublished,
                };

                setFormData(blogFormData);
                setOriginalBlog(blog);
            } else {
                toast.error("Không thể tải dữ liệu bài viết");
                navigate("/admin/blog");
            }
        } catch (error) {
            console.error("Error loading blog data:", error);
            toast.error("Có lỗi xảy ra khi tải dữ liệu bài viết");
            navigate("/admin/blog");
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Track changes for better UX
    useEffect(() => {
        if (originalBlog) {
            const hasFormChanges =
                formData.title !== originalBlog.title ||
                formData.content !== (originalBlog.content || "") ||
                formData.isPublished !== originalBlog.isPublished ||
                formData.thumbnail !== (originalBlog.thumbnail || "");
            setHasChanges(hasFormChanges);
        }
    }, [formData, originalBlog]);

    // Warn user about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasChanges]);

    // Form validation
    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài viết");
            return false;
        }

        if (!formData.content.trim()) {
            toast.error("Vui lòng nhập nội dung bài viết");
            return false;
        }

        if (formData.thumbnail && !isValidUrl(formData.thumbnail)) {
            toast.error("URL ảnh đại diện không hợp lệ");
            return false;
        }

        return true;
    };

    const isValidUrl = (string: string): boolean => {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    };

    // File upload handlers
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("Vui lòng chỉ chọn file ảnh");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước file không được vượt quá 5MB");
                return;
            }

            setThumbnailFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            handleInputChange("thumbnail", previewUrl);
        }
    };

    const handleRemoveImage = () => {
        setThumbnailFile(null);
        handleInputChange("thumbnail", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Event handlers
    const handleInputChange = useCallback(
        (field: keyof BlogForm, value: string | boolean) => {
            setFormData((prev) => {
                // Prevent unnecessary updates
                if (prev[field] === value) return prev;

                return {
                    ...prev,
                    [field]: value,
                };
            });
        },
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading("Đang cập nhật bài viết...", {
            duration: Infinity,
        });

        try {
            // Prepare the blog update request object
            const updateBlogRequest = {
                title: formData.title,
                content: formData.content,
                thumbnail: thumbnailFile ? undefined : formData.thumbnail, // Set undefined if file upload, otherwise use URL
                isPublished: formData.isPublished,
            };

            // Call actual API to update blog with data and file separately
            const response = await blogService.updateBlog(
                parseInt(id || "1"),
                updateBlogRequest,
                thumbnailFile
            );

            if (response.success) {
                // Update local state immediately for better UX
                const updatedBlog: Blog = {
                    ...originalBlog!,
                    title: formData.title,
                    content: formData.content,
                    thumbnail: formData.thumbnail,
                    isPublished: formData.isPublished,
                    updatedAt: new Date().toISOString(),
                };

                setOriginalBlog(updatedBlog);
                setThumbnailFile(null); // Clear file after successful upload

                toast.dismiss(loadingToast);
                toast.success("Bài viết đã được cập nhật thành công!");

                // Navigate back to blog list
                navigate("/admin/blog");
            } else {
                toast.dismiss(loadingToast);
                toast.error(
                    response.msg || "Có lỗi xảy ra khi cập nhật bài viết!"
                );
            }
        } catch (error) {
            console.error("Error updating blog post:", error);
            toast.dismiss(loadingToast);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi cập nhật bài viết!"
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save functionality (optional) - Fixed to prevent infinite loops
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleAutoSave = useCallback(async () => {
        if (!hasChanges || isSaving) return;

        try {
            const autoSaveRequest = {
                title: formData.title,
                content: formData.content,
                thumbnail: thumbnailFile ? undefined : formData.thumbnail,
                isPublished: formData.isPublished,
            };

            await blogService.updateBlog(
                parseInt(id || "1"),
                autoSaveRequest,
                thumbnailFile
            );

            toast.success("Đã tự động lưu", { duration: 2000 });
        } catch (error) {
            console.error("Auto-save failed:", error);
        }
    }, [
        formData.title,
        formData.content,
        formData.thumbnail,
        formData.isPublished,
        hasChanges,
        isSaving,
        id,
        thumbnailFile,
    ]);

    // Auto-save every 30 seconds when there are changes - Fixed dependencies
    useEffect(() => {
        if (hasChanges && !isSaving) {
            // Clear existing timeout
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            // Set new timeout
            autoSaveTimeoutRef.current = setTimeout(() => {
                handleAutoSave();
            }, 30000); // 30 seconds
        }

        // Cleanup function
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
                autoSaveTimeoutRef.current = null;
            }
        };
    }, [hasChanges, isSaving, handleAutoSave]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                if (hasChanges && !isSaving) {
                    const form = document.querySelector("form");
                    if (form) {
                        form.dispatchEvent(
                            new Event("submit", {
                                bubbles: true,
                                cancelable: true,
                            })
                        );
                    }
                }
            }

            // Escape to cancel/go back
            if (e.key === "Escape" && !isSaving) {
                if (hasChanges) {
                    const confirmLeave = confirm(
                        "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?"
                    );
                    if (!confirmLeave) return;
                }
                navigate("/admin/blog");
            }
        };

        document.addEventListener("keydown", handleKeyboard);
        return () => document.removeEventListener("keydown", handleKeyboard);
    }, [hasChanges, isSaving, navigate]);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <Helmet>
                <title>Chỉnh sửa bài viết - Apple</title>
                <meta
                    name="description"
                    content="Chỉnh sửa thông tin bài viết, nội dung và ảnh đại diện"
                />
            </Helmet>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (hasChanges) {
                                const confirmLeave = confirm(
                                    "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?"
                                );
                                if (!confirmLeave) return;
                            }
                            navigate("/admin/blog");
                        }}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Chỉnh sửa bài viết
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>ID: {id}</span>
                            {originalBlog && (
                                <>
                                    <span>•</span>
                                    <span>
                                        Tác giả: {originalBlog.author.firstName}{" "}
                                        {originalBlog.author.lastName}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Cập nhật:{" "}
                                        {new Date(
                                            originalBlog.updatedAt
                                        ).toLocaleDateString("vi-VN")}
                                    </span>
                                    <span>•</span>
                                    <Badge
                                        variant={"outline"}
                                        className={`${
                                            originalBlog.isPublished
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-yellow-500/10 text-yellow-500"
                                        }`}
                                    >
                                        {originalBlog.isPublished
                                            ? "Đã xuất bản"
                                            : "Bản nháp"}
                                    </Badge>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        <span className="inline-flex items-center">
                            Ctrl+S để lưu • Esc để hủy
                        </span>
                    </div>
                    <Button
                        variant={"outline"}
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <EyeIcon className="w-4 h-4" />
                        {showPreview ? "Ẩn xem trước" : "Xem trước"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div
                    className={`${
                        showPreview ? "lg:col-span-2" : "lg:col-span-3"
                    } space-y-6`}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-foreground/3 p-6 rounded-2xl shadow-sm border">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                Thông tin bài viết
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Tiêu đề bài viết *
                                    </label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Ảnh đại diện
                                    </label>

                                    {/* URL Input */}
                                    <div className="space-y-3">
                                        <Input
                                            type="url"
                                            placeholder="Nhập URL ảnh hoặc upload file bên dưới"
                                            value={
                                                thumbnailFile
                                                    ? ""
                                                    : formData.thumbnail
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "thumbnail",
                                                    e.target.value
                                                )
                                            }
                                            disabled={!!thumbnailFile}
                                        />

                                        <div className="text-center">
                                            <span className="text-sm text-gray-500">
                                                hoặc
                                            </span>
                                        </div>

                                        {/* File Upload */}
                                        <div className="flex items-center gap-3">
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                disabled={isSaving}
                                            >
                                                <CloudArrowUpIcon className="w-4 h-4" />
                                                {isSaving
                                                    ? "Đang tải..."
                                                    : "Chọn file ảnh"}
                                            </Button>

                                            {(formData.thumbnail ||
                                                thumbnailFile) && (
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="px-3 py-2 text-destructive hover:text-destructive rounded-lg transition-colors"
                                                >
                                                    <Trash
                                                        className={"size-5"}
                                                    />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    {formData.thumbnail && (
                                        <div className="mt-3">
                                            <img
                                                src={formData.thumbnail}
                                                alt="Preview"
                                                className="w-full aspect-video object-cover rounded-lg border"
                                                onError={(e) => {
                                                    e.currentTarget.style.display =
                                                        "none";
                                                    toast.error(
                                                        "Không thể tải ảnh. Vui lòng kiểm tra URL."
                                                    );
                                                }}
                                            />
                                            {thumbnailFile && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    File: {thumbnailFile.name} (
                                                    {(
                                                        thumbnailFile.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="checkbox"
                                        id="isPublished"
                                        checked={formData.isPublished}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "isPublished",
                                                e.target.checked
                                            )
                                        }
                                        className="h-4 w-4"
                                    />
                                    <label
                                        htmlFor="isPublished"
                                        className="text-sm text-foreground"
                                    >
                                        Xuất bản ngay
                                    </label>
                                </div>
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
                                        handleInputChange("content", value);
                                    }}
                                    height={500}
                                    placeholder="Nhập nội dung bài viết..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Hỗ trợ Markdown: **bold**, *italic*,
                                    [link](url), ![image](url)
                                </p>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="bg-foreground/3 p-6 rounded-2xl shadow-sm border">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving || !hasChanges}
                                    className="flex-1 cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {isSaving
                                        ? "Đang lưu..."
                                        : "Cập nhật bài viết"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (hasChanges) {
                                            const confirmLeave = confirm(
                                                "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?"
                                            );
                                            if (!confirmLeave) return;
                                        }
                                        navigate("/admin/blog");
                                    }}
                                    className="px-6 py-2 cursor-pointer bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>

                            {hasChanges && (
                                <p className="text-sm text-amber-600 mt-2 flex items-center">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                    Bạn có thay đổi chưa được lưu
                                </p>
                            )}
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
                                        className="w-full aspect-video object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                )}

                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        {formData.title || "Tiêu đề bài viết"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {new Date().toLocaleDateString("vi-VN")}{" "}
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
                                                ? "Đã xuất bản"
                                                : "Bản nháp"}
                                        </Badge>
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        Nội dung:
                                    </h4>
                                    <div className="text-sm text-gray-600 max-h-40 overflow-y-auto">
                                        {formData.content ? (
                                            <pre className="whitespace-pre-wrap font-sans">
                                                {formData.content.substring(
                                                    0,
                                                    200
                                                )}
                                                {formData.content.length >
                                                    200 && "..."}
                                            </pre>
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
    );
};

export default EditBlogPage;
