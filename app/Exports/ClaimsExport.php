<?php

namespace App\Exports;

use App\Models\Claim;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ClaimsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
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
        return Claim::where('company_id', $this->companyId)
            ->with(['customer', 'contract'])
            ->whereBetween('due_date', [$this->from, $this->to])
            ->orderBy('due_date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'رقم المطالبة',
            'العميل المستحق عليه',
            'العقد المرتبط',
            'المبلغ المطلوب',
            'تاريخ الاستحقاق',
            'أيام التأخير',
            'حالة المطالبة'
        ];
    }

    public function map($claim): array
    {
        $statusNames = [
            'due_soon' => 'مستحق قريباً',
            'due_now' => 'مستحق الآن',
            'overdue' => 'متأخر الدفع',
            'claimed' => 'تمت المطالبة',
            'promised' => 'وعد بالدفع',
            'paid' => 'مدفوع'
        ];

        return [
            $claim->claim_number,
            $claim->customer->name ?? '-',
            $claim->contract->contract_number ?? 'يدوية مستقلة',
            (float) $claim->amount,
            $claim->due_date,
            $claim->days_overdue > 0 ? $claim->days_overdue . ' يوم' : 'لا يوجد',
            $statusNames[$claim->status] ?? $claim->status
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->setRightToLeft(true);

        $sheet->getStyle('A1:G1')->applyFromArray([
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
            $sheet->getStyle("A{$row}:G{$row}")->getBorders()->getAllBorders()->applyFromArray([
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'E4E7EC']
            ]);

            if ($row % 2 == 1) {
                $sheet->getStyle("A{$row}:G{$row}")->getFill()->applyFromArray([
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F7F8FA']
                ]);
            }
        }
    }
}
