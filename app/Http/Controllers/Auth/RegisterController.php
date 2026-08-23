<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\CompanyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function __construct(protected CompanyService $companyService) {}

    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'name'         => 'required|string|max:255',
            'phone'        => 'nullable|string|max:30',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:8|confirmed',
        ]);

        $owner = $this->companyService->registerWithOwner($data);
        Auth::login($owner);

        return redirect()->route('dashboard');
    }
}
