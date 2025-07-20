import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "./ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    loading = false,
}) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            {/* Results info */}
            <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{startItem}</span>-
                <span className="font-medium">{endItem}</span> trong{" "}
                <span className="font-medium">{totalItems}</span> kết quả
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Previous button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="flex items-center gap-1"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Trước
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {getVisiblePages().map((page, index) => {
                        if (page === "...") {
                            return (
                                <span
                                    key={`dots-${index}`}
                                    className="px-3 py-2 text-gray-500"
                                >
                                    ...
                                </span>
                            );
                        }

                        const pageNumber = page as number;
                        return (
                            <Button
                                key={pageNumber}
                                variant={
                                    pageNumber === currentPage
                                        ? "default"
                                        : "outline"
                                }
                                size="sm"
                                onClick={() => onPageChange(pageNumber)}
                                disabled={loading}
                                className={`min-w-[40px] ${
                                    pageNumber === currentPage
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : ""
                                }`}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}
                </div>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    className="flex items-center gap-1"
                >
                    Sau
                    <ChevronRightIcon className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
