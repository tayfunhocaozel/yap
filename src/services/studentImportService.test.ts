import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseStudentFile } from './studentImportService';

// Gerçek okul raporu (docs/classroom/*.xls) gerçek öğrenci kişisel verisi
// içerdiği için repoya dahil edilmez (bkz. 12_CHANGELOG.md v0.4.0). Testler,
// aynı sütun yapısına sahip (S.No, Öğrenci No, Adı, Soyadı, Cinsiyeti +
// özet altbilgi satırı) sahte veriyle bellekte üretilen bir .xls kullanır.
function buildSampleXlsFile(): File {
  const rows = [
    ['S.No', 'Öğrenci No', '', '', 'Adı', '', '', '', '', 'Soyadı', '', '', '', 'Cinsiyeti', ''],
    ['1', '287', '', '', 'ASLI', '', '', '', '', 'YILMAZ', '', '', '', 'Kız', ''],
    ['2', '502', '', '', 'BEREN', '', '', '', '', 'ÇAKMAK', '', '', '', 'Kız', ''],
    ['3', '706', '', '', 'MESUT', '', '', '', '', 'MUTLU', '', '', '', 'Erkek', ''],
    [
      'Kız Öğrenci Sayısı        :',
      '',
      '',
      '',
      '2',
      'Erkek Öğrenci Sayısı    :',
      '',
      '',
      '1',
      '',
      'Toplam Öğrenci Sayısı    :',
      '',
      '',
      '3',
      '',
    ],
    ['', '', '', '', '', '', '', '', '', '', '', '06/07/2026', '10:20:53 ', '', '1'],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xls' }) as ArrayBuffer;
  return new File([buffer], 'ornek-sinif-listesi.xls');
}

describe('studentImportService', () => {
  it('okul raporu formatındaki (S.No/Öğrenci No/Adı/Soyadı/Cinsiyeti) tüm öğrencileri okur', async () => {
    const result = await parseStudentFile(buildSampleXlsFile());

    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(3);
    expect(result.validRows[0]).toEqual({ rowNumber: 2, schoolNumber: '287', fullName: 'ASLI YILMAZ' });
  });

  it('özet ve altbilgi satırlarını öğrenci olarak almaz', async () => {
    const result = await parseStudentFile(buildSampleXlsFile());
    const names = result.validRows.map((r) => r.fullName);
    expect(names.every((n) => !n.includes('Öğrenci Sayısı'))).toBe(true);
  });

  it('dosyada tekrar eden okul numarasını hata olarak işaretler', async () => {
    const csv = 'Öğrenci No,Adı,Soyadı\n101,Ali,Kaya\n101,Veli,Demir\n';
    const file = new File([csv], 'ogrenciler.csv');

    const result = await parseStudentFile(file);

    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].reason).toContain('birden fazla kez');
  });

  it('ad veya soyad eksikse satırı hata olarak işaretler', async () => {
    const csv = 'Öğrenci No,Adı,Soyadı\n101,,Kaya\n';
    const file = new File([csv], 'ogrenciler.csv');

    const result = await parseStudentFile(file);

    expect(result.validRows).toHaveLength(0);
    expect(result.errors[0].reason).toContain('Ad veya soyad eksik');
  });
});
