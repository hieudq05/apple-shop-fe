import { PackagePlus, SquarePlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
}) {
    const location = useLocation();

    const isCurrentPath = (path: string) => {
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        );
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            asChild
                            tooltip="Tạo sản phẩm mới"
                            className="bg-blue-500 h-10 px-4 w-fit rounded-xl text-white hover:text-white hover:bg-blue-600 transition active:bg-blue-400 active:text-primary-foreground min-w-8 duration-100 ease-linear"
                        >
                            <Link to="/admin/products/create">
                                <SquarePlus />
                                <span>Thêm sản phẩm</span>
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            asChild
                            tooltip="Tạo sản phẩm mới"
                            className="bg-blue-500 h-10 w-fit px-3 rounded-xl text-white hover:text-white hover:bg-blue-600 transition active:bg-blue-400 active:text-primary-foreground min-w-8 duration-100 ease-linear"
                        >
                            <Link to="/admin/create/order">
                                <PackagePlus />
                                <span>Tạo đơn</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                asChild
                                isActive={isCurrentPath(item.url)}
                            >
                                <Link
                                    to={item.url}
                                    className={
                                        "h-10 " +
                                        (isCurrentPath(item.url)
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-muted-foreground")
                                    }
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
