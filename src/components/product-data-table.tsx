import * as React from "react";
import { z } from "zod";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Trash2, MoreHorizontal, ImageIcon, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Schema for product data validation
export const productSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    categoryId: z.number(),
    categoryName: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    stocks: z.array(
        z.object({
            id: z.number(),
            productId: z.number(),
            colorId: z.number(),
            colorName: z.string(),
            colorHexCode: z.string(),
            quantity: z.number(),
            price: z.number(),
            productPhotos: z.array(
                z.object({
                    id: z.number(),
                    imageUrl: z.string(),
                    alt: z.string(),
                })
            ),
        })
    ),
    features: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
            image: z.string(),
        })
    ),
});

export type Product = z.infer<typeof productSchema>;

interface ProductDataTableProps {
    data: Product[];
    onEdit?: (productId: number, categoryId: number) => void;
    onDelete?: (productId: number, productName: string) => void;
    onView?: (productId: number, categoryId: number) => void;
}

export function ProductDataTable({
    data,
    onEdit,
    onDelete,
    onView,
}: ProductDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const getMinPrice = (stocks: Product["stocks"]) => {
        if (!stocks || stocks.length === 0) return 0;
        return Math.min(...stocks.map((s) => s.price));
    };

    const getTotalStock = (stocks: Product["stocks"]) => {
        if (!stocks || stocks.length === 0) return 0;
        return stocks.reduce((total, stock) => total + stock.quantity, 0);
    };

    const getProductImage = (stocks: Product["stocks"]) => {
        const firstStock = stocks?.[0];
        const firstPhoto = firstStock?.productPhotos?.[0];
        return firstPhoto?.imageUrl || null;
    };

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            header: "Sản phẩm",
            cell: ({ row }) => {
                const product = row.original;
                const image = getProductImage(product.stocks);

                return (
                    <div className="flex items-center space-x-3 py-1">
                        <Avatar className="h-10 w-10">
                            <img
                                src={image || "/placeholder-image.png"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </Avatar>
                        <div>
                            <div className="font-medium text-sm">
                                {product.name}
                            </div>
                            {product.description && (
                                <div className="text-xs text-muted-foreground">
                                    {product.description}
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "categoryName",
            header: "Danh mục",
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue("categoryName")}</Badge>
            ),
        },
        {
            accessorKey: "stocks",
            header: "Giá",
            cell: ({ row }) => {
                const stocks = row.getValue("stocks") as Product["stocks"];
                const minPrice = getMinPrice(stocks);
                return (
                    <div className="font-medium text-sm py-1">
                        {formatCurrency(minPrice)}
                    </div>
                );
            },
        },
        {
            accessorKey: "stocks",
            header: "Tồn kho",
            cell: ({ row }) => {
                const stocks = row.getValue("stocks") as Product["stocks"];
                const totalStock = getTotalStock(stocks);
                return (
                    <div
                        className={`font-medium text-sm py-1 ${
                            totalStock <= 10 ? "text-red-600" : ""
                        }`}
                    >
                        {totalStock}
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => (
                <div className="text-xs py-1">
                    {formatDate(row.getValue("createdAt"))}
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const product = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="w-fit cursor-pointer hover:bg-gray-200"
                            asChild
                        >
                            <Button variant="ghost" className="p-2">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-right w-full"
                                onClick={() =>
                                    onView?.(product.id, product.categoryId)
                                }
                            >
                                <Eye className="mr-2 h-4 w-4 text-black" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-end"
                                onClick={() => onEdit?.(product.id, product.categoryId)}
                            >
                                <Edit className="mr-2 h-4 w-4 text-black" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-end"
                                onClick={() =>
                                    onDelete?.(product.id, product.name)
                                }
                            >
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                <span className="text-red-600">Xóa</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow className="bg-muted" key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    className="h-16"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="py-4"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Không có sản phẩm nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
