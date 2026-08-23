<?php

namespace App\Http\Controllers;

use App\Models\DailyLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DailyLedgerController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->from ? Carbon::parse($request->from) : now()->startOfMonth();
        $to   = $request->to   ? Carbon::parse($request->to)   : now()->endOfMonth();

        $entries = DailyLedger::whereBetween('date', [$from, $to])
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->orderBy('date', 'desc')
            ->paginate(30)
            ->withQueryString();

        $totals = DailyLedger::whereBetween('date', [$from, $to])
            ->selectRaw("
                SUM(CASE WHEN type='receipt' THEN amount ELSE 0 END) as total_receipt,
                SUM(CASE WHEN type='payment' THEN amount ELSE 0 END) as total_payment
            ")->first();

        return Inertia::render('DailyLedger/Index', [
            'entries'       => $entries,
            'filters'       => $request->only('from', 'to', 'type'),
            'total_receipt' => $totals->total_receipt ?? 0,
            'total_payment' => $totals->total_payment ?? 0,
            'net'           => ($totals->total_receipt ?? 0) - ($totals->total_payment ?? 0),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date'        => 'required|date',
            'description' => 'required|string|max:255',
            'type'        => 'required|in:receipt,payment',
            'amount'      => 'required|numeric|min:0.01',
            'source'      => 'nullable|string|max:255',
            'notes'       => 'nullable|string',
        ]);

        DailyLedger::create($data);
        return back()->with('success', 'تم تسجيل القيد بنجاح.');
    }

    public function update(Request $request, DailyLedger $dailyLedger)
    {
        $data = $request->validate([
            'date'        => 'required|date',
            'description' => 'required|string|max:255',
            'type'        => 'required|in:receipt,payment',
            'amount'      => 'required|numeric|min:0.01',
            'source'      => 'nullable|string|max:255',
            'notes'       => 'nullable|string',
        ]);

        $dailyLedger->update($data);
        return back()->with('success', 'تم تحديث القيد.');
    }

    public function destroy(DailyLedger $dailyLedger)
    {
        $dailyLedger->delete();
        return back()->with('success', 'تم حذف القيد.');
    }
}
