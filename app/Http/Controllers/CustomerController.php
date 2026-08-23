<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::query()
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('phone', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters'   => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Customers/Form');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'phone'          => 'required|string|max:30',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        Customer::create($data);
        return redirect()->route('customers.index')->with('success', 'تم إضافة العميل بنجاح.');
    }

    public function show(Customer $customer)
    {
        $customer->load([
            'quotations' => fn($q) => $q->latest()->take(20),
            'contracts'  => fn($q) => $q->with('payments')->latest()->take(20),
            'claims'     => fn($q) => $q->latest()->take(20),
        ]);

        return Inertia::render('Customers/Show', ['customer' => $customer]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Customers/Form', ['customer' => $customer]);
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'phone'          => 'required|string|max:30',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $customer->update($data);
        return redirect()->route('customers.index')->with('success', 'تم تحديث بيانات العميل.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('customers.index')->with('success', 'تم حذف العميل.');
    }

    public function quickStore(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'phone'          => 'required|string|max:30',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $customer = Customer::create($data);
        return response()->json($customer);
    }
}
