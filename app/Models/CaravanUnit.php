<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaravanUnit extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'contract_id',
        'name',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
