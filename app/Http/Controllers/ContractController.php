<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Claim;
use App\Models\Contract;
use App\Models\ContractPayment;
use App\Models\Customer;
use App\Services\ClaimService;
use App\Services\QuotationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractController extends Controller
{
    public function __construct(protected ClaimService $claimService) {}

    public function index(Request $request)
    {
        $contracts = Contract::with('customer')
            ->when($request->search, fn($q) => $q->where('contract_number', 'like', "%{$request->search}%")
                ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$request->search}%")))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Contracts/Index', [
            'contracts' => $contracts,
            'filters'   => $request->only('search', 'status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Contracts/Form', [
            'customers'  => Customer::select('id', 'name')->get(),
            'nextNumber' => QuotationService::nextContractNumber(auth()->user()->company_id),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id'     => 'required|exists:customers,id',
            'total_value'     => 'required|numeric|min:1',
            'signed_at'       => 'required|date',
            'delivery_due_at' => 'required|date',
            'payments'        => 'required|array|min:1',
            'payments.*.description' => 'required|string',
            'payments.*.amount'      => 'required|numeric|min:0.01',
            'payments.*.due_date'    => 'required|date',
        ]);

        $paymentsTotal = array_sum(array_column($data['payments'], 'amount'));
        if (abs($paymentsTotal - $data['total_value']) > 0.01) {
            return back()->withErrors(['payments' => 'مجموع الدفعات يجب أن يساوي قيمة العقد الإجمالية.']);
        }

        $contract = Contract::create([
            'customer_id'     => $data['customer_id'],
            'contract_number' => QuotationService::nextContractNumber(auth()->user()->company_id),
            'total_value'     => $data['total_value'],
            'signed_at'       => $data['signed_at'],
            'delivery_due_at' => $data['delivery_due_at'],
            'status'          => 'active',
        ]);

        foreach ($data['payments'] as $payment) {
            $contract->payments()->create($payment + ['status' => 'pending']);
        }

        AuditLog::record('created', $contract);
        return redirect()->route('contracts.show', $contract)->with('success', 'تم إنشاء العقد بنجاح.');
    }

    public function show(Contract $contract)
    {
        $contract->load([
            'customer',
            'quotation',
            'payments',
            'caravanUnits',
            'attachments.uploader',
            'claims.customer',
        ]);

        return Inertia::render('Contracts/Show', ['contract' => $contract]);
    }

    public function edit(Contract $contract)
    {
        return Inertia::render('Contracts/Form', [
            'contract'  => $contract->load('payments'),
            'customers' => Customer::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Contract $contract)
    {
        $data = $request->validate([
            'customer_id'     => 'required|exists:customers,id',
            'total_value'     => 'required|numeric|min:1',
            'signed_at'       => 'required|date',
            'delivery_due_at' => 'required|date',
            'status'          => 'in:active,completed,cancelled',
        ]);

        $oldStatus = $contract->status;
        $contract->update($data);

        AuditLog::record('updated', $contract, ['old_status' => $oldStatus, 'new_status' => $data['status']]);
        return redirect()->route('contracts.show', $contract)->with('success', 'تم تحديث العقد.');
    }

    public function destroy(Contract $contract)
    {
        // Cascade: nullify claims before soft-deleting so they're not orphaned
        $contract->claims()->update(['contract_id' => null, 'contract_payment_id' => null]);
        $contract->payments()->delete();
        $contract->delete();
        return redirect()->route('contracts.index')->with('success', 'تم حذف العقد ومحتوياته.');
    }

    /**
     * Update payment status.
     */
    public function updatePayment(Request $request, Contract $contract, ContractPayment $payment)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,due,overdue,paid',
        ]);

        $oldStatus = $payment->status;
        $payment->update($data);

        // If marked as paid, also update the linked claim if any
        if ($data['status'] === 'paid' && $payment->claim) {
            $payment->claim->update(['status' => 'paid']);
        }

        // ✅ Auto-complete contract when ALL payments are paid
        $contract->refresh();
        $allPaid = $contract->payments()->where('status', '!=', 'paid')->doesntExist();
        if ($allPaid && $contract->status === 'active') {
            $contract->update(['status' => 'completed']);
            AuditLog::record('auto_completed', $contract, ['reason' => 'all_payments_paid']);
        }

        AuditLog::record('status_changed', $payment, [
            'old' => $oldStatus,
            'new' => $data['status'],
        ]);

        return back()->with('success', 'تم تحديث حالة الدفعة.' . ($allPaid && $contract->wasChanged('status') ? ' 🎉 تم إكمال العقد تلقائياً.' : ''));
    }
}
