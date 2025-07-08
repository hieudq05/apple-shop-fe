import { privateAPI } from '../utils/axios';

export interface BlogAuthor {
    id: number;
    firstName: string;
    lastName: string;
    image?: string;
}

export interface Blog {
    id: number;
    title: string;
    status: string | null;
    createdAt: string;
    updatedAt: string;
    isPublished: boolean;
    publishedAt?: string;
    author: BlogAuthor;
    content?: string;
    thumbnail?: string;
}

export interface BlogResponse {
    success: boolean;
    msg: string;
    data: Blog[];
    meta: {
        currentPage: number;
        pageSize: number;
        totalPage: number;
        totalElements: number;
    };
}

export interface BlogParams {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    isPublished?: boolean;
}

export interface CreateBlogData {
    title: string;
    content?: string;
    status?: string;
    isPublished?: boolean;
}

const blogService = {
    // Get all blogs with pagination and filters
    getBlogs: async (params: BlogParams = {}): Promise<BlogResponse> => {
        try {
            const searchParams = new URLSearchParams();
            
            if (params.page !== undefined) searchParams.append('page', params.page.toString());
            if (params.size !== undefined) searchParams.append('size', params.size.toString());
            if (params.search) searchParams.append('search', params.search);
            if (params.status) searchParams.append('status', params.status);
            if (params.isPublished !== undefined) searchParams.append('isPublished', params.isPublished.toString());

            const response = await privateAPI.get(`/blogs?${searchParams.toString()}`);
            return response as unknown as BlogResponse;
        } catch (error) {
            console.error('Error fetching blogs:', error);
            throw error;
        }
    },

    // Get blog by ID
    getBlogById: async (id: number): Promise<{ success: boolean; msg: string; data: Blog }> => {
        try {
            const response = await privateAPI.get(`/blogs/${id}`);
            return response as unknown as { success: boolean; msg: string; data: Blog };
        } catch (error) {
            console.error('Error fetching blog:', error);
            throw error;
        }
    },

    // Create new blog
    createBlog: async (data: CreateBlogData): Promise<{ success: boolean; msg: string; data: Blog }> => {
        try {
            const response = await privateAPI.post('/blogs', data);
            return response as unknown as { success: boolean; msg: string; data: Blog };
        } catch (error) {
            console.error('Error creating blog:', error);
            throw error;
        }
    },

    // Update existing blog
    updateBlog: async (id: number, data: Partial<CreateBlogData>): Promise<{ success: boolean; msg: string; data: Blog }> => {
        try {
            const response = await privateAPI.put(`/blogs/${id}`, data);
            return response as unknown as { success: boolean; msg: string; data: Blog };
        } catch (error) {
            console.error('Error updating blog:', error);
            throw error;
        }
    },

    // Delete blog
    deleteBlog: async (id: number): Promise<{ success: boolean; msg: string }> => {
        try {
            const response = await privateAPI.delete(`/blogs/${id}`);
            return response as unknown as { success: boolean; msg: string };
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw error;
        }
    },

    // Toggle blog publication status
    toggleBlogStatus: async (id: number, isPublished: boolean): Promise<{ success: boolean; msg: string; data: Blog }> => {
        try {
            const response = await privateAPI.patch(`/blogs/${id}/status`, { isPublished });
            return response as unknown as { success: boolean; msg: string; data: Blog };
        } catch (error) {
            console.error('Error toggling blog status:', error);
            throw error;
        }
    },
};

export default blogService;
