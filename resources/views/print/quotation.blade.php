<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>عرض سعر #{{ $quotation->quotation_number }}</title>
    
    <!-- Google Fonts (Tajawal) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #ffffff;
            color: #1F2430;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.6;
        }

        .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #E4E7EC;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .company-info h1 {
            font-size: 26px;
            font-weight: 900;
            color: #2B5D7C;
            margin: 0 0 10px 0;
        }

        .company-info p {
            margin: 3px 0;
            color: #6B7280;
        }

        .document-title {
            text-align: left;
        }

        .document-title h2 {
            font-size: 22px;
            font-weight: 700;
            color: #1F2430;
            margin: 0 0 10px 0;
        }

        .document-title p {
            margin: 3px 0;
            color: #6B7280;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
        }

        .section-card {
            border: 1px solid #E4E7EC;
            border-radius: 6px;
            padding: 15px;
            background-color: #F7F8FA;
        }

        .section-card h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 700;
            color: #2B5D7C;
            border-bottom: 1px solid #E4E7EC;
            padding-bottom: 5px;
        }

        .section-card p {
            margin: 5px 0;
        }

        .section-card strong {
            color: #1F2430;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        table th {
            background-color: #2B5D7C;
            color: #ffffff;
            font-weight: 700;
            text-align: right;
            padding: 10px 12px;
            font-size: 14px;
        }

        table td {
            padding: 12px;
            border-bottom: 1px solid #E4E7EC;
            font-size: 13px;
        }

        table tr:nth-child(even) {
            background-color: #F7F8FA;
        }

        .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 50px;
        }

        .totals-table {
            width: 300px;
            margin: 0;
        }

        .totals-table td {
            padding: 8px 12px;
            border-bottom: none;
        }

        .totals-table tr.grand-total td {
            font-size: 18px;
            font-weight: 900;
            color: #2B5D7C;
            border-top: 2px solid #2B5D7C;
            padding-top: 12px;
        }

        .terms-container {
            margin-bottom: 60px;
            border-top: 1px solid #E4E7EC;
            padding-top: 20px;
        }

        .terms-container h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #1F2430;
        }

        .terms-container p {
            color: #6B7280;
            margin: 0;
            white-space: pre-line;
        }

        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 80px;
            padding: 0 40px;
        }

        .signature-box {
            text-align: center;
            width: 200px;
        }

        .signature-line {
            border-top: 1px solid #1F2430;
            margin-top: 50px;
            padding-top: 5px;
            font-weight: 700;
        }

        /* Printable optimization */
        @media print {
            body {
                padding: 0;
                font-size: 12px;
            }
            .no-print {
                display: none;
            }
            .section-card {
                background-color: #ffffff !important;
                border: 1px solid #E4E7EC !important;
            }
            table th {
                background-color: #2B5D7C !important;
                color: #ffffff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            table tr:nth-child(even) {
                background-color: #F7F8FA !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>

    <!-- Print Control for Web View -->
    <div class="no-print" style="background-color: #F7F8FA; border: 1px solid #E4E7EC; padding: 15px; border-radius: 6px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: #1F2430;">معاينة الطباعة لعرض السعر</span>
        <div>
            <button onclick="window.print()" style="background-color: #2B5D7C; color: white; border: none; padding: 8px 16px; font-family: inherit; font-size: 14px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-left: 10px;">طباعة أو حفظ كـ PDF</button>
            <button onclick="window.history.back()" style="background-color: white; color: #6B7280; border: 1px solid #E4E7EC; padding: 8px 16px; font-family: inherit; font-size: 14px; border-radius: 4px; cursor: pointer;">رجوع</button>
        </div>
    </div>

    <!-- Main Invoice Document -->
    <div class="header-container">
        <div class="company-info" style="display: flex; gap: 15px; align-items: center;">
            @if($company->logo_path)
                <img src="{{ asset('storage/' . $company->logo_path) }}" alt="Logo" style="max-height: 70px; max-width: 130px; object-fit: contain; margin-left: 15px;">
            @endif
            <div>
                <h1>{{ $company->name }}</h1>
                <p>المسؤول: {{ $company->contact_name }}</p>
                <p>الجوال: {{ $company->phone }}</p>
                <p>البريد الإلكتروني: {{ $company->email }}</p>
            </div>
        </div>
        <div class="document-title">
            <h2>عرض سعر</h2>
            <p><strong>الرقم المرجعي:</strong> {{ $quotation->quotation_number }}</p>
            <p><strong>التاريخ:</strong> {{ $quotation->created_at->toDateString() }}</p>
            <p><strong>صالح حتى:</strong> {{ $quotation->expires_at }}</p>
        </div>
    </div>

    <div class="details-grid">
        <div class="section-card">
            <h3>موجه إلى (العميل)</h3>
            <p><strong>الاسم:</strong> {{ $quotation->customer->name }}</p>
            <p><strong>المسؤول:</strong> {{ $quotation->customer->contact_person }}</p>
            <p><strong>الجوال:</strong> {{ $quotation->customer->phone }}</p>
            @if($quotation->customer->email)
                <p><strong>البريد:</strong> {{ $quotation->customer->email }}</p>
            @endif
            @if($quotation->customer->address)
                <p><strong>العنوان:</strong> {{ $quotation->customer->address }}</p>
            @endif
        </div>
        <div class="section-card">
            <h3>تفاصيل المشروع</h3>
            <p><strong>الحالة:</strong> 
                @switch($quotation->status)
                    @case('draft') مسودة @break
                    @case('sent') مرسل @break
                    @case('accepted') مقبول @break
                    @case('rejected') مرفوض @break
                    @case('expired') منتهي الصلاحية @break
                @endswitch
            </p>
            @if($quotation->description)
                <p><strong>الوصف:</strong> {{ $quotation->description }}</p>
            @endif
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 55%;">البند / الوصف</th>
                <th style="width: 10%; text-align: center;">الكمية</th>
                <th style="width: 15%; text-align: left;">سعر الوحدة</th>
                <th style="width: 15%; text-align: left;">الإجمالي</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quotation->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->item_name }}</td>
                    <td style="text-align: center;">{{ number_format($item->quantity, 2) }}</td>
                    <td style="text-align: left;">{{ number_format($item->unit_price, 2) }} ر.س</td>
                    <td style="text-align: left;">{{ number_format($item->total, 2) }} ر.س</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals-container">
        <table class="totals-table">
            <tr>
                <td style="text-align: right; font-weight: bold; color: #6B7280;">الإجمالي الفرعي:</td>
                <td style="text-align: left;">{{ number_format($quotation->total_amount, 2) }} ر.س</td>
            </tr>
            <tr class="grand-total">
                <td style="text-align: right; font-weight: bold;">الإجمالي الكلي:</td>
                <td style="text-align: left;">{{ number_format($quotation->total_amount, 2) }} ر.س</td>
            </tr>
            @if($quotation->deposit_amount || $quotation->delivery_amount)
            <tr>
                <td colspan="2" style="padding-top: 16px; padding-bottom: 4px; color: #6B7280; font-size: 12px; font-weight: bold; border-top: 1px dashed #E4E7EC;">شروط الدفع:</td>
            </tr>
            @if($quotation->deposit_amount)
            <tr>
                <td style="text-align: right; color: #2F9E44; font-weight: bold;">المبلغ الأول (العربون / عند التعاقد):</td>
                <td style="text-align: left; color: #2F9E44; font-weight: bold;">{{ number_format($quotation->deposit_amount, 2) }} ر.س</td>
            </tr>
            @endif
            @if($quotation->delivery_amount)
            <tr>
                <td style="text-align: right; color: #E8A33D; font-weight: bold;">المبلغ الثاني (المتبقي عند التسليم):</td>
                <td style="text-align: left; color: #E8A33D; font-weight: bold;">{{ number_format($quotation->delivery_amount, 2) }} ر.س</td>
            </tr>
            @endif
            @endif
        </table>
    </div>

    @if($quotation->description)
        <div class="terms-container">
            <h4>شروط وأحكام إضافية:</h4>
            <p>{{ $quotation->description }}</p>
        </div>
    @endif

    <div class="signatures">
        <div class="signature-box">
            <p>توقيع الجهة المستلمة (العميل)</p>
            <div class="signature-line">التوقيع والختم</div>
        </div>
        <div class="signature-box">
            <p>توقيع جهة التوريد (الشركة)</p>
            <div class="signature-line">المدير المسؤول</div>
        </div>
    </div>

    <script>
        // Automatically open print dialog if requested in query parameter
        if (window.location.search.includes('print=true')) {
            window.onload = function() {
                window.print();
            }
        }
    </script>
</body>
</html>
