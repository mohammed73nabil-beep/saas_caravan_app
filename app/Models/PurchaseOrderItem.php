<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'purchase_order_id',
        'item_name',
        'quantity',
        'unit_price',
        'total',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->total = $item->quantity * $item->unit_price;
        });

        static::saved(function ($item) {
            $item->purchaseOrder->recalculateTotal();
        });

        static::deleted(function ($item) {
            $item->purchaseOrder->recalculateTotal();
        });
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
