import * as React from "react";
import {z} from "zod";
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
import {
    Eye,
    CheckCircle,
    Clock,
    X,
    Truck,
    Package,
    MoreHorizontal, BanknoteX,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
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
import {Link} from "react-router-dom";

// Schema for order data validation
export const orderSchema = z.object({
    id: z.number(),
    orderNumber: z.string(),
    customerName: z.string(),
    customerEmail: z.string(),
    status: z.enum([
        "PENDING_PAYMENT",
        "FAILED_PAYMENT",
        "PAID",
        "PROCESSING",
        "AWAITING_SHIPMENT",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
    ]),
    totalAmount: z.number(),
    itemCount: z.number(),
    createdAt: z.string(),
    paymentType: z.string(),
    approveAt: z.string().nullable(),
    createdBy: z.object({
        id: z.number(),
        firstName: z.string(),
        lastName: z.string().nullable(),
        image: z.string().nullable(),
    }),
});

export type Order = z.infer<typeof orderSchema>;

interface OrderDataTableProps {
    data: Order[];
    onView?: (orderId: number) => void;
    onUpdateStatus?: (orderId: number, newStatus: Order["status"]) => void;
    updatingOrderId?: number | null;
}

export function OrderDataTable({
                                   data,
                                   onView,
                                   onUpdateStatus,
                                   updatingOrderId,
                               }: OrderDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusIcon = (status: Order["status"]) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return <Clock className="w-4 h-4"/>;
            case "FAILED_PAYMENT":
                return (
                    <div>
                        <BanknoteX className={"size-4 text-destructive"}/>
                    </div>
                )
            case "PAID":
                return (
                    <div className="size-3 bg-purple-500/35 rounded-full relative">
                        <div
                            className="size-1.5 bg-purple-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            case "PROCESSING":
                return <MoreHorizontal className="w-4 h-4"/>;
            case "AWAITING_SHIPMENT":
                return (
                    <div className="size-3 bg-yellow-500/35 rounded-full relative">
                        <div
                            className="size-1.5 bg-yellow-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            case "SHIPPED":
                return <Truck className="w-4 h-4"/>;
            case "DELIVERED":
                return (
                    <div className="size-3 bg-green-500/35 rounded-full relative">
                        <div
                            className="size-1.5 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            case "CANCELLED":
                return (
                    <div className="size-3 bg-destructive/35 rounded-full relative">
                        <div
                            className="size-1.5 bg-destructive rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                );
            default:
                return <Clock className="w-4 h-4"/>;
        }
    };

    const getStatusText = (status: Order["status"]) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return "Chờ thanh toán";
            case "FAILED_PAYMENT":
                return "Thanh toán thất bại";
            case "PAID":
                return "Đã thanh toán";
            case "PROCESSING":
                return "Đang xử lý";
            case "AWAITING_SHIPMENT":
                return "Chờ vận chuyển";
            case "SHIPPED":
                return "Đang giao";
            case "DELIVERED":
                return "Đã giao";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const getStatusBadgeClass = (status: Order["status"]) => {
        switch (status) {
            case "PENDING_PAYMENT":
                return "";
            case "FAILED_PAYMENT":
                return "bg-destructive/5 text-red-500";
            case "CANCELLED":
                return "text-red-500 bg-destructive/5";
            case "SHIPPED":
                return "text-blue-600";
            case "AWAITING_SHIPMENT":
                return "text-yellow-500 bg-yellow-500/10";
            case "PAID":
                return "bg-purple-500/10 text-purple-500";
            case "DELIVERED":
                return "bg-green-600/10 text-green-500";
            default:
                return "text-muted-foreground";
        }
    };

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "orderNumber",
            header: "Đơn hàng",
            cell: ({row}) => {
                const order = row.original;
                return (
                    <div className="py-1">
                        <div className="font-medium text-sm">
                            {order.orderNumber}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {order.paymentType}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: "customerName",
            header: "Khách hàng",
            cell: ({row}) => {
                const order = row.original;
                return (
                    <>
                        {order.createdBy !== null ? (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        className="object-cover"
                                        src={order.createdBy.image || ""}
                                        alt={order.customerName}
                                    />
                                    <AvatarFallback>
                                        {order.customerName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-sm">
                                        {order.customerName}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        ID: {order.createdBy.id}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Chưa có thông tin người tạo
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({row}) => {
                const status = row.getValue("status") as Order["status"];
                return (
                    <Badge
                        variant="outline"
                        className={`flex items-center gap-1 w-fit ${getStatusBadgeClass(
                            status
                        )}`}
                    >
                        {getStatusIcon(status)}
                        {getStatusText(status)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "approveAt",
            header: "Thông tin",
            cell: ({row}) => {
                const order = row.original;
                return (
                    <div className="py-1">
                        <div className="text-muted-foreground">
                            {order.approveAt
                                ? `Duyệt: ${formatDate(order.approveAt)}`
                                : "Chưa duyệt"}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({row}) => (
                <div className="text-muted-foreground py-1">
                    {formatDate(row.getValue("createdAt"))}
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => {
                const order = row.original;

                return (
                    <div className="flex items-center justify-end gap-2 w-6">
                        <Link
                            className="p-2 hover:bg-foreground/10 border rounded-lg"
                            to={`/admin/orders/${order.id}`}
                        >
                            <Eye className="w-4 h-4"/>
                        </Link>
                    </div>
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
            <div className="rounded-2xl border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
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
                                    Không có đơn hàng nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
