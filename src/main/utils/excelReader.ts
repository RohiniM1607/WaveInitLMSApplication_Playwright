import path from "path";
import * as XLSX from "xlsx";

export function readExcelData<T>(fileName: string,sheetName: string): T[] {
    const filePath = path.join(process.cwd(),"src","resources","data",fileName);
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
        throw new Error(`Sheet '${sheetName}' not found in '${fileName}'.`);
    }
    return XLSX.utils.sheet_to_json<T>(worksheet);
}