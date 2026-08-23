<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyLedger extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'date',
        'description',
        'type', // receipt / payment
        'amount',
        'source',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'amount' => 'decimal:2',
        ];
    }
}
