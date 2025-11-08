import { toExcelLocalTime } from '$lib';
import ExcelJS from 'exceljs';

export const POST = async ({request}) => {
    const { data } = await request.json();

    if(!data){
        throw Error("Data pada filteredMasalah kosong");
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Masalah');

    sheet.columns = [
        { header: 'No', key: 'No', width: 5 },
        { header: 'Nama Unit', key: 'Nama_Unit', width: 20 },
        { header: 'Penjelasan', key: 'Penjelasan', width: 40 },
        { header: 'Masalah Berat?', key: 'Masalah_Berat', width: 10 },
        { header: 'Selesai Diperbaiki?', key: 'Selesai_Diperbaiki', width: 10 },
        { header: 'Kapan', key: 'Kapan', width: 20 },
    ];

    data.forEach((item: any, i: any) => {
        sheet.addRow({
            No: i + 1,
            Nama_Unit: item.unitName,
            Penjelasan: item.desc,
            Masalah_Berat: item.berat ? 'Yes' : 'No',
            Selesai_Diperbaiki: item.done ? 'Yes' : 'No',
            Kapan: toExcelLocalTime(item.when.toLocaleString())
        });
    });

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.getCell('Kapan').numFmt = 'dd-mmm-yyyy hh:mm';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
		headers: {
			'Content-Type':
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment;"',
			'Cache-Control': 'no-cache'
		}
	});
};