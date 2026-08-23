<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, BelongsToCompany, SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'notes',
    ];

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function claims()
    {
        return $this->hasMany(Claim::class);
    }
}
