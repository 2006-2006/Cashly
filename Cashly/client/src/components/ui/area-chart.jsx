"use client";

import React from "react";
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/* safe defaults */
const defaultIndex = "Year";
const defaultCategories = ["Psychology", "Business", "Biology"];
const defaultData = [
    { Year: "2018", Psychology: 125, Business: 120, Biology: 90 },
    { Year: "2019", Psychology: 110, Business: 130, Biology: 85 },
    { Year: "2020", Psychology: 135, Business: 100, Biology: 95 },
    { Year: "2021", Psychology: 105, Business: 115, Biology: 120 },
    { Year: "2022", Psychology: 140, Business: 125, Biology: 130 },
];

const defaultColors = ["#0c6d62", "#12a594", "#10b3a3", "#0b544a"];

const AreaChartRoot = React.forwardRef(function AreaChartRoot(
    {
        data = defaultData,
        categories = defaultCategories,
        index = defaultIndex,
        stacked = false,
        className,
        colors = defaultColors,
        ...otherProps
    },
    ref
) {
    return (
        <div className={`h-80 w-full ${className || ''}`} ref={ref} {...otherProps}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        {categories.map((category, idx) => (
                            <linearGradient key={category} id={`color-${category}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <XAxis
                        dataKey={index}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    {categories.map((category, idx) => (
                        <Area
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stackId={stacked ? "1" : idx.toString()}
                            stroke={colors[idx % colors.length]}
                            fillOpacity={1}
                            fill={`url(#color-${category})`}
                        />
                    ))}
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
});

export const AreaChart = AreaChartRoot;
export default AreaChart;
