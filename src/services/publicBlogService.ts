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
    getBlogs: async (params?: BlogListParams): Promise<BlogListResponse> => {
        const response = await publicAPI.get<BlogListResponse>("/blogs", {
            params: {
                page: params?.page || 0,
                size: params?.size || 6,
                ...params,
            },
        });
        return response;
    },

    // Lấy chi tiết blog theo ID
    getBlogById: async (blogId: number): Promise<BlogDetailResponse> => {
        const response = await publicAPI.get<BlogDetailResponse>(
            `/blogs/${blogId}`
        );
        return response;
    },
};

export default publicBlogService;
