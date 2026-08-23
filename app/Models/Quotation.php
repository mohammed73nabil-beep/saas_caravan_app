<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quotation extends Model
{
    use HasFactory, BelongsToCompany, SoftDeletes;

    protected $fillable = [
        'company_id',
        'customer_id',
        'quotation_number',
        'description',
        'total_amount',
        'deposit_amount',
        'delivery_amount',
        'expires_at',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function contract()
    {
        return $this->hasOne(Contract::class);
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Recalculate total amount from items.
     */
    public function recalculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('total');
        $this->save();
    }
}
