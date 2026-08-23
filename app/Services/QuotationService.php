<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Contract;
use App\Models\Quotation;
use Illuminate\Support\Facades\DB;

class QuotationService
{
    /**
     * Convert an accepted quotation to a contract inside a DB transaction.
     * Copies customer, items, and total. Rolls back fully if any step fails.
     */
    public function convertToContract(Quotation $quotation): Contract
    {
        return DB::transaction(function () use ($quotation) {
            $contract = Contract::create([
                'company_id'       => $quotation->company_id,
                'customer_id'      => $quotation->customer_id,
                'quotation_id'     => $quotation->id,
                'contract_number'  => $this->nextContractNumber($quotation->company_id),
                'total_value'      => $quotation->total_amount,
                'signed_at'        => now()->toDateString(),
                'delivery_due_at'  => now()->addMonths(3)->toDateString(),
                'status'           => 'active',
            ]);

            // Update quotation status to accepted (it should already be accepted)
            $quotation->update(['status' => 'accepted']);

            AuditLog::record('converted_to_contract', $quotation, [
                'contract_id'     => $contract->id,
                'contract_number' => $contract->contract_number,
            ]);

            return $contract;
        });
    }

    /**
     * Generate the next sequential quotation number for this company.
     */
    public static function nextQuotationNumber(int $companyId): string
    {
        $year = now()->year;
        $lastNumber = Quotation::withoutGlobalScopes()
            ->where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->max(DB::raw("CAST(SUBSTRING_INDEX(quotation_number, '-', -1) AS UNSIGNED)"));

        $next = ($lastNumber ?? 0) + 1;
        return "Q-{$year}-" . str_pad($next, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate the next sequential contract number for this company.
     */
    public static function nextContractNumber(int $companyId): string
    {
        $year = now()->year;
        $lastNumber = Contract::withoutGlobalScopes()
            ->where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->max(DB::raw("CAST(SUBSTRING_INDEX(contract_number, '-', -1) AS UNSIGNED)"));

        $next = ($lastNumber ?? 0) + 1;
        return "CTR-{$year}-" . str_pad($next, 6, '0', STR_PAD_LEFT);
    }
}
