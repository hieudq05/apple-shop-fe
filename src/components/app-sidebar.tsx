import * as React from "react"
import {
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  FileText,
  Tag,
  Gift,
  Home,
  Search,
  HelpCircle
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Sản phẩm",
      url: "/admin/products",
      icon: Package,
    },
    {
      title: "Đơn hàng",
      url: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      title: "Người dùng",
      url: "/admin/users",
      icon: Users,
      adminOnly: true,
    },
    {
      title: "Thống kê",
      url: "/admin/analytics",
      icon: BarChart3,
    },
  ],
  navManagement: [
    {
      title: "Danh mục",
      url: "/admin/categories",
      icon: Tag,
      items: [
        {
          title: "Quản lý danh mục",
          url: "/admin/categories",
        },
        {
          title: "Tạo danh mục mới",
          url: "/admin/categories/create",
        },
      ],
    },
    {
      title: "Khuyến mãi",
      url: "/admin/promotions",
      icon: Gift,
      items: [
        {
          title: "Danh sách khuyến mãi",
          url: "/admin/promotions",
        },
        {
          title: "Tạo khuyến mãi",
          url: "/admin/promotions/create",
        },
      ],
    },
    {
      title: "Blog",
      url: "/admin/blog",
      icon: FileText,
      items: [
        {
          title: "Quản lý bài viết",
          url: "/admin/blog",
        },
        {
          title: "Tạo bài viết mới",
          url: "/admin/blog/create",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt",
      url: "/admin/settings",
      icon: Settings,
      adminOnly: true,
    },
    {
      title: "Trợ giúp",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Tìm kiếm",
      url: "#",
      icon: Search,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAdmin } = useAuth()

  // Filter items based on user permissions
  const filteredNavMain = data.navMain.filter(item => !item.adminOnly || isAdmin)
  const filteredNavSecondary = data.navSecondary.filter(item => !item.adminOnly || isAdmin)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin/dashboard">
                <svg height="20" viewBox="0 0 14 44" width="14" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0984 2.014-4.7405 3.9969-4.7405 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1604 1.5802zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.8779 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"
                    fill="currentColor"/>
                </svg>
                <span className="text-base font-semibold">Apple Store Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavDocuments items={data.navManagement} />
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.fullName || "Admin User",
          email: user?.email || "admin@example.com",
          avatar: user?.imageUrl || "/avatars/default.jpg",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
