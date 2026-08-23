<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $company = \App\Models\Company::create([
            'name' => 'شركة مصنع الكرفانات المتقدمة',
            'contact_name' => 'مدير النظام',
            'phone' => '0500000000',
            'email' => 'admin@caravan.com',
        ]);

        \App\Models\User::create([
            'company_id' => $company->id,
            'name' => 'مدير النظام',
            'email' => 'admin@caravan.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'owner',
        ]);
    }
}
