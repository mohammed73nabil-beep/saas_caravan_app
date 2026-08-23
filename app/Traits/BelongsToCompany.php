<?php

namespace App\Traits;

use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToCompany
{
    /**
     * Boot the BelongsToCompany trait.
     */
    protected static function bootBelongsToCompany(): void
    {
        static::creating(function ($model) {
            if (empty($model->company_id) && Auth::check()) {
                $model->company_id = Auth::user()->company_id;
            }
        });

        static::addGlobalScope('company', function (Builder $builder) {
            if (Auth::check()) {
                $builder->where('company_id', Auth::user()->company_id);
            }
        });
    }

    /**
     * Get the company that owns the record.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
