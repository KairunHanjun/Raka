import { toExcelLocalTime } from '$lib';
import ExcelJS from 'exceljs';

const accountTypeMap: Record<string, string> = {
    'FO': 'Front Office',
    'HK': 'House Keeping',
    'T': 'Teknisi',
    'H': 'Host'
  };

export const POST = async ({ request }) => {
    const { data } = await request.json();

    if(!data){
        throw Error("Data pada filteredAbsensi kosong");
    }

	const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Absensi');

    sheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama', key: 'name', width: 20 },
        { header: 'Jabatan', key: 'accountType', width: 15 },
        { header: 'Kapan Masuk', key: 'whenEntry', width: 25 },
        { header: 'Link Gambar', key: 'fotoUrl', width: 40 },
    ];

    data.forEach((item: any, i: any) => {
        sheet.addRow({
            no: i + 1,
            name: item.name,
            accountType: accountTypeMap[item.accountType] || 'Tidak Dikenali',
            whenEntry: toExcelLocalTime(item.when.toString()),
            fotoUrl: `https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${item.fotoUrl}.jpg`
        });
    });

    // Format column types
    sheet.eachRow((row, i) => {
        if (i === 1) return; // skip header
        const cell = row.getCell('whenEntry');
        cell.numFmt = 'dd-mmm-yyyy hh:mm';
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