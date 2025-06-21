import { useMemo, useState } from "react";
import { IoDownloadOutline } from "react-icons/io5";
import * as XLSX from "xlsx"

type ColumnData = {
  [key: string]: {
    values: Array<string | boolean | number>;
    classNames?: (value: string | boolean | number) => string;
    renderBoolean?: (value: any) => React.ReactNode;
    renderValue?: (value: string | boolean | number) => React.ReactNode;
  };
};

interface DataTableProps {
  data: ColumnData;
  searchBar?: boolean;
  excelExport?: boolean;
  pagination?: boolean;
  removableRows?: boolean;
  pageSizeControl?: boolean;
}

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
  excelExport = false,
}) => {
  const columns = Object.keys(data);
  const rowCount = Math.max(...columns.map((column) => data[column].values.length));
  
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
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
  
  
    const rows = useMemo(() => {
      return Array.from({ length: rowCount }, (_, index) => {
        return columns.reduce((acc, column) => {
          acc[column] = data[column].values[index] || "";
          return acc;
        }, {} as { [key: string]: string | boolean | number });
      });
    }, [data, columns, rowCount]);

    return (
      <div className="max-w-full overflow-x-auto py-5">
        <div className="flex w-full items-center justify-between mb-5">
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
          </div>
        </div>
        <div className="table-container">
          <table className="w-full overflow-x-auto max-w-[100vw]">
            <thead>
              <tr className="bg-[#303030] h-[50px]">
                <th className="hidden">Actions</th>
                <th className="font-medium text-gray-300 text-[16px] pl-5">
                  #
                </th>
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
        <div className="w-full mt-5 flex items-center justify-between"></div>
      </div>
    );
  };
};
export default Table;
