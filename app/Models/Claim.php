<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Claim extends Model
{
    use HasFactory, BelongsToCompany, SoftDeletes;

    protected $fillable = [
        'company_id',
        'customer_id',
        'contract_id',
        'contract_payment_id',
        'claim_number',
        'amount',
        'due_date',
        'status',
        'timeline',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'timeline' => 'array',
            'amount' => 'decimal:2',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function contractPayment()
    {
        return $this->belongsTo(ContractPayment::class, 'contract_payment_id');
    }

    /**
     * Number of days overdue (0 if not overdue).
     */
    public function getDaysOverdueAttribute(): int
    {
        if ($this->due_date->isPast() && $this->status !== 'paid') {
            return (int) $this->due_date->diffInDays(Carbon::today());
        }
        return 0;
    }

    /**
     * Append a note to the timeline and save.
     */
    public function addTimelineNote(string $note, int $userId): void
    {
        $timeline = $this->timeline ?? [];
        $timeline[] = [
            'date' => now()->toDateTimeString(),
            'note' => $note,
            'user_id' => $userId,
        ];
        $this->timeline = $timeline;
        $this->save();
    }

    /**
     * Mark as paid and sync the contract payment status.
     */
    public function markAsPaid(): void
    {
        $this->status = 'paid';
        $this->save();

        if ($this->contract_payment_id) {
            $this->contractPayment->update(['status' => 'paid']);
        }
    }
}
