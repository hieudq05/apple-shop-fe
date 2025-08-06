"use client"

import * as React from "react"
import {Cell, Pie, PieChart} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import {Badge} from "@/components/ui/badge.tsx";
import {Label} from "@/components/ui/label.tsx";
interface OrderStatusData {
    status: string;
    count: number;
    percentage: number;
}

interface OrderStatusPieChartProps {
    data: OrderStatusData[];
}

const chartConfig = {
    delivered: {
        label: "Đã giao",
        color: "hsl(var(--chart-1))",
    },
    shipped: {
        label: "Đang giao",
        color: "hsl(var(--chart-2))",
    },
    pending: {
        label: "Chờ thanh toán",
        color: "hsl(var(--chart-3))",
    },
    processing: {
        label: "Đang xử lý",
        color: "hsl(var(--chart-4))",
    },
    cancelled: {
        label: "Đã hủy",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig;

export function OrderStatusPieChart({data}: OrderStatusPieChartProps) {
    const totalOrders = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.count, 0);
    }, [data]);

    // Tạo chartData từ dữ liệu nhận được
    const chartData = React.useMemo(() => {
        return data.map((item, index) => ({
            status: item.status,
            count: item.count,
            percentage: item.percentage,
            fill: `var(--chart-${index + 1})`,
        }));
    }, [data]);

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Phân bố trạng thái đơn hàng</CardTitle>
                <CardDescription>
                    Tỷ lệ phần trăm các trạng thái đơn hàng ({totalOrders.toLocaleString("vi-VN")} đơn hàng)
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className={"relative"}>
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[300px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                labelClassName={"z-50"}
                                wrapperClassName={"z-50"}
                                cursor={false}
                                content={<ChartTooltipContent hideLabel/>}
                            />
                            <Pie
                                data={chartData}
                                dataKey="count"
                                nameKey="status"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill}/>
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <Label className={"absolute top-1/2 flex flex-col left-1/2 transform gap-0 -translate-x-1/2 -translate-y-1/2 text-center text-foreground"}>
                        <span className={"font-bold z-0 text-4xl"}>{totalOrders}</span>
                        <span className={"text-xs z-0 text-muted-foreground"}>Đơn hàng</span>
                    </Label>
                </div>

                {/* Legend và thống kê */}
                <div className="mt-6 gap-2 justify-center flex flex-wrap">
                    {chartData.map((item, index) => (
                        <Badge key={index} variant={"secondary"}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-xs"
                                    style={{backgroundColor: item.fill}}
                                />
                                <span className="text-sm font-medium">{item.status}</span>
                            </div>
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
