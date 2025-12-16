"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { speciesLabels, genderLabels, sizeLabels } from "@/lib/utils";

export interface FilterState {
    search: string;
    species: string;
    gender: string;
    size: string;
    location: string;
    minAge: string;
    maxAge: string;
}

interface PetFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onReset: () => void;
}

export default function PetFilters({ filters, onFilterChange, onReset }: PetFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const updateFilter = (key: keyof FilterState, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const hasActiveFilters =
        filters.species ||
        filters.gender ||
        filters.size ||
        filters.location ||
        filters.minAge ||
        filters.maxAge;

    return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6">
            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                    type="text"
                    placeholder="搜索宠物名称、品种..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(speciesLabels).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => updateFilter("species", filters.species === key ? "" : key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.species === key
                                ? "bg-primary-500 text-white"
                                : "bg-[var(--background)] text-[var(--foreground)] hover:bg-primary-100 dark:hover:bg-primary-900/20"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Toggle Advanced Filters */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-4"
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{showAdvanced ? "收起" : "更多筛选"}</span>
            </button>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--card-border)]">
                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium mb-2">性别</label>
                        <select
                            value={filters.gender}
                            onChange={(e) => updateFilter("gender", e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg focus:outline-none focus:border-primary-500"
                        >
                            <option value="">全部</option>
                            {Object.entries(genderLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Size */}
                    <div>
                        <label className="block text-sm font-medium mb-2">体型</label>
                        <select
                            value={filters.size}
                            onChange={(e) => updateFilter("size", e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg focus:outline-none focus:border-primary-500"
                        >
                            <option value="">全部</option>
                            {Object.entries(sizeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-2">地区</label>
                        <input
                            type="text"
                            placeholder="输入城市名"
                            value={filters.location}
                            onChange={(e) => updateFilter("location", e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg focus:outline-none focus:border-primary-500"
                        />
                    </div>

                    {/* Age Range */}
                    <div>
                        <label className="block text-sm font-medium mb-2">年龄范围</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="最小"
                                min="0"
                                max="20"
                                value={filters.minAge}
                                onChange={(e) => updateFilter("minAge", e.target.value)}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg focus:outline-none focus:border-primary-500"
                            />
                            <span className="text-[var(--muted)]">-</span>
                            <input
                                type="number"
                                placeholder="最大"
                                min="0"
                                max="20"
                                value={filters.maxAge}
                                onChange={(e) => updateFilter("maxAge", e.target.value)}
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg focus:outline-none focus:border-primary-500"
                            />
                            <span className="text-[var(--muted)] text-sm">岁</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Button */}
            {hasActiveFilters && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-1 mt-4 text-sm text-primary-500 hover:text-primary-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                    <span>清除筛选</span>
                </button>
            )}
        </div>
    );
}
