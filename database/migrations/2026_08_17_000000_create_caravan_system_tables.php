<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('contact_person');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Suppliers
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('contact_person');
            $table->string('phone');
            $table->string('supply_type');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // 3. Quotations
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('quotation_number'); // e.g., Q-2026-000001
            $table->text('description')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->date('expires_at');
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'expired'])->default('draft');
            $table->softDeletes();
            $table->timestamps();

            // Index for unique check per company
            $table->unique(['company_id', 'quotation_number']);
        });

        // 4. Quotation Items
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('quotation_id')->constrained('quotations')->onDelete('cascade');
            $table->string('item_name');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });

        // 5. Contracts
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('quotation_id')->nullable()->constrained('quotations')->onDelete('set null');
            $table->string('contract_number'); // e.g., CTR-2026-000001
            $table->decimal('total_value', 12, 2);
            $table->date('signed_at');
            $table->date('delivery_due_at');
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['company_id', 'contract_number']);
        });

        // 6. Contract Payments (Schedule)
        Schema::create('contract_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('contract_id')->constrained('contracts')->onDelete('cascade');
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->date('due_date');
            $table->enum('status', ['pending', 'due', 'overdue', 'paid'])->default('pending');
            $table->timestamps();
        });

        // 7. Caravan Units
        Schema::create('caravan_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('contract_id')->constrained('contracts')->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
        });

        // 8. Purchase Orders
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->foreignId('caravan_unit_id')->nullable()->constrained('caravan_units')->onDelete('set null');
            $table->string('po_number'); // e.g., PO-2026-000001
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->enum('status', ['requested', 'ordered', 'partially_received', 'fully_received'])->default('requested');
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['company_id', 'po_number']);
        });

        // 9. Purchase Order Items
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->onDelete('cascade');
            $table->string('item_name');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });

        // 10. Daily Ledger
        Schema::create('daily_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->date('date');
            $table->string('description');
            $table->enum('type', ['receipt', 'payment']);
            $table->decimal('amount', 12, 2);
            $table->string('source')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 11. Claims (Receivables)
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->onDelete('set null');
            $table->foreignId('contract_payment_id')->nullable()->constrained('contract_payments')->onDelete('set null');
            $table->string('claim_number'); // e.g., CLM-2026-000001
            $table->decimal('amount', 12, 2);
            $table->date('due_date');
            $table->enum('status', ['due_soon', 'due_now', 'overdue', 'claimed', 'promised', 'paid'])->default('due_soon');
            $table->json('timeline')->nullable(); // For tracking timeline updates
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['company_id', 'claim_number']);
        });

        // 12. Attachments
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->morphs('attachable'); // attachable_type, attachable_id
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type');
            $table->unsignedInteger('file_size');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 13. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // created, updated, etc.
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id');
            $table->json('details')->nullable();
            $table->timestamp('created_at')->useCurrent(); // Static logs without updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('claims');
        Schema::dropIfExists('daily_ledgers');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('caravan_units');
        Schema::dropIfExists('contract_payments');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('quotation_items');
        Schema::dropIfExists('quotations');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('customers');
    }
};
