<?php

namespace App\Exports;

use App\Models\DailyLedger;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class LedgerExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $companyId;
    protected $from;
    protected $to;

    public function __construct($companyId, $from, $to)
    {
        $this->companyId = $companyId;
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        return DailyLedger::where('company_id', $this->companyId)
            ->whereBetween('date', [$this->from, $this->to])
            ->orderBy('date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'تاريخ القيد',
            'البيان / الوصف',
            'نوع الحركة',
            'المبلغ المطلوب',
            'المصدر / المرجع',
            'ملاحظات محاسبية'
        ];
    }

    public function map($ledger): array
    {
        return [
            $ledger->date,
            $ledger->description,
            $ledger->type === 'receipt' ? 'قبض (+)' : 'صرف (-)',
            (float) $ledger->amount,
            $ledger->source ?? '-',
            $ledger->notes ?? '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->setRightToLeft(true);

        $sheet->getStyle('A1:F1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2B5D7C']
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ]
        ]);

        $sheet->freezePane('A2');

        $totalRows = $sheet->getHighestRow();
        $sheet->getStyle('D2:D' . $totalRows)->getNumberFormat()->setFormatCode('#,##0.00" ر.س"');

        for ($row = 2; $row <= $totalRows; $row++) {
            $sheet->getStyle("A{$row}:F{$row}")->getBorders()->getAllBorders()->applyFromArray([
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'E4E7EC']
            ]);

            if ($row % 2 == 1) {
                $sheet->getStyle("A{$row}:F{$row}")->getFill()->applyFromArray([
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F7F8FA']
                ]);
            }
        }
    }
}
