"use client";

import { useState } from "react";
import { Search, X, Check } from "lucide-react";
import type { MerchantCategory } from "@/types/merchant-categories";
import {
  CATEGORY_GROUPS,
  getCategoryLabel,
  getCategoryEmoji,
  searchCategories,
} from "@/types/merchant-categories";

interface CategoryPickerProps {
  value: MerchantCategory | null;
  onChange: (category: MerchantCategory) => void;
  placeholder?: string;
  className?: string;
}

/**
 * CategoryPicker - Searchable dropdown for selecting a merchant category
 * 
 * @example
 * <CategoryPicker 
 *   value={selectedCategory} 
 *   onChange={setSelectedCategory}
 *   placeholder="Select your business type"
 * />
 */
export function CategoryPicker({
  value,
  onChange,
  placeholder = "Select category",
  className = "",
}: Readonly<CategoryPickerProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = searchQuery
    ? searchCategories(searchQuery)
    : null;

  const handleSelect = (category: MerchantCategory) => {
    onChange(category);
    setIsOpen(false);
    setSearchQuery("");
  };

  const selectedLabel = value ? getCategoryLabel(value) : null;
  const selectedEmoji = value ? getCategoryEmoji(value) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:border-brand-300"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: value ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        }}
      >
        <span className="flex items-center gap-2">
          {value ? (
            <>
              <span>{selectedEmoji}</span>
              <span>{selectedLabel}</span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-label="Close category picker"
          />

          {/* Dropdown Content */}
          <div
            className="absolute left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden rounded-md shadow-lg"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            {/* Search Box */}
            <div className="sticky top-0 border-b p-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-text-secondary)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded border py-1.5 pl-8 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-gray-100"
                  >
                    <X className="h-3.5 w-3.5" style={{ color: "var(--color-text-secondary)" }} />
                  </button>
                )}
              </div>
            </div>

            {/* Category List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredCategories ? (
                // Search Results
                <>
                  {filteredCategories.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      No categories found
                    </div>
                  ) : (
                    <div className="py-1">
                      {filteredCategories.map((category) => (
                        <CategoryOption
                          key={category}
                          category={category}
                          isSelected={category === value}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Grouped Categories
                <>
                  {CATEGORY_GROUPS.map((group) => (
                    <div key={group.workflow}>
                      <div
                        className="sticky top-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: "var(--color-muted)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <span className="mr-1.5">{group.icon}</span>
                        {group.label}
                      </div>
                      <div className="py-1">
                        {group.categories.map((category) => (
                          <CategoryOption
                            key={category}
                            category={category}
                            isSelected={category === value}
                            onSelect={handleSelect}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Internal component for category option
interface CategoryOptionProps {
  category: MerchantCategory;
  isSelected: boolean;
  onSelect: (category: MerchantCategory) => void;
}

function CategoryOption({ category, isSelected, onSelect }: Readonly<CategoryOptionProps>) {
  const label = getCategoryLabel(category);
  const emoji = getCategoryEmoji(category);

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-brand-50"
      style={{
        backgroundColor: isSelected ? "var(--color-brand-50)" : "transparent",
        color: isSelected ? "var(--color-brand-700)" : "var(--color-text-primary)",
      }}
    >
      <span className="flex items-center gap-2">
        <span>{emoji}</span>
        <span>{label}</span>
      </span>
      {isSelected && <Check className="h-4 w-4" style={{ color: "var(--color-brand-600)" }} />}
    </button>
  );
}
