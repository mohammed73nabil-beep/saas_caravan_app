<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CompanyService
{
    /**
     * Register a new company + owner user inside a single DB transaction.
     * Rolls back completely if any step fails.
     */
    public function registerWithOwner(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $company = Company::create([
                'name'         => $data['company_name'],
                'contact_name' => $data['name'],
                'phone'        => $data['phone'] ?? '',
                'email'        => $data['email'],
            ]);

            $owner = User::create([
                'company_id' => $company->id,
                'name'       => $data['name'],
                'email'      => $data['email'],
                'password'   => Hash::make($data['password']),
                'role'       => 'owner',
            ]);

            return $owner;
        });
    }

    /**
     * Add a member to the owner's company.
     */
    public function addMember(Company $company, array $data): User
    {
        return User::create([
            'company_id' => $company->id,
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'role'       => 'member',
        ]);
    }
}
