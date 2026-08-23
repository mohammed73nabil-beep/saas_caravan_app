<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\CompanyService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function __construct(protected CompanyService $companyService) {}

    public function index()
    {
        abort_if(auth()->user()->role !== 'owner', 403);

        $members = User::where('company_id', auth()->user()->company_id)
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->get();

        return Inertia::render('Team/Index', ['members' => $members]);
    }

    public function store(Request $request)
    {
        abort_if(auth()->user()->role !== 'owner', 403);

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $member = $this->companyService->addMember(auth()->user()->company, $data);

        AuditLog::record('member_added', $member);
        return redirect()->route('team.index')->with('success', 'تم إضافة العضو بنجاح.');
    }

    public function destroy(User $user)
    {
        abort_if(auth()->user()->role !== 'owner', 403);
        abort_if($user->company_id !== auth()->user()->company_id, 403);
        abort_if($user->id === auth()->id(), 403, 'لا يمكنك حذف حسابك الخاص.');
        abort_if($user->role === 'owner', 403, 'لا يمكن حذف مالك الحساب.');

        AuditLog::record('member_removed', $user);
        $user->delete();

        return redirect()->route('team.index')->with('success', 'تم إزالة العضو.');
    }
}
