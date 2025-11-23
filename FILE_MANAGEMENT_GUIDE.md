# دليل استخدام نظام إدارة الملفات
# File Management System Guide

## 📁 نظرة عامة / Overview

تم تنفيذ نظام إدارة ملفات شامل يسمح لمديري النظام ومديري العقارات برفع وإدارة الملفات المتعلقة بالعقارات.

A comprehensive file management system has been implemented allowing admins and property managers to upload and manage property-related files.

---

## 🎯 الوصول إلى النظام / System Access

### للوصول إلى صفحة إدارة الملفات:
### To access the file management page:

1. **تسجيل الدخول** كمدير نظام أو مدير عقار
   **Log in** as Admin or Property Manager

2. **افتح قائمة المستخدم** (أعلى اليمين)
   **Open user menu** (top right)

3. **انقر على "إدارة الملفات"** 📂
   **Click on "File Management"** 📂

4. **أو انتقل مباشرة إلى:** `/files`
   **Or navigate directly to:** `/files`

---

## 🔐 الصلاحيات / Permissions

### مدير النظام (Admin)
- ✅ عرض جميع الملفات لجميع العقارات
- ✅ رفع ملفات جديدة لأي عقار
- ✅ تعديل معلومات الملفات
- ✅ حذف الملفات
- ✅ تحميل الملفات

### مدير العقار (Property Manager)
- ✅ عرض ملفات العقارات المخصصة له فقط
- ✅ رفع ملفات جديدة لعقاراته
- ✅ تعديل معلومات الملفات
- ✅ حذف الملفات
- ✅ تحميل الملفات

---

## 📤 رفع الملفات / Upload Files

### خطوات رفع ملف جديد:
### Steps to upload a new file:

1. **انقر على زر "رفع ملف"** في أعلى الصفحة
   **Click "Upload File"** button at the top of the page

2. **اختر العقار** من القائمة المنسدلة (إلزامي)
   **Select Property** from dropdown (required)

3. **اختر الفئة** (عقود، تصاريح، صيانة، إلخ)
   **Select Category** (contracts, permits, maintenance, etc.)

4. **أضف وصفاً** للملف (اختياري)
   **Add Description** for the file (optional)

5. **أضف وسوماً** مفصولة بفواصل (اختياري)
   **Add Tags** comma-separated (optional)

6. **اسحب وأفلت الملفات** أو انقر لاختيارها
   **Drag and drop files** or click to select

7. **انقر "رفع الملفات"** لبدء الرفع
   **Click "Upload Files"** to start uploading

### الصيغ المدعومة / Supported Formats:
- 📄 PDF
- 🖼️ Images: JPG, JPEG, PNG, GIF, WEBP
- 📝 Documents: DOC, DOCX
- 📊 Spreadsheets: XLS, XLSX, CSV
- 🎥 Videos: MP4, MOV, AVI
- 📦 Archives: ZIP

### الحد الأقصى لحجم الملف / Max File Size:
- **50 MB** per file

---

## 🔍 البحث والتصفية / Search & Filter

### خيارات البحث:
### Search Options:

1. **البحث النصي:** ابحث بالاسم، الوصف، أو الوسوم
   **Text Search:** Search by name, description, or tags

2. **تصفية حسب الفئة:** عقود، تصاريح، صيانة، مالية، إلخ
   **Filter by Category:** contracts, permits, maintenance, financial, etc.

3. **تصفية حسب النوع:** PDF، صورة، مستند، إلخ
   **Filter by Type:** PDF, image, document, etc.

4. **تصفية حسب العقار:** اختر عقار محدد
   **Filter by Property:** Select specific property

5. **الترتيب:** حسب التاريخ، الاسم، الحجم، أو النوع
   **Sort:** by date, name, size, or type

---

## 📊 الإحصائيات / Statistics

تعرض لوحة الإحصائيات:
The statistics dashboard shows:

- 📁 **إجمالي الملفات** / Total Files
- 💾 **الحجم الإجمالي** / Total Size
- 🏢 **عدد العقارات** / Number of Properties
- 📑 **أنواع الملفات** / File Types

---

## 👁️ عرض تفاصيل الملف / View File Details

### لعرض تفاصيل ملف:
### To view file details:

1. **انقر على بطاقة الملف** أو اختر "عرض الملف" من القائمة
   **Click on file card** or select "View File" from menu

2. **في نافذة التفاصيل سترى:**
   **In details window you'll see:**
   - 📋 معلومات الملف الكاملة / Full file information
   - 👤 من رفع الملف ومتى / Who uploaded and when
   - 🏢 العقار المرتبط / Related property
   - 🏷️ الفئة والوسوم / Category and tags
   - 👁️ معاينة (للصور وPDF) / Preview (for images and PDFs)

3. **يمكنك:**
   - ✏️ تعديل البيانات الوصفية
   - 💾 تحميل الملف
   - 🗑️ حذف الملف

---

## 📥 تحميل الملفات / Download Files

### طرق التحميل:
### Download Methods:

1. **من بطاقة الملف:** انقر على أيقونة التحميل
   **From file card:** Click download icon

2. **من نافذة التفاصيل:** انقر زر "تحميل الملف"
   **From details window:** Click "Download File" button

3. **تحميل متعدد:** حدد ملفات متعددة ثم "تحميل المحدد"
   **Bulk download:** Select multiple files then "Download Selected"

---

## 🗑️ حذف الملفات / Delete Files

### لحذف ملف:
### To delete a file:

1. **ملف واحد:** انقر على أيقونة الحذف من القائمة
   **Single file:** Click delete icon from menu

2. **ملفات متعددة:**
   **Multiple files:**
   - حدد الملفات المطلوبة / Select desired files
   - انقر "حذف المحدد" / Click "Delete Selected"
   - أكد الحذف / Confirm deletion

⚠️ **تحذير:** الحذف نهائي ولا يمكن التراجع عنه
⚠️ **Warning:** Deletion is permanent and cannot be undone

---

## 📂 فئات الملفات / File Categories

| الفئة (AR) | Category (EN) | الاستخدام / Usage |
|-----------|---------------|-------------------|
| العقود | Contracts | عقود الإيجار والشراء |
| التصاريح | Permits | تصاريح البناء والترميم |
| الصيانة | Maintenance | سجلات الصيانة والإصلاح |
| المالية | Financial | الفواتير والمدفوعات |
| القانونية | Legal | المستندات القانونية |
| المعمارية | Architectural | الخطط والمخططات |
| الصور | Photos | صور العقار |
| التقارير | Reports | التقارير الدورية |
| الفواتير | Invoices | فواتير الخدمات |
| الشهادات | Certificates | الشهادات الرسمية |
| التأمين | Insurance | وثائق التأمين |
| متنوعات | Miscellaneous | ملفات أخرى |

---

## 🔧 إعدادات Firebase المطلوبة / Required Firebase Setup

### يجب تكوين Firebase Storage Rules:
### Firebase Storage Rules must be configured:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{propertyId}/files/{fileName} {
      // السماح بالقراءة للمستخدمين المصادق عليهم
      // Allow read for authenticated users
      allow read: if request.auth != null;

      // السماح بالكتابة للمدراء ومديري العقارات
      // Allow write for admins and property managers
      allow write: if request.auth != null &&
        (isAdmin() || isPropertyManager());

      // السماح بالحذف للمدراء فقط
      // Allow delete for admins only
      allow delete: if request.auth != null && isAdmin();
    }

    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isPropertyManager() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'propertyManager';
    }
  }
}
```

### Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /propertyFiles/{fileId} {
      // السماح بالقراءة للمستخدمين المصادق عليهم
      allow read: if request.auth != null;

      // السماح بالكتابة للمدراء ومديري العقارات
      allow create, update: if request.auth != null &&
        (isAdmin() || isPropertyManager());

      // السماح بالحذف للمدراء فقط
      allow delete: if request.auth != null && isAdmin();
    }

    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isPropertyManager() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'propertyManager';
    }
  }
}
```

---

## 🎨 واجهة المستخدم / User Interface

### العروض المتاحة:
### Available Views:

1. **📊 عرض شبكي (Grid View):** عرض البطاقات في شبكة
   **Grid View:** Display cards in a grid

2. **📋 عرض قائمة (List View):** عرض في قائمة تفصيلية
   **List View:** Display in detailed list

### الإجراءات الجماعية:
### Bulk Actions:

- ✅ تحديد الكل / Select All
- ❌ إلغاء التحديد / Deselect All
- 💾 تحميل المحدد / Download Selected
- 🗑️ حذف المحدد / Delete Selected

---

## 📱 الاستجابة (Responsive)

النظام يعمل بشكل كامل على:
The system works fully on:

- 💻 Desktop
- 📱 Mobile
- 📲 Tablet

---

## 🚀 الميزات الرئيسية / Key Features

✅ رفع ملفات متعددة في نفس الوقت
✅ Multiple file upload at once

✅ السحب والإفلات (Drag & Drop)
✅ Drag and drop functionality

✅ شريط تقدم الرفع
✅ Upload progress bar

✅ معاينة الملفات (صور وPDF)
✅ File preview (images and PDFs)

✅ بحث وتصفية متقدمة
✅ Advanced search and filtering

✅ إحصائيات شاملة
✅ Comprehensive statistics

✅ إدارة البيانات الوصفية
✅ Metadata management

✅ التحكم في الصلاحيات
✅ Permission control

✅ واجهة ثنائية اللغة (عربي/إنجليزي)
✅ Bilingual interface (Arabic/English)

✅ تصميم متجاوب
✅ Responsive design

---

## 📞 الدعم الفني / Technical Support

لأي استفسارات أو مشاكل تقنية، يرجى التواصل مع فريق الدعم.

For any inquiries or technical issues, please contact the support team.

---

**تم التنفيذ بنجاح! ✅**
**Successfully Implemented! ✅**
