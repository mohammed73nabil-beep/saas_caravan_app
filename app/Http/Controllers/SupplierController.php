<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = Supplier::withCount('purchaseOrders')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('phone', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters'   => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Suppliers/Form');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'phone'          => 'required|string|max:30',
            'supply_type'    => 'required|string|max:255',
            'notes'          => 'nullable|string',
        ]);

        Supplier::create($data);
        return redirect()->route('suppliers.index')->with('success', 'تم إضافة المورد بنجاح.');
    }

    public function show(Supplier $supplier)
    {
        $supplier->load(['purchaseOrders' => fn($q) => $q->with('caravanUnit')->latest()]);

        $stats = [
            'total_orders'    => $supplier->purchaseOrders->count(),
            'total_amount'    => $supplier->purchaseOrders->sum('total_amount'),
            'pending_amount'  => $supplier->purchaseOrders
                ->whereNotIn('status', ['fully_received'])->sum('total_amount'),
        ];

        return Inertia::render('Suppliers/Show', [
            'supplier' => $supplier,
            'stats'    => $stats,
        ]);
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Form', ['supplier' => $supplier]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'phone'          => 'required|string|max:30',
            'supply_type'    => 'required|string|max:255',
            'notes'          => 'nullable|string',
        ]);

        $supplier->update($data);
        return redirect()->route('suppliers.show', $supplier)->with('success', 'تم تحديث بيانات المورد.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->route('suppliers.index')->with('success', 'تم حذف المورد.');
    }

    public function quickStore(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'phone'          => 'required|string|max:30',
            'supply_type'    => 'required|string|max:255',
            'notes'          => 'nullable|string',
        ]);

        $supplier = Supplier::create($data);
        return response()->json($supplier);
    }
}
