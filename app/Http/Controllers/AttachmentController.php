<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Claim;
use App\Models\Contract;
use App\Models\PurchaseOrder;
use App\Models\Quotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    /** Map of type strings to model classes */
    private const TYPE_MAP = [
        'Quotation'     => Quotation::class,
        'Contract'      => Contract::class,
        'Claim'         => Claim::class,
        'PurchaseOrder' => PurchaseOrder::class,
    ];

    public function store(Request $request)
    {
        $data = $request->validate([
            'file'            => 'required|file|max:10240', // max 10MB
            'attachable_type' => 'required|string|in:Quotation,Contract,Claim,PurchaseOrder',
            'attachable_id'   => 'required|integer',
        ]);

        $modelClass = self::TYPE_MAP[$data['attachable_type']];

        // ✅ Security fix: ensure the record belongs to the current company
        $model = $modelClass::findOrFail($data['attachable_id']);
        abort_if(
            $model->company_id !== auth()->user()->company_id,
            403,
            'غير مصرح بالوصول إلى هذا السجل.'
        );

        // Store file in tenant-isolated folder in public disk
        $path = $request->file('file')->store('attachments/' . auth()->user()->company_id, 'public');

        Attachment::create([
            'company_id'      => auth()->user()->company_id,
            'attachable_type' => $modelClass,
            'attachable_id'   => $model->id,
            'file_name'       => $request->file('file')->getClientOriginalName(),
            'file_path'       => $path,
            'mime_type'       => $request->file('file')->getClientMimeType(),
            'file_size'       => $request->file('file')->getSize(),
            'uploaded_by'     => auth()->id(),
        ]);

        return back()->with('success', 'تم رفع الملف المرفق بنجاح.');
    }

    public function destroy(Attachment $attachment)
    {
        abort_if($attachment->company_id !== auth()->user()->company_id, 403);

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return back()->with('success', 'تم حذف الملف المرفق.');
    }
}
