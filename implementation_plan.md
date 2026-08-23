# خطة تنفيذ نظام إدارة شركات الكرفانات (Multi-Tenant SaaS) - النسخة المصححة

سيتم بناء هذا النظام باستخدام **Laravel 12** و **Inertia.js** ومكتبة **React** و **Tailwind CSS v4**.

---

## 1. قواعد معمارية هامة (Architectural Rules)

### عزل البيانات (Multi-Tenancy)
* **القاعدة:** كل الجداول (باستثناء جدول الشركات) تحتوي على حقل `company_id`.
* **التنفيذ:** استخدام Trait باسم `BelongsToCompany` يطبق `Global Scope` لتصفية استعلامات قاعدة البيانات تلقائياً بناءً على معرف شركة المستخدم الحالي (`Auth::user()->company_id`).

### الحذف المؤقت (Soft Delete)
* يُطبق الـ `SoftDeletes` وعمود `deleted_at` على الكيانات المستقلة التالية:
  `users`, `customers`, `suppliers`, `quotations`, `contracts`, `purchase_orders`, `claims`

---

## 2. الهوية البصرية ونظام الألوان (Design System)

تصميم نظيف، مسطح، واحترافي خالي من التدرجات اللونية والتأثيرات الزجاجية. الخط المستخدم: **Tajawal** من Google Fonts.

| العنصر | اللون | كود CSS / Tailwind |
|---|---|---|
| خلفية الصفحة | رمادي فاتح جداً | `#F7F8FA` |
| النص الأساسي | كحلي داكن | `#1F2430` |
| النص الثانوي والرموز | رمادي متوسط | `#6B7280` |
| الحدود والفواصل | رمادي فاتح جداً | `#E4E7EC` |
| لون العلامة (أزرار، روابط، نشط) | أزرق بترولي | `#2B5D7C` |
| حالة: مدفوع/مكتمل/نجاح | أخضر | `#2F9E44` |
| حالة: مستحق قريباً/تنبيه | برتقالي/كهرماني | `#E8A33D` |
| حالة: متأخر/خطر | أحمر | `#E03131` |

* **قواعد الاستخدام:** الألوان الوظيفية (أخضر/برتقالي/أحمر) تستخدم فقط لمؤشرات الحالة (نقطة، شارة، حد رفيع) وليس خلفيات ممتلئة. لون العلامة (`#2B5D7C`) يستخدم فقط للعناصر التفاعلية.

---

## 3. هيكل قاعدة البيانات المصحح (Database Schema)

### 1. الشركات `companies`
* `id` (PK)
* `name`, `contact_name`, `phone`, `email`
* `timestamps`

### 2. المستخدمين `users`
* `id`, `company_id` (FK), `name`, `email`, `password`, `role` (owner/member)
* `deleted_at` (SoftDeletes)
* `timestamps`

### 3. العملاء `customers`
* `id`, `company_id` (FK), `name`, `contact_person`, `phone`, `email` (nullable), `address` (nullable), `notes` (nullable)
* `deleted_at` (SoftDeletes)
* `timestamps`

### 4. الموردون `suppliers`
* `id`, `company_id` (FK), `name`, `contact_person`, `phone`, `supply_type`, `notes` (nullable)
* `deleted_at` (SoftDeletes)
* `timestamps`

### 5. عروض الأسعار `quotations`
* `id`, `company_id` (FK), `customer_id` (FK)
* `quotation_number` (string)
* `description` (text, nullable)
* `total_amount` (decimal, 12, 2) - محسوب تلقائياً في الخلفية من مجموع البنود
* `expires_at` (date)
* `status` (enum: 'draft', 'sent', 'accepted', 'rejected', 'expired')
* `deleted_at` (SoftDeletes)
* `timestamps`

### 6. بنود عروض الأسعار `quotation_items` [NEW TABLE]
* `id`, `company_id` (FK)
* `quotation_id` (FK → `quotations` cascade on delete)
* `item_name` (string)
* `quantity` (decimal, 10, 2)
* `unit_price` (decimal, 12, 2)
* `total` (decimal, 12, 2) - حاصل ضرب (الكمية × السعر)، يُحسب ويُسجّل في الخلفية
* `timestamps`

### 7. العقود `contracts`
* `id`, `company_id` (FK), `customer_id` (FK), `quotation_id` (FK, nullable)
* `contract_number` (string)
* `total_value` (decimal, 12, 2)
* `signed_at` (date), `delivery_due_at` (date)
* `status` (enum: 'active', 'completed', 'cancelled')
* `deleted_at` (SoftDeletes)
* `timestamps`

### 8. دفعات العقود `contract_payments`
* `id`, `company_id` (FK), `contract_id` (FK)
* `description` (string), `amount` (decimal, 12, 2), `due_date` (date)
* `status` (enum: 'pending', 'due', 'overdue', 'paid')
* `timestamps`

### 9. وحدات الكرفان `caravan_units`
* `id`, `company_id` (FK), `contract_id` (FK)
* `name` (string)
* `timestamps`

### 10. أوامر الشراء `purchase_orders`
* `id`, `company_id` (FK), `supplier_id` (FK), `caravan_unit_id` (FK, nullable)
* `po_number` (string)
* `total_amount` (decimal, 12, 2) - محسوب تلقائياً في الخلفية من البنود
* `order_date` (date), `expected_delivery_date` (date, nullable)
* `status` (enum: 'requested', 'ordered', 'partially_received', 'fully_received')
* `deleted_at` (SoftDeletes)
* `timestamps`

### 11. بنود أوامر الشراء `purchase_order_items` [NEW TABLE]
* `id`, `company_id` (FK)
* `purchase_order_id` (FK → `purchase_orders` cascade on delete)
* `item_name` (string)
* `quantity` (decimal, 10, 2)
* `unit_price` (decimal, 12, 2)
* `total` (decimal, 12, 2) - يُحسب في الخلفية
* `timestamps`

### 12. الحسابات اليومية `daily_ledgers`
* `id`, `company_id` (FK), `date` (date), `description` (string), `type` (receipt/payment), `amount` (decimal, 12, 2), `source` (nullable), `notes` (nullable)
* `timestamps`

### 13. المطالبات المالية `claims` [CORRECTED]
* `id`, `company_id` (FK), `customer_id` (FK)
* `contract_id` (FK, nullable) - تم تغييره ليدعم المطالبات اليدوية المستقلة
* `contract_payment_id` (FK, nullable) - تم تغييره ليدعم المطالبات اليدوية المستقلة
* `claim_number` (string)
* `amount` (decimal, 12, 2), `due_date` (date)
* `status` (enum: 'due_soon', 'due_now', 'overdue', 'claimed', 'promised', 'paid')
* `timeline` (json)
* `deleted_at` (SoftDeletes)
* `timestamps`

### 14. المرفقات `attachments` [NEW TABLE]
* `id`, `company_id` (FK)
* `attachable_type` (string) - `App\Models\Quotation` أو `App\Models\Contract`
* `attachable_id` (unsignedBigInteger)
* `file_name` (string)
* `file_path` (string)
* `mime_type` (string)
* `file_size` (unsignedInteger)
* `uploaded_by` (FK → `users`)
* `timestamps`

### 15. سجلات العمليات `audit_logs` [NEW TABLE]
* `id`, `company_id` (FK)
* `user_id` (FK → `users`)
* `action` (string)
* `entity_type` (string)
* `entity_id` (unsignedBigInteger)
* `details` (json, nullable)
* `created_at`

---

## 4. خطة التعديل ومراحل العمل

### المرحلة 1: تثبيت الحزم وإعداد React + Inertia.js
* تثبيت وتفعيل الحزم المطلوبة بدون الحزم الإضافية المعلقة في الإنترنت.
* إعداد تكوين Vite و React مع تحميل خط Tajawal في القالب الرئيسي.

### المرحلة 2: بناء الجداول والموديلات (Models & Migrations)
* إنشاء جداول التهجير بكامل الحقول والعلاقات وخصائص SoftDeletes و MorphRelations.
* إنشاء الـ Trait لعزل `company_id` وإعداد الموديلات.

### المرحلة 3: الواجهات والألوان
* تصميم لوحة تحكم ونظام تنقل باللغة العربية RTL مبني كلياً على نظام الألوان المسطح الجديد.

### المرحلة 4: ربط العمليات (Business Logic)
* برمجة علاقات التحويل التلقائي لعقد، وتوليد المطالبات، وتحديث الدفعات.
