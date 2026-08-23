<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root view that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'company_id' => $request->user()->company_id,
                    'company' => $request->user()->company ? [
                        'id' => $request->user()->company->id,
                        'name' => $request->user()->company->name,
                        'logo_url' => $request->user()->company->logo_path ? asset('storage/' . $request->user()->company->logo_path) : null,
                    ] : null,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'overdueClaimsCount' => fn () => $request->user() 
                ? \App\Models\Claim::where('status', 'overdue')->count() 
                : 0,
        ]);
    }
}
