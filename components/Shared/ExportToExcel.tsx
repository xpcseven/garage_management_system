import { RiFileExcel2Fill } from "react-icons/ri";
import * as XLSX from "xlsx";
const ExportToExcel = ({ currentItems }: any) => {
  let dataToExport;
  const handleExport = () => {
    if (typeof currentItems === "string") {
      try {
        dataToExport = JSON.parse(currentItems);
      } catch (error) {
        console.error("خطأ في تحليل JSON:", error);
        alert("البيانات غير صالحة للتصدير");
        return;
      }
    } else if (Array.isArray(currentItems)) {
      // إذا كانت بالفعل مصفوفة
      dataToExport = currentItems;
    } else {
      console.error("نوع بيانات غير مدعوم:", typeof currentItems);
      alert("لا توجد بيانات صالحة للتصدير");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "البيانات");

    XLSX.writeFile(workbook, "table_data.xlsx");
  };

  return (
    <div>
      <button
        onClick={handleExport}
        className="mt-4 py-[6px] px-[6px] drop-shadow-xl bg-green-600 text-titlecolor rounded hover:bg-green-500"
      >
        <RiFileExcel2Fill className="size-7" />
      </button>
    </div>
  );
};

export default ExportToExcel;
