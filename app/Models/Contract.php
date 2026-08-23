<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use HasFactory, BelongsToCompany, SoftDeletes;

    protected $fillable = [
        'company_id',
        'customer_id',
        'quotation_id',
        'contract_number',
        'total_value',
        'signed_at',
        'delivery_due_at',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    public function caravanUnits()
    {
        return $this->hasMany(CaravanUnit::class);
    }

    public function payments()
    {
        return $this->hasMany(ContractPayment::class);
    }

    public function claims()
    {
        return $this->hasMany(Claim::class);
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}
