<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Claim;
use App\Models\Customer;
use App\Models\Contract;
use App\Services\ClaimService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClaimController extends Controller
{
    public function __construct(protected ClaimService $claimService) {}

    public function index(Request $request)
    {
        $claims = Claim::with(['customer', 'contract'])
            ->when($request->search, fn($q) => $q->where('claim_number', 'like', "%{$request->search}%")
                ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$request->search}%")))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Claims/Index', [
            'claims'  => $claims,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Claims/Form', [
            'customers' => Customer::select('id', 'name')->get(),
            'contracts' => Contract::with('customer')->select('id', 'contract_number', 'customer_id')->get(),
            'nextNumber' => $this->claimService->nextClaimNumber(auth()->user()->company_id),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'contract_id' => 'nullable|exists:contracts,id',
            'amount'      => 'required|numeric|min:0.01',
            'due_date'    => 'required|date',
            'status'      => 'in:due_soon,due_now,overdue,claimed,promised,paid',
        ]);

        $claim = Claim::create([
            ...$data,
            'claim_number' => $this->claimService->nextClaimNumber(auth()->user()->company_id),
            'status'       => $data['status'] ?? 'due_soon',
        ]);

        AuditLog::record('created', $claim);
        return redirect()->route('claims.show', $claim)->with('success', 'تم إنشاء المطالبة بنجاح.');
    }

    public function show(Claim $claim)
    {
        $claim->load(['customer', 'contract', 'contractPayment']);

        $user = auth()->user()->load('company');

        return Inertia::render('Claims/Show', [
            'claim'    => $claim,
            'auth'     => [
                'user' => [
                    'name'    => $user->name,
                    'company' => $user->company ? ['name' => $user->company->name] : null,
                ],
            ],
        ]);
    }

    public function update(Request $request, Claim $claim)
    {
        $data = $request->validate([
            'status' => 'required|in:due_soon,due_now,overdue,claimed,promised,paid',
        ]);

        $oldStatus = $claim->status;

        if ($data['status'] === 'paid') {
            $claim->markAsPaid();
        } else {
            $claim->update($data);
        }

        AuditLog::record('status_changed', $claim, ['old' => $oldStatus, 'new' => $data['status']]);
        return back()->with('success', 'تم تحديث حالة المطالبة.');
    }

    public function destroy(Claim $claim)
    {
        $claim->delete();
        return redirect()->route('claims.index')->with('success', 'تم حذف المطالبة.');
    }

    /**
     * Add a follow-up note to the claim timeline.
     */
    public function addNote(Request $request, Claim $claim)
    {
        $request->validate(['note' => 'required|string|max:1000']);
        $claim->addTimelineNote($request->note, auth()->id());
        return back()->with('success', 'تم إضافة الملاحظة.');
    }
}
