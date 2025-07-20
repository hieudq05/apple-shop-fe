// Service for Vietnam provinces API
export interface Province {
    code: string;
    name: string;
    name_en: string;
    full_name: string;
    full_name_en: string;
    code_name: string;
}

export interface District {
    code: string;
    name: string;
    name_en: string;
    full_name: string;
    full_name_en: string;
    code_name: string;
    province_code: string;
}

export interface Ward {
    code: string;
    name: string;
    name_en: string;
    full_name: string;
    full_name_en: string;
    code_name: string;
    district_code: string;
}

class AddressService {
    private baseUrl = "https://provinces.open-api.vn/api";

    /**
     * Get all provinces
     */
    async getProvinces(): Promise<Province[]> {
        try {
            const response = await fetch(`${this.baseUrl}/p/`);
            if (!response.ok) {
                throw new Error("Failed to fetch provinces");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching provinces:", error);
            // Return fallback data for some major provinces
            return [
                {
                    code: "01",
                    name: "Hà Nội",
                    name_en: "Ha Noi",
                    full_name: "Thành phố Hà Nội",
                    full_name_en: "Ha Noi City",
                    code_name: "ha_noi",
                },
                {
                    code: "79",
                    name: "Thành phố Hồ Chí Minh",
                    name_en: "Ho Chi Minh City",
                    full_name: "Thành phố Hồ Chí Minh",
                    full_name_en: "Ho Chi Minh City",
                    code_name: "ho_chi_minh",
                },
                {
                    code: "48",
                    name: "Đà Nẵng",
                    name_en: "Da Nang",
                    full_name: "Thành phố Đà Nẵng",
                    full_name_en: "Da Nang City",
                    code_name: "da_nang",
                },
                {
                    code: "31",
                    name: "Hải Phòng",
                    name_en: "Hai Phong",
                    full_name: "Thành phố Hải Phòng",
                    full_name_en: "Hai Phong City",
                    code_name: "hai_phong",
                },
                {
                    code: "92",
                    name: "Cần Thơ",
                    name_en: "Can Tho",
                    full_name: "Thành phố Cần Thơ",
                    full_name_en: "Can Tho City",
                    code_name: "can_tho",
                },
            ];
        }
    }

    /**
     * Get districts by province code
     */
    async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/p/${provinceCode}?depth=2`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch districts");
            }
            const data = await response.json();
            return data.districts || [];
        } catch (error) {
            console.error("Error fetching districts:", error);
            return [];
        }
    }

    /**
     * Get wards by district code
     */
    async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/d/${districtCode}?depth=2`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch wards");
            }
            const data = await response.json();
            return data.wards || [];
        } catch (error) {
            console.error("Error fetching wards:", error);
            return [];
        }
    }

    /**
     * Get province by code
     */
    async getProvinceByCode(code: string): Promise<Province | null> {
        try {
            const response = await fetch(`${this.baseUrl}/p/${code}`);
            if (!response.ok) {
                throw new Error("Failed to fetch province");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching province:", error);
            return null;
        }
    }

    /**
     * Get district by code
     */
    async getDistrictByCode(code: string): Promise<District | null> {
        try {
            const response = await fetch(`${this.baseUrl}/d/${code}`);
            if (!response.ok) {
                throw new Error("Failed to fetch district");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching district:", error);
            return null;
        }
    }

    /**
     * Get ward by code
     */
    async getWardByCode(code: string): Promise<Ward | null> {
        try {
            const response = await fetch(`${this.baseUrl}/w/${code}`);
            if (!response.ok) {
                throw new Error("Failed to fetch ward");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching ward:", error);
            return null;
        }
    }
}

export const addressService = new AddressService();
export default addressService;
