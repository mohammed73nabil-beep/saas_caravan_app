<?php

namespace App\Http\Controllers;

use App\Exports\SalesExport;
use App\Exports\ClaimsExport;
use App\Exports\LedgerExport;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function index()
    {
        return Inertia::render('Export/Index');
    }

    public function download(Request $request)
    {
        $request->validate([
            'type' => 'required|in:sales,claims,ledger',
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $company = auth()->user()->company;
        $companyId = $company->id;
        $companyName = preg_replace('/[^A-Za-z0-9\x{0600}-\x{06FF}\s_\-]/u', '', $company->name);
        $companyName = str_replace(' ', '-', $companyName);

        $from = Carbon::parse($request->from)->format('Y-m-d');
        $to   = Carbon::parse($request->to)->format('Y-m-d');

        return match ($request->type) {
            'sales'  => Excel::download(
                new SalesExport($companyId, $from, $to), 
                "مبيعات-{$companyName}-من-{$from}-إلى-{$to}.xlsx"
            ),
            'claims' => Excel::download(
                new ClaimsExport($companyId, $from, $to), 
                "مطالبات-{$companyName}-من-{$from}-إلى-{$to}.xlsx"
            ),
            'ledger' => Excel::download(
                new LedgerExport($companyId, $from, $to), 
                "دفتر-الحسابات-{$companyName}-من-{$from}-إلى-{$to}.xlsx"
            ),
        };
    }
}
