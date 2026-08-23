<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $company = auth()->user()->company;
        return Inertia::render('Settings/Index', [
            'company' => $company
        ]);
    }

    public function update(Request $request)
    {
        $company = auth()->user()->company;

        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'phone'        => 'required|string|max:30',
            'email'        => 'required|email|max:255',
            'logo'         => 'nullable|image|max:2048', // 2MB max
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            
            // Store new logo under tenant-isolated path
            $path = $request->file('logo')->store('logos/' . $company->id, 'public');
            $data['logo_path'] = $path;
        }

        unset($data['logo']);

        $company->update($data);

        return back()->with('success', 'تم حفظ الإعدادات بنجاح.');
    }

    public function updateTheme(Request $request)
    {
        $request->validate([
            'theme_preference' => 'required|in:light,dark,system',
        ]);

        auth()->user()->update([
            'theme_preference' => $request->theme_preference
        ]);

        return back()->with('success', 'تم تحديث مظهر النظام.');
    }
}
