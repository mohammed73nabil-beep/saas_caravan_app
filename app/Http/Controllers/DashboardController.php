<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Contract;
use App\Models\ContractPayment;
use App\Models\DailyLedger;
use App\Models\PurchaseOrder;
use App\Models\Quotation;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        // Stats cards
        $stats = [
            'pending_quotations' => Quotation::whereIn('status', ['draft', 'sent'])->count(),
            'active_contracts'   => Contract::where('status', 'active')->count(),
            'open_claims_total'  => Claim::whereNotIn('status', ['paid'])->sum('amount'),
            'net_this_month'     => DailyLedger::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->selectRaw("SUM(CASE WHEN type='receipt' THEN amount ELSE -amount END) as net")
                ->value('net') ?? 0,
        ];

        // Needs attention: payments due within 7 days
        $dueSoonPayments = ContractPayment::with(['contract.customer'])
            ->where('status', '!=', 'paid')
            ->whereBetween('due_date', [Carbon::today(), Carbon::today()->addDays(7)])
            ->orderBy('due_date')
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'id'              => $p->id,
                'description'     => $p->description,
                'amount'          => $p->amount,
                'due_date'        => $p->due_date,
                'customer_name'   => $p->contract->customer->name ?? '-',
                'contract_number' => $p->contract->contract_number ?? '-',
            ]);

        // Overdue claims
        $overdueClaims = Claim::with(['customer'])
            ->where('status', 'overdue')
            ->orderBy('due_date')
            ->take(10)
            ->get()
            ->map(fn($c) => [
                'id'           => $c->id,
                'claim_number' => $c->claim_number,
                'amount'       => $c->amount,
                'due_date'     => $c->due_date,
                'days_overdue' => $c->days_overdue,
                'customer'     => $c->customer->name ?? '-',
            ]);

        // Overdue purchase orders
        $lateOrders = PurchaseOrder::with(['supplier'])
            ->whereNotIn('status', ['fully_received'])
            ->whereNotNull('expected_delivery_date')
            ->where('expected_delivery_date', '<', Carbon::today())
            ->orderBy('expected_delivery_date')
            ->take(5)
            ->get()
            ->map(fn($o) => [
                'id'          => $o->id,
                'po_number'   => $o->po_number,
                'supplier'    => $o->supplier->name ?? '-',
                'expected_at' => $o->expected_delivery_date,
                'status'      => $o->status,
            ]);

        // 1. Chart Data: Last 6 Months Net Ledger — single GROUP BY query
        $sixMonthsAgo = Carbon::today()->subMonths(5)->startOfMonth();
        $ledgerRows = DailyLedger::where('date', '>=', $sixMonthsAgo)
            ->selectRaw("DATE_FORMAT(date, '%Y-%m') as ym, SUM(CASE WHEN type='receipt' THEN amount ELSE -amount END) as net")
            ->groupByRaw("DATE_FORMAT(date, '%Y-%m')")
            ->orderBy('ym')
            ->pluck('net', 'ym');

        $monthsData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::today()->subMonths($i);
            $ym   = $date->format('Y-m');
            $monthsData[] = [
                'month' => $date->translatedFormat('M Y'),
                'net'   => (float)($ledgerRows[$ym] ?? 0),
            ];
        }

        // 2. Chart Data: Claim Distribution (Only open claims: status != paid)
        $claimsStats = Claim::whereNotIn('status', ['paid'])
            ->select('status', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn($row) => [
                'status' => $row->status,
                'count'  => (int)$row->count,
                'total'  => (float)$row->total,
            ])
            ->toArray();

        return Inertia::render('Dashboard', compact(
            'stats',
            'dueSoonPayments',
            'overdueClaims',
            'lateOrders',
            'monthsData',
            'claimsStats'
        ));
    }
}
