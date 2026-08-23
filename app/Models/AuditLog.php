<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false; // Only has created_at

    protected $fillable = [
        'company_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'details',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Quick helper to create an audit log entry.
     */
    public static function record(string $action, Model $entity, ?array $details = null): void
    {
        if (auth()->check()) {
            static::create([
                'company_id' => auth()->user()->company_id,
                'user_id'    => auth()->id(),
                'action'     => $action,
                'entity_type' => class_basename($entity),
                'entity_id'  => $entity->getKey(),
                'details'    => $details,
                'created_at' => now(),
            ]);
        }
    }
}
