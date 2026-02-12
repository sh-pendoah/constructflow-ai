"use client";

import React from "react";
import { ArrowUpDown, MoreVertical } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
  width?: string | number; // Custom width for the column (e.g., "200px", "20%", or 200 for pixels)
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`w-full bg-white  border-[#DEE0E3]  overflow-x-auto ${className}`}>
      <div className="min-w-full inline-block">
        {/* Table Header */}
        <div className="flex">
          {columns.map((column, index) => {
            const align = column.align || "left";
            const justifyClass = 
              align === "center" ? "justify-center" :
              align === "right" ? "justify-end" :
              "justify-start";
            
            const width = column.width 
              ? (typeof column.width === "number" ? `${column.width}px` : column.width)
              : undefined;
            
            const flexClass = width ? "flex-shrink-0 flex-grow-0" : "flex-1";
            
            return (
              <div
                key={column.key}
                className={`${flexClass} flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 bg-[#F4F5F6] h-[48px] sm:h-[52px] min-w-[120px] ${justifyClass}`}
                style={{
                  width: width,
                  borderLeft: index === 0 ? "1px solid #DEE0E3" : "none",
                  borderRight: index === columns.length - 1 ? "1px solid #DEE0E3" : "none",
                  borderTop: "1px solid #DEE0E3",
                  borderBottom: "1px solid #DEE0E3",
                }}
              >
                <div className={`flex items-center gap-2 ${justifyClass} w-full`}>
                  <span className="text-sm sm:text-body-copy text-primary font-sf-pro whitespace-nowrap">
                    {column.label}
                  </span>
                  {column.sortable && (
                    <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {data.length === 0 ? (
            // No Data Row
            <div className="flex">
              <div
                className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 h-[48px] sm:h-[52px]"
                style={{
                  borderLeft: "1px solid #DEE0E3",
                  borderRight: "1px solid #DEE0E3",
                  borderBottom: "1px solid #DEE0E3",
                }}
              >
                <p className="text-sm text-[#6F7A85] font-sf-pro">No data</p>
              </div>
            </div>
          ) : (
            data.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {columns.map((column, colIndex) => {
                  const align = column.align || "left";
                  const justifyClass = 
                    align === "center" ? "justify-center" :
                    align === "right" ? "justify-end" :
                    "justify-start";
                  
                  const width = column.width 
                    ? (typeof column.width === "number" ? `${column.width}px` : column.width)
                    : undefined;
                  
                  const flexClass = width ? "flex-shrink-0 flex-grow-0" : "flex-1";
                  
                  return (
                    <div
                      key={column.key}
                      className={`${flexClass} flex items-center px-3 sm:px-4 py-3 sm:py-4 h-[48px] sm:h-[52px] min-w-[120px] ${justifyClass}`}
                      style={{
                        width: width,
                        borderLeft: colIndex === 0 ? "1px solid #DEE0E3" : "none",
                        borderRight: colIndex === columns.length - 1 ? "1px solid #DEE0E3" : "none",
                        borderBottom: rowIndex === data.length - 1 ? "none" : "1px solid #DEE0E3",
                      }}
                    >
                      {column.render
                        ? (
                            <div className={`w-full flex items-center ${justifyClass}`}>
                              {column.render(row[column.key], row)}
                            </div>
                          )
                        : (
                            <span className="text-xs sm:text-supporting text-primary font-sf-pro whitespace-nowrap">
                              {row[column.key] || ""}
                            </span>
                          )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DataTable;

