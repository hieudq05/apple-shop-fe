import React from "react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

interface RevenueData {
    name: string;
    revenue: number;
    orders: number;
    date: string;
}

interface RevenueChartProps {
    data: RevenueData[];
    type?: "line" | "area" | "bar";
    height?: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        color: string;
        dataKey: string;
        value: number;
    }>;
    label?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
    data,
    type = "area",
    height = 300,
}) => {
    const formatCurrency = (num: number) => {
        if (isNaN(num) || num === null) {
            return "0";
        }

        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1).replace(".0", "") + " tỷ";
        }

        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(".0", "") + "tr";
        }

        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(".0", "") + "k";
        }

        return num.toString();
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat("vi-VN").format(value);
    };

    const CustomTooltip: React.FC<CustomTooltipProps> = ({
        active,
        payload,
        label,
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background flex gap-3 items-center border border-border rounded-xl py-3 px-4 shadow-lg">
                    <div className="size-4 bg-blue-500 rounded-sm"></div>
                    <div>
                        <p className="font-medium text-sm !text-foreground">
                            {label}
                        </p>
                        {payload.map((entry, index: number) => (
                            <p
                                key={index}
                                className="text-xs text-muted-foreground"
                            >
                                {entry.dataKey === "revenue" ? (
                                    <>
                                        Doanh thu:
                                        <span
                                            className="ml-1 text-sm font-medium"
                                            style={{ color: entry.color }}
                                        >
                                            {formatCurrency(entry.value)}
                                        </span>
                                    </>
                                ) : (
                                    `Đơn hàng: ${formatNumber(entry.value)}`
                                )}
                            </p>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    if (type === "line") {
        return (
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                        horizontal={true}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#427efd"
                        strokeWidth={2}
                        dot={{ fill: "#1d64ff", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    if (type === "bar") {
        return (
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={data}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                        horizontal={true}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        className="text-xs"
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="revenue"
                        fill="#1d64ff"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    // Default: Area chart
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="#1d64ff"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#1d64ff"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    strokeDasharray="3 3"
                    className="opacity-30"
                    horizontal={true}
                    vertical={false}
                />
                <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                />
                <YAxis
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1d64ff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
