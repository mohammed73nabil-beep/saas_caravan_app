<?php

namespace App\Services;

use App\Models\Claim;
use App\Models\ContractPayment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ClaimService
{
    /**
     * Scan overdue contract payments and auto-create Claims for them.
     * Called by a scheduled command (daily).
     */
    public function syncOverduePayments(): void
    {
        // Find all overdue payments (past due_date, not paid, not already claimed)
        $overduePayments = ContractPayment::withoutGlobalScopes()
            ->where('status', '!=', 'paid')
            ->where('due_date', '<', Carbon::today())
            ->whereDoesntHave('claim')
            ->with('contract')
            ->get();

        foreach ($overduePayments as $payment) {
            DB::transaction(function () use ($payment) {
                // Update the payment status to overdue
                $payment->update(['status' => 'overdue']);

                // Create the claim automatically
                Claim::create([
                    'company_id'          => $payment->company_id,
                    'customer_id'         => $payment->contract->customer_id,
                    'contract_id'         => $payment->contract_id,
                    'contract_payment_id' => $payment->id,
                    'claim_number'        => $this->nextClaimNumber($payment->company_id),
                    'amount'              => $payment->amount,
                    'due_date'            => $payment->due_date,
                    'status'              => 'overdue',
                ]);
            });
        }

        // Also mark 'due_soon' (within 7 days) for upcoming payments
        ContractPayment::withoutGlobalScopes()
            ->where('status', 'pending')
            ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDays(7)])
            ->update(['status' => 'due']);
    }

    /**
     * Generate the next sequential claim number for this company.
     */
    public function nextClaimNumber(int $companyId): string
    {
        $year = now()->year;
        $lastNumber = Claim::withoutGlobalScopes()
            ->where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->max(DB::raw("CAST(SUBSTRING_INDEX(claim_number, '-', -1) AS UNSIGNED)"));

        $next = ($lastNumber ?? 0) + 1;
        return "CLM-{$year}-" . str_pad($next, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate the next sequential PO number for this company.
     */
    public static function nextPoNumber(int $companyId): string
    {
        $year = now()->year;
        $lastNumber = \App\Models\PurchaseOrder::withoutGlobalScopes()
            ->where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->max(DB::raw("CAST(SUBSTRING_INDEX(po_number, '-', -1) AS UNSIGNED)"));

        $next = ($lastNumber ?? 0) + 1;
        return "PO-{$year}-" . str_pad($next, 6, '0', STR_PAD_LEFT);
    }
}
