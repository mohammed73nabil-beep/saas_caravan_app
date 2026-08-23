<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, BelongsToCompany, SoftDeletes;

    protected $fillable = [
        'company_id',
        'supplier_id',
        'caravan_unit_id',
        'po_number',
        'total_amount',
        'order_date',
        'expected_delivery_date',
        'status',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function caravanUnit()
    {
        return $this->belongsTo(CaravanUnit::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function recalculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('total');
        $this->save();
    }
}
