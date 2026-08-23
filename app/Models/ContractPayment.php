<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContractPayment extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'contract_id',
        'description',
        'amount',
        'due_date',
        'status', // pending, due, overdue, paid
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function claim()
    {
        return $this->hasOne(Claim::class, 'contract_payment_id');
    }
}
