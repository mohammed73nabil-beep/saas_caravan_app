<?php

namespace App\Http\Controllers;

use App\Models\CaravanUnit;
use App\Models\Contract;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Services\ClaimService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = PurchaseOrder::with(['supplier', 'caravanUnit'])
            ->when($request->search, fn($q) => $q->where('po_number', 'like', "%{$request->search}%")
                ->orWhereHas('supplier', fn($sq) => $sq->where('name', 'like', "%{$request->search}%")))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('PurchaseOrders/Index', [
            'orders'  => $orders,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('PurchaseOrders/Form', [
            'suppliers'     => Supplier::select('id', 'name')->get(),
            'caravanUnits'  => CaravanUnit::with('contract:id,contract_number')->select('id', 'name', 'contract_id')->get(),
            'nextNumber'    => ClaimService::nextPoNumber(auth()->user()->company_id),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id'              => 'required|exists:suppliers,id',
            'caravan_unit_id'          => 'nullable|exists:caravan_units,id',
            'order_date'               => 'required|date',
            'expected_delivery_date'   => 'nullable|date',
            'status'                   => 'in:requested,ordered,partially_received,fully_received',
            'items'                    => 'required|array|min:1',
            'items.*.item_name'        => 'required|string',
            'items.*.quantity'         => 'required|numeric|min:0.01',
            'items.*.unit_price'       => 'required|numeric|min:0',
        ]);

        $order = PurchaseOrder::create([
            'supplier_id'            => $data['supplier_id'],
            'caravan_unit_id'        => $data['caravan_unit_id'],
            'po_number'              => ClaimService::nextPoNumber(auth()->user()->company_id),
            'order_date'             => $data['order_date'],
            'expected_delivery_date' => $data['expected_delivery_date'],
            'status'                 => $data['status'] ?? 'requested',
        ]);

        foreach ($data['items'] as $item) {
            $order->items()->create($item);
        }

        return redirect()->route('purchase-orders.show', $order)->with('success', 'تم إنشاء أمر الشراء بنجاح.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'caravanUnit.contract', 'items']);
        return Inertia::render('PurchaseOrders/Show', ['order' => $purchaseOrder]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        return Inertia::render('PurchaseOrders/Form', [
            'order'        => $purchaseOrder->load('items'),
            'suppliers'    => Supplier::select('id', 'name')->get(),
            'caravanUnits' => CaravanUnit::with('contract:id,contract_number')->select('id', 'name', 'contract_id')->get(),
        ]);
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $data = $request->validate([
            'supplier_id'              => 'required|exists:suppliers,id',
            'caravan_unit_id'          => 'nullable|exists:caravan_units,id',
            'order_date'               => 'required|date',
            'expected_delivery_date'   => 'nullable|date',
            'status'                   => 'required|in:requested,ordered,partially_received,fully_received',
            'items'                    => 'required|array|min:1',
            'items.*.item_name'        => 'required|string',
            'items.*.quantity'         => 'required|numeric|min:0.01',
            'items.*.unit_price'       => 'required|numeric|min:0',
        ]);

        $purchaseOrder->update($data);
        $purchaseOrder->items()->delete();
        foreach ($data['items'] as $item) {
            $purchaseOrder->items()->create($item);
        }

        return redirect()->route('purchase-orders.show', $purchaseOrder)->with('success', 'تم تحديث أمر الشراء.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();
        return redirect()->route('purchase-orders.index')->with('success', 'تم حذف أمر الشراء.');
    }
}
