<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Quotation;
use App\Services\QuotationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\URL;

class QuotationController extends Controller
{
    public function __construct(protected QuotationService $service) {}

    public function index(Request $request)
    {
        $quotations = Quotation::with('customer')
            ->when($request->search, fn($q) => $q->where('quotation_number', 'like', "%{$request->search}%")
                ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$request->search}%")))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'filters'    => $request->only('search', 'status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Quotations/Form', [
            'customers' => Customer::select('id', 'name')->get(),
            'nextNumber' => QuotationService::nextQuotationNumber(auth()->user()->company_id),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'description' => 'nullable|string',
            'expires_at'  => 'required|date',
            'status'      => 'in:draft,sent',
            'deposit_amount'  => 'nullable|numeric|min:0',
            'delivery_amount' => 'nullable|numeric|min:0',
            'items'       => 'required|array|min:1',
            'items.*.item_name'  => 'required|string',
            'items.*.quantity'   => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $quotation = Quotation::create([
            'customer_id'      => $data['customer_id'],
            'quotation_number' => QuotationService::nextQuotationNumber(auth()->user()->company_id),
            'description'      => $data['description'],
            'expires_at'       => $data['expires_at'],
            'status'           => $data['status'] ?? 'draft',
            'deposit_amount'   => $data['deposit_amount'] ?? null,
            'delivery_amount'  => $data['delivery_amount'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            $quotation->items()->create($item);
        }

        AuditLog::record('created', $quotation);
        return redirect()->route('quotations.show', $quotation)->with('success', 'تم إنشاء عرض السعر بنجاح.');
    }

    public function show(Quotation $quotation)
    {
        $quotation->load(['customer', 'items', 'attachments.uploader', 'contract']);
        $shareUrl = URL::temporarySignedRoute('public.quotations.show', now()->addDays(7), ['quotation' => $quotation->id]);

        $user = auth()->user()->load('company');

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation,
            'shareUrl'  => $shareUrl,
            'auth'      => [
                'user' => [
                    'name'    => $user->name,
                    'company' => $user->company ? ['name' => $user->company->name] : null,
                ],
            ],
        ]);
    }

    public function publicView(Quotation $quotation)
    {
        // Security check: Verify scope of company
        $company = $quotation->company;
        if (!$company) {
            abort(403, 'غير مصرح للوصول لهذه الشركة');
        }

        $quotation->load(['customer', 'items']);
        return view('print.quotation', compact('quotation', 'company'));
    }

    public function edit(Quotation $quotation)
    {
        $quotation->load('items');
        return Inertia::render('Quotations/Form', [
            'quotation' => $quotation,
            'customers' => Customer::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Quotation $quotation)
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'description' => 'nullable|string',
            'expires_at'  => 'required|date',
            'status'      => 'in:draft,sent,accepted,rejected,expired',
            'deposit_amount'  => 'nullable|numeric|min:0',
            'delivery_amount' => 'nullable|numeric|min:0',
            'items'       => 'required|array|min:1',
            'items.*.item_name'  => 'required|string',
            'items.*.quantity'   => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $oldStatus = $quotation->status;
        $quotation->update(array_merge(
            $data,
            ['deposit_amount' => $data['deposit_amount'] ?? null, 'delivery_amount' => $data['delivery_amount'] ?? null]
        ));

        // Sync items: delete old, create new
        $quotation->items()->delete();
        foreach ($data['items'] as $item) {
            $quotation->items()->create($item);
        }

        AuditLog::record('updated', $quotation, ['old_status' => $oldStatus, 'new_status' => $data['status']]);
        return redirect()->route('quotations.show', $quotation)->with('success', 'تم تحديث عرض السعر.');
    }

    public function destroy(Quotation $quotation)
    {
        $quotation->delete();
        return redirect()->route('quotations.index')->with('success', 'تم حذف عرض السعر.');
    }

    /**
     * Show printable quotation.
     */
    public function print(Quotation $quotation)
    {
        $quotation->load(['customer', 'items']);
        // The company is scoped by default, but we can access it through the current user
        $company = auth()->user()->company;
        return view('print.quotation', compact('quotation', 'company'));
    }

    /**
     * Convert accepted quotation to a contract.
     */
    public function convert(Quotation $quotation)
    {
        abort_if($quotation->status !== 'accepted', 403, 'يجب أن يكون عرض السعر مقبولاً أولاً.');

        $contract = $this->service->convertToContract($quotation);
        return redirect()->route('contracts.show', $contract)->with('success', 'تم تحويل عرض السعر إلى عقد بنجاح.');
    }
}
