import type { ApiResponse } from "@/types/api";
import { publicAPI } from "../utils/axios";

export interface BlogAuthor {
    id: number;
    firstName: string;
    lastName: string;
    image?: string;
}

export interface PublicBlog {
    id: number;
    title: string;
    thumbnail?: string;
    author: BlogAuthor;
    publishedAt: string;
    content: string;
}

export interface BlogDetail extends PublicBlog {
    status: string | null;
    createdAt: string;
    updatedAt: string;
    isPublished: boolean;
}

export interface BlogListResponse {
    success: boolean;
    msg: string;
    data: PublicBlog[];
    meta: {
        currentPage: number;
        pageSize: number;
        totalPage: number;
        totalElements: number;
    };
}

export interface BlogDetailResponse {
    success: boolean;
    msg: string;
    data: BlogDetail;
}

export interface BlogListParams {
    page?: number;
    size?: number;
    search?: string;
}

const publicBlogService = {
    // Lấy danh sách blog public
    getBlogs: async (
        params?: BlogListParams
    ): Promise<ApiResponse<BlogListResponse>> => {
        const response = await publicAPI.get<ApiResponse<BlogListResponse>>(
            "/blogs",
            {
                params: {
                    page: params?.page || 0,
                    size: params?.size || 6,
                    ...params,
                },
            }
        );
        return response.data;
    },

    // Lấy chi tiết blog theo ID
    getBlogById: async (blogId: number): Promise<ApiResponse<BlogDetail>> => {
        const response = await publicAPI.get<ApiResponse<BlogDetail>>(
            `/blogs/${blogId}`
        );
        return response.data;
    },
};

export default publicBlogService;
