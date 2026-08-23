<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DailyLedgerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

// ─── Guest routes ────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);

    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:10,1');
});

// ─── Public Signed routes (No Auth Required) ──────────────────────────────────
Route::get('public/quotations/{quotation}', [QuotationController::class, 'publicView'])
    ->name('public.quotations.show')
    ->middleware('signed');

// ─── Authenticated routes ─────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Customers
    Route::resource('customers', CustomerController::class);

    // Quotations
    Route::resource('quotations', QuotationController::class);
    Route::get('quotations/{quotation}/print', [QuotationController::class, 'print'])->name('quotations.print');
    Route::post('quotations/{quotation}/convert', [QuotationController::class, 'convert'])->name('quotations.convert');

    // Contracts
    Route::resource('contracts', ContractController::class);
    Route::patch('contracts/{contract}/payments/{payment}', [ContractController::class, 'updatePayment'])->name('contracts.payments.update');

    // Claims
    Route::get('claims/create', [ClaimController::class, 'create'])->name('claims.create');
    Route::resource('claims', ClaimController::class)->except(['create', 'edit']);
    Route::post('claims/{claim}/notes', [ClaimController::class, 'addNote'])->name('claims.notes');

    // Suppliers
    Route::resource('suppliers', SupplierController::class);

    // Purchase Orders
    Route::resource('purchase-orders', PurchaseOrderController::class);

    // Daily Ledger
    Route::get('ledger', [DailyLedgerController::class, 'index'])->name('ledger.index');
    Route::post('ledger', [DailyLedgerController::class, 'store'])->name('ledger.store');
    Route::put('ledger/{dailyLedger}', [DailyLedgerController::class, 'update'])->name('ledger.update');
    Route::delete('ledger/{dailyLedger}', [DailyLedgerController::class, 'destroy'])->name('ledger.destroy');

    // Team Management (owner only)
    Route::get('team', [TeamController::class, 'index'])->name('team.index');
    Route::post('team', [TeamController::class, 'store'])->name('team.store');
    Route::delete('team/{user}', [TeamController::class, 'destroy'])->name('team.destroy');

    // Export
    Route::get('export', [ExportController::class, 'index'])->name('export.index');
    Route::get('export/download', [ExportController::class, 'download'])->name('export.download');

    // Attachments
    Route::post('attachments', [AttachmentController::class, 'store'])->name('attachments.store');
    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy'])->name('attachments.destroy');

    // Settings
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/theme', [SettingsController::class, 'updateTheme'])->name('settings.theme');

    // Quick Store APIs
    Route::post('api/suppliers/quick', [SupplierController::class, 'quickStore'])->name('api.suppliers.quick');
    Route::post('api/customers/quick', [CustomerController::class, 'quickStore'])->name('api.customers.quick');
});
