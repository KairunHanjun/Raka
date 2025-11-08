import { toExcelLocalTime } from '$lib';
import ExcelJS from 'exceljs';

export const POST = async ({ request }) => {
	const { data } = await request.json();
	// Now you can build Excel from masalahList
	if(!data){
        throw Error("Data pada units kosong");
    }

            //console.log(combined);
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet('Customers');

		// Header
		sheet.columns = [
			{ header: 'No', key: 'No', width: 5 },
			{ header: 'Host', key: 'Host', width: 20 },
			{ header: 'Nama Kostumer', key: 'Nama_Kostumer', width: 25 },
			{ header: 'Agent', key: 'Agent', width: 20 },
			{ header: 'Durasi', key: 'Durasi', width: 15 },
			{ header: 'Harga', key: 'Harga', width: 20 },
			{ header: 'Komisi', key: 'Komisi', width: 20 },
			{ header: 'Masuk', key: 'Masuk', width: 15 },
			{ header: 'Keluar', key: 'Keluar', width: 15 }
		];


		// Add rows
		for (const item of data ?? []) {
			const row = sheet.addRow({
				No: item.no,
				Host: item.hostName ?? '',
				Nama_Kostumer: item.customerName ?? '',
				Agent: item.agent ?? '',
				Durasi: item.duration ? Number(item.duration) : '',
				Harga: item.price ? Number(item.price) : '',
				Komisi: item.commision ? Number(item.commision) : '',
				Masuk: item.fromTime ? toExcelLocalTime(item.fromTime) : '',
				Keluar: item.toTime ? toExcelLocalTime(item.toTime) : ''
			});

			// Format numbers
			if (row.getCell('Harga').value && row.getCell('Komisi').value) {
				row.getCell('Harga').numFmt = '#,##0.00';
				row.getCell('Komisi').numFmt = '#,##0.00';
			}

			// Format duration as number (no decimal)
			if (row.getCell('Durasi').value) {
				row.getCell('Durasi').numFmt = '0';
			}

			// Format date cells
			for (const key of ['Masuk', 'Keluar']) {
				const cell = row.getCell(key);
				if (cell.value instanceof Date) {
					cell.numFmt = 'yyyy-mm-dd hh:mm';
				}
			}
		}

		// Auto-fit column width
		sheet.columns.forEach((col) => {
			if(col !== undefined && col.header !== undefined && col.key !== undefined){
                col.width = Math.max(
                    col.header.length + 2,
                    ...sheet.getColumn(col.key).values.map((v) => (v ? v.toString().length : 0))
                );
            }
		});

		// Optional styling
		sheet.getRow(1).font = { bold: true };
		sheet.getRow(1).alignment = { horizontal: 'center' };

		// Save file
		const buffer = new Blob([await workbook.xlsx.writeBuffer()]);

    return new Response(buffer, {
		headers: {
			'Content-Type':
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment;"',
			'Cache-Control': 'no-cache'
		}
	});
};