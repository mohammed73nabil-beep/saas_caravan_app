<?php

namespace App\Exports;

use App\Models\Contract;
use App\Models\Quotation;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class SalesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $companyId;
    protected $from;
    protected $to;
    private $rowNumber = 0;

    public function __construct($companyId, $from, $to)
    {
        $this->companyId = $companyId;
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        // Query both contracts and quotations merged or contracts representing active sales
        return Contract::where('company_id', $this->companyId)
            ->with(['customer', 'quotation'])
            ->whereBetween('signed_at', [$this->from, $this->to])
            ->orderBy('signed_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'رقم العقد',
            'رقم عرض السعر المرتبط',
            'اسم العميل',
            'القيمة الإجمالية للعقد',
            'تاريخ التوقيع',
            'تاريخ التسليم المتوقع',
            'حالة العقد'
        ];
    }

    public function map($contract): array
    {
        return [
            $contract->contract_number,
            $contract->quotation->quotation_number ?? 'بدون عرض',
            $contract->customer->name ?? '-',
            (float) $contract->total_value,
            $contract->signed_at,
            $contract->delivery_due_at,
            $contract->status === 'active' ? 'نشط' : ($contract->status === 'completed' ? 'مكتمل' : 'ملغى')
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Set document direction to RTL
        $sheet->setRightToLeft(true);

        // Header Row Styling (Row 1)
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

        // Freeze Row
        $sheet->freezePane('A2');

        // Apply Borders & Zebra Striping
        $totalRows = $sheet->getHighestRow();
        
        // Format columns
        $sheet->getStyle('D2:D' . $totalRows)->getNumberFormat()->setFormatCode('#,##0.00" ر.س"');

        for ($row = 2; $row <= $totalRows; $row++) {
            // Borders
            $sheet->getStyle("A{$row}:G{$row}")->getBorders()->getAllBorders()->applyFromArray([
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'E4E7EC']
            ]);

            // Zebra Striping
            if ($row % 2 == 1) {
                $sheet->getStyle("A{$row}:G{$row}")->getFill()->applyFromArray([
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F7F8FA']
                ]);
            }
        }
    }
}
