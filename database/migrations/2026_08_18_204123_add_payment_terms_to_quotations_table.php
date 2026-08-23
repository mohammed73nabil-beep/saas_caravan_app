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
        Schema::table('quotations', function (Blueprint $table) {
            $table->decimal('deposit_amount', 12, 2)->nullable()->after('total_amount');    // المبلغ الأول (العربون)
            $table->decimal('delivery_amount', 12, 2)->nullable()->after('deposit_amount'); // المبلغ المتبقي عند التسليم
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn(['deposit_amount', 'delivery_amount']);
        });
    }
};
