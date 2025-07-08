import * as React from "react"
import { z } from "zod"
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
} from "@tanstack/react-table"
import {
    MoreHorizontal,
    UserIcon,
    Eye,
    Lock,
    Unlock,
    Phone,
    Mail,
    Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Schema for user data validation
export const userSchema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    email: z.string(),
    phone: z.string().nullable(),
    birth: z.string().nullable(),
    image: z.string().nullable(),
    enabled: z.boolean(),
    createdAt: z.string().optional(),
    roles: z.array(z.object({
        id: z.string(),
        name: z.string(),
    })),
})

export type User = z.infer<typeof userSchema>

interface UserDataTableProps {
    data: User[]
    onToggleStatus?: (userId: number) => void
    onView?: (userId: number) => void
    toggleLoading?: number | null
}

export function UserDataTable({
    data,
    onToggleStatus,
    onView,
    toggleLoading
}: UserDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getFullName = (user: User) => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || '--';
    };

    const getRoleText = (roleName: string) => {
        switch (roleName) {
            case 'ROLE_USER':
                return 'Người dùng';
            case 'ROLE_ADMIN':
                return 'Quản trị viên';
            case 'ROLE_STAFF':
                return 'Nhân viên';
            default:
                return 'Người dùng';
        }
    };

    const getRoleVariant = (roleName: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (roleName) {
            case 'ROLE_USER':
                return 'secondary';
            case 'ROLE_ADMIN':
                return 'destructive';
            case 'ROLE_STAFF':
                return 'default';
            default:
                return 'secondary';
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "user",
            header: "Người dùng",
            cell: ({ row }) => {
                const user = row.original
                const fullName = getFullName(user)
                
                return (
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || undefined} alt={fullName} />
                            <AvatarFallback>
                                <UserIcon className="h-5 w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{fullName}</p>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "enabled",
            header: "Trạng thái",
            cell: ({ row }) => {
                const user = row.original
                
                return (
                    <Badge variant={user.enabled ? "default" : "destructive"} className="text-xs">
                        {user.enabled ? (
                            <>
                                <Unlock className="w-3 h-3 mr-1" />
                                Hoạt động
                            </>
                        ) : (
                            <>
                                <Lock className="w-3 h-3 mr-1" />
                                Đã khóa
                            </>
                        )}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "roles",
            header: "Vai trò",
            cell: ({ row }) => {
                const user = row.original
                const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : null
                
                return (
                    <Badge variant={primaryRole ? getRoleVariant(primaryRole.name) : "secondary"} className="text-xs">
                        {primaryRole ? getRoleText(primaryRole.name) : 'Người dùng'}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "phone",
            header: "Số điện thoại",
            cell: ({ row }) => {
                const phone = row.getValue("phone") as string | null
                
                return (
                    <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{phone || '--'}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "birth",
            header: "Ngày sinh",
            cell: ({ row }) => {
                const birth = row.getValue("birth") as string | null
                
                return (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(birth)}</span>
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
                const user = row.original
                const isLoading = toggleLoading === user.id

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-fit cursor-pointer hover:bg-gray-200" asChild>
                            <Button variant="ghost" className="p-2">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-right w-full" onClick={() => onView?.(user.id)}>
                                <Eye className="mr-2 h-4 w-4 text-black" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-end"
                                onClick={() => onToggleStatus?.(user.id)}
                            >
                                <Lock className="mr-2 h-4 w-4 text-red-600" />
                                <span className="text-red-600">Khoá</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

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
    })

    return (
        <div className="w-full">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="h-16"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
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
                                    Không có dữ liệu.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
