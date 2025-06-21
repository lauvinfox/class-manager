import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
// import { ColumnData, sortType } from "../../types";

import {
  IoCaretDownOutline,
  IoCaretUpOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoDownloadOutline,
  IoSearchOutline,
  IoTrashOutline,
} from "react-icons/io5";

type ColumnData = {
  [key: string]: {
    values: Array<string | boolean | number>;
    classNames?: (value: string | boolean | number) => string;
    renderBoolean?: (value: any) => React.ReactNode;
    renderValue?: (value: string | boolean | number) => React.ReactNode;
  };
};

type sortType = {
  key: string;
  direction: "asc" | "desc" | null;
};

interface DataTableProps {
  data: ColumnData;
  searchBar?: boolean;
  excelExport?: boolean;
  pagination?: boolean;
  removableRows?: boolean;
  pageSizeControl?: boolean;
}

const Table: React.FC<DataTableProps> = ({
  data,
  searchBar = false,
  excelExport = false,
  pagination = false,
  removableRows = false,
  pageSizeControl = false,
}) => {
  const columns = Object.keys(data);
  const rowCount = Math.max(
    ...columns.map((column) => data[column].values.length)
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<sortType | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };

  const handleSort = (accessor: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig && sortConfig.key === accessor) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }
    setSortConfig({ key: accessor, direction });
  };

  const exportToExcel = () => {
    const exportData = rows.map((row) => {
      const exportRow: { [key: string]: string | boolean } = {};
      columns.forEach((column) => {
        if (row[column]) {
          exportRow[column] = row[column] as string | boolean;
        } else {
          exportRow[column] = "FALSE";
        }
      });
      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  const handleRowSelect = (rowIndex: number) => {
    const selectedRowIndex = selectedRows.indexOf(String(rowIndex));
    if (selectedRowIndex === -1) {
      setSelectedRows([...selectedRows, String(rowIndex)]);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows.splice(selectedRowIndex, 1);
      setSelectedRows(updatedSelectedRows);
    }
  };

  const handleDeleteSelectedRows = () => {
    const updatedData = { ...data };
    selectedRows.forEach((rowIndexString) => {
      const rowIndex = parseInt(rowIndexString, 10);
      columns.forEach((column) => {
        updatedData[column].values.splice(rowIndex, 1);
      });
    });
    setSelectedRows([]);
  };

  const rows = useMemo(() => {
    return Array.from({ length: rowCount }, (_, index) => {
      return columns.reduce((acc, column) => {
        acc[column] = data[column].values[index] || "";
        return acc;
      }, {} as { [key: string]: string | boolean | number });
    });
  }, [data, columns, rowCount]);

  const sortedRows = useMemo(() => {
    if (!sortConfig || !sortConfig.direction) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a[sortConfig.key] as string;
      const bValue = b[sortConfig.key] as string;

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig]);

  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) =>
      columns.some((column) =>
        String(row[column]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedRows, searchTerm, columns]);

  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  return (
    <div className="max-w-full overflow-x-auto py-5">
      <div className="flex w-full items-center justify-between mb-5">
        {searchBar ? (
          <div className="flex md:w-[30%] w-[70%] items-center gap-5 rounded-lg px-3 py-2 bg-[#303030]">
            <IoSearchOutline className={"!text-gray-300"} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full outline-none bg-transparent"
            />
          </div>
        ) : (
          <div></div>
        )}

        <div className="flex items-center gap-5">
          {excelExport && (
            <button
              onClick={exportToExcel}
              className="rounded-lg bg-[#303030] p-2"
            >
              <IoDownloadOutline
                width={"26px"}
                height={"26px"}
                className={"!text-[#99e5be] cursor-pointer"}
              />
            </button>
          )}
          {removableRows && (
            <button
              onClick={handleDeleteSelectedRows}
              disabled={selectedRows.length === 0}
              className="rounded-lg bg-[#303030] p-2 disabled:opacity-50"
            >
              <IoTrashOutline
                width={"26px"}
                height={"26px"}
                className={`${
                  selectedRows.length === 0
                    ? "cursor-default !text-red-300"
                    : "cursor-pointer !text-red-400"
                }`}
              />
            </button>
          )}
        </div>
      </div>
      <div className="table-container">
        <table className="w-full overflow-x-auto max-w-[100vw]">
          <thead>
            <tr className="bg-[#303030] h-[50px]">
              <th className="hidden">Actions</th>
              <th className="font-medium text-gray-300 text-[16px] pl-5">#</th>
              {columns.map((column, index: number) => (
                <th
                  key={index}
                  onClick={() => handleSort(column)}
                  className="font-medium text-gray-300 text-[16px] px-5 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-[1px]">
                    {column}
                    {sortConfig?.key === column ? (
                      sortConfig.direction === "asc" ? (
                        <IoCaretDownOutline className="fill-blue-400" />
                      ) : sortConfig.direction === "desc" ? (
                        <IoCaretDownOutline className="fill-blue-400" />
                      ) : (
                        <IoCaretUpOutline className="hidden" />
                      )
                    ) : (
                      <IoCaretUpOutline className="hidden" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {paginatedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`h-[50px] cursor-pointer ${
                  selectedRows.includes(String(rowIndex))
                    ? "bg-[#4d4d4d]"
                    : rowIndex % 2
                    ? "bg-[#242424]"
                    : "bg-[#1f1f1f]"
                }`}
              >
                <td className="hidden">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(String(rowIndex))}
                    onChange={() => handleRowSelect(rowIndex)}
                  />
                </td>
                <td className="pl-5">{rowIndex + 1}</td>
                {columns.map((column, index: number) => {
                  const value = row[column];
                  const columnData = data[column];
                  const classNames = columnData.classNames
                    ? columnData.classNames(value)
                    : {};
                  const content = columnData.renderValue
                    ? columnData.renderValue(value)
                    : typeof value === "boolean" && columnData.renderBoolean
                    ? columnData.renderBoolean(value)
                    : `${value}`;

                  return (
                    <td
                      key={index}
                      className={`${classNames}`}
                      onClick={() => handleRowSelect(rowIndex)}
                    >
                      <div className="flex items-center justify-center whitespace-nowrap px-5">
                        {content
                          ? content
                          : columnData.renderBoolean
                          ? columnData.renderBoolean(value)
                          : "false"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full mt-5 flex items-center justify-between">
        {pageSizeControl ? (
          <div className="rounded-lg py-[2px] pr-1 bg-[#303030] w-fit text-gray-400">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent outline-none w-[80px] px-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        ) : (
          <div></div>
        )}
        {pagination && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-lg bg-[#303030] p-2 disabled:opacity-50"
            >
              <IoChevronBackOutline className="text-gray-500" />
            </button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage + 1 === totalPages}
              className="rounded-lg bg-[#303030] p-2 disabled:opacity-50"
            >
              <IoChevronForwardOutline className="text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
