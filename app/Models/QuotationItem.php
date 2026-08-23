<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationItem extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'quotation_id',
        'item_name',
        'quantity',
        'unit_price',
        'total',
    ];

    protected static function boot()
    {
        parent::boot();

        // Calculate total automatically before saving
        static::saving(function ($item) {
            $item->total = $item->quantity * $item->unit_price;
        });

        // Recalculate quotation total after saved or deleted
        static::saved(function ($item) {
            $item->quotation->recalculateTotal();
        });

        static::deleted(function ($item) {
            $item->quotation->recalculateTotal();
        });
    }

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}
