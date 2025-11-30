# نظام الإشعارات الداخلية - Internal Notifications System

## نظرة عامة

تم إضافة نظام إشعارات داخلي متكامل للمنصة يعمل في الوقت الفعلي باستخدام Firebase Firestore فقط، دون الحاجة لأي خدمات خارجية.

## الميزات الرئيسية

### 1. إشعارات في الوقت الفعلي
- **Real-time Updates** باستخدام Firebase `onSnapshot`
- تحديث فوري عند ورود إشعار جديد
- عداد تلقائي للإشعارات غير المقروءة

### 2. أنواع الإشعارات المدعومة

#### **إشعارات التذاكر (Tickets)**
- ✅ **إنشاء تذكرة جديدة:** إشعار لمدير العقار
- ✅ **تعيين تذكرة:** إشعار لمزود الخدمة المُعيَّن
- ✅ **تحديث حالة التذكرة:** إشعار لصاحب التذكرة
- ✅ **إكمال التذكرة:** إشعار للمستخدم
- ✅ **إغلاق التذكرة:** إشعار للمستخدم

#### **إشعارات الفواتير (Billing)**
- ✅ **إصدار فاتورة جديدة:** إشعار للمستخدم
- ⏰ **تذكير بالدفع:** قبل موعد الاستحقاق (جاهز للتنفيذ)
- ✅ **تأكيد الدفع:** إشعار بنجاح الدفع (موجود مسبقاً)
- ⏰ **فاتورة متأخرة:** إشعار بالتأخير (جاهز للتنفيذ)

#### **إشعارات التصاريح (Permits)**
- ✅ **طلب تصريح جديد:** إشعار لمدير العقار
- ✅ **الموافقة على التصريح:** إشعار لمقدم الطلب
- ✅ **رفض التصريح:** إشعار مع السبب
- ✅ **إلغاء التصريح:** إشعار للطرفين

#### **إشعارات الحجوزات (Bookings)** - جاهز للتكامل
- 🔄 طلب حجز جديد → إشعار لمدير العقار
- 🔄 الموافقة على الحجز → إشعار للمستخدم
- 🔄 رفض الحجز → إشعار مع السبب
- 🔄 إلغاء الحجز → إشعار للطرفين
- 🔄 تذكير قبل الموعد → إشعار للمستخدم

#### **إشعارات العقود (Contracts)** - جاهز للتكامل
- 🔄 عقد قريب من الانتهاء (30 يوم) → إشعار للطرفين
- 🔄 انتهاء عقد → إشعار للطرفين
- 🔄 تجديد عقد → إشعار للمستخدم

### 3. واجهة المستخدم

#### **أيقونة الجرس (Notification Bell)**
- في شريط التنقل العلوي
- عداد الإشعارات غير المقروءة (badge)
- نقطة حمراء للإشعارات الجديدة
- قائمة منسدلة عند النقر

#### **القائمة المنسدلة (Dropdown)**
- عرض آخر 10 إشعارات
- زر "وضع علامة مقروء للكل"
- زر "عرض الكل" للانتقال للصفحة الكاملة
- مؤشر تحميل أثناء جلب البيانات

#### **صفحة الإشعارات الكاملة**
- عرض جميع الإشعارات
- تبويبات: (الكل - غير مقروء - مقروء)
- فلترة حسب الفئة (تذاكر، فواتير، تصاريح، إلخ)
- حذف فردي أو جماعي
- مسح الكل كمقروء

#### **عنصر الإشعار (Notification Item)**
- أيقونة مناسبة حسب النوع
- ألوان مميزة (أخضر للموافقة، أحمر للرفض، أصفر للتذكير)
- الوقت النسبي (منذ 5 دقائق، منذ ساعة)
- زر حذف سريع
- النقر للانتقال للعنصر المرتبط

## البنية التقنية

### الملفات الجديدة

#### Services
```
src/utils/
└── internalNotificationsService.js  - خدمة الإشعارات الداخلية
```

**الوظائف الرئيسية:**
- `createNotification()` - إنشاء إشعار
- `createBulkNotifications()` - إنشاء عدة إشعارات
- `getUserNotifications()` - جلب إشعارات المستخدم
- `getUnreadCount()` - عدد غير المقروء
- `markAsRead()` - وضع علامة مقروء
- `markAllAsRead()` - وضع علامة على الكل
- `deleteNotification()` - حذف إشعار
- `subscribeToNotifications()` - الاشتراك في الوقت الفعلي

**وظائف مخصصة لكل نظام:**
- `notifyTicketCreated()`
- `notifyTicketAssigned()`
- `notifyTicketStatusUpdated()`
- `notifyPermitRequested()`
- `notifyPermitStatusChanged()`
- `notifyBookingRequested()` *(جاهز)*
- `notifyBookingStatusChanged()` *(جاهز)*
- `notifyBillIssued()` *(جاهز)*
- `notifyContractExpiring()` *(جاهز)*

#### Context
```
src/contexts/
└── NotificationsContext.jsx  - Context للإشعارات
```

**الحالة المُدارة:**
- `notifications` - قائمة الإشعارات
- `unreadCount` - عدد غير المقروء
- `loading` - حالة التحميل

**الوظائف:**
- `refreshNotifications()`
- `markAsRead(notificationId)`
- `markAllAsRead()`
- `deleteNotification(notificationId)`

#### Components
```
src/components/notifications/
├── NotificationBell.jsx          - أيقونة الجرس
├── NotificationsDropdown.jsx     - القائمة المنسدلة
└── NotificationItem.jsx          - عنصر إشعار واحد
```

#### Pages
```
src/pages/notifications/
└── NotificationsPage.jsx  - صفحة الإشعارات الكاملة
```

### قاعدة البيانات Firebase

#### Collection: `notifications`

**بنية المستند:**
```javascript
{
  userId: string,              // المستخدم المستلم
  type: string,                // نوع الإشعار (من INTERNAL_NOTIFICATION_TYPES)
  title: string,               // عنوان الإشعار (مفتاح الترجمة)
  message: string,             // نص الإشعار (مفتاح الترجمة)
  relatedId: string,           // ID العنصر المرتبط (ticket, bill, etc)
  relatedType: string,         // نوع العنصر (ticket, bill, permit, etc)
  actionUrl: string,           // رابط للانتقال
  category: string,            // الفئة (tickets, billing, permits, etc)
  metadata: object,            // بيانات إضافية للإشعار
  isRead: boolean,             // مقروء/غير مقروء
  readAt: Timestamp,           // وقت القراءة
  createdAt: Timestamp         // وقت الإنشاء
}
```

**Indexes المطلوبة:**
```
1. userId (Ascending) + createdAt (Descending)
2. userId (Ascending) + isRead (Ascending)
```

### الثوابت الجديدة (constants.js)

```javascript
INTERNAL_NOTIFICATION_TYPES = {
  TICKET_CREATED,
  TICKET_ASSIGNED,
  TICKET_STATUS_UPDATED,
  TICKET_COMPLETED,
  TICKET_CLOSED,
  BILL_ISSUED,
  BILL_PAID,
  BILL_OVERDUE,
  PERMIT_REQUESTED,
  PERMIT_APPROVED,
  PERMIT_REJECTED,
  PERMIT_REVOKED,
  BOOKING_REQUESTED,
  BOOKING_APPROVED,
  BOOKING_REJECTED,
  BOOKING_CANCELLED,
  CONTRACT_EXPIRING,
  CONTRACT_EXPIRED,
  CONTRACT_RENEWED
}

NOTIFICATION_CATEGORY = {
  TICKETS,
  BILLING,
  PERMITS,
  BOOKINGS,
  CONTRACTS,
  SYSTEM
}
```

## التكامل مع الأنظمة

### ✅ نظام التذاكر (Tickets)
**الملف:** `src/utils/ticketService.js`

- **createTicket()** → يُرسل إشعار لمدير العقار
- **assignTicket()** → يُرسل إشعار لمزود الخدمة
- **updateTicketStatus()** → يُرسل إشعار لصاحب التذكرة

### ✅ نظام التصاريح (Permits)
**الملف:** `src/utils/permitsService.js`

- **createPermitRequest()** → يُرسل إشعار لمدير العقار
- **approvePermit()** → يُرسل إشعار لمقدم الطلب
- **rejectPermit()** → يُرسل إشعار مع السبب
- **revokePermit()** → يُرسل إشعار مع السبب

### 🔄 نظام الحجوزات (Bookings) - جاهز للتكامل
**الملف:** `src/utils/bookingService.js` *(يحتاج تحديث)*

الوظائف جاهزة في `internalNotificationsService.js`:
- `notifyBookingRequested()`
- `notifyBookingStatusChanged()`

**خطوات التكامل:**
```javascript
// في bookingService.js
import { notifyBookingRequested, notifyBookingStatusChanged } from './internalNotificationsService';

// عند إنشاء حجز
await notifyBookingRequested(booking, requesterName);

// عند تغيير الحالة
await notifyBookingStatusChanged(booking, 'approved'); // أو 'rejected' أو 'cancelled'
```

### 🔄 نظام الفواتير (Billing)
**الملف:** `src/utils/billingService.js`

الإشعار عند إصدار فاتورة جاهز:
- `notifyBillIssued()`
- `notifyBillPaid()`

## الترجمة (i18n)

### العربية (`ar.json`)
```json
{
  "notifications": {
    "notifications": "الإشعارات",
    "noNotifications": "لا توجد إشعارات",
    "markAllRead": "وضع علامة مقروء للكل",
    "viewAll": "عرض الكل",
    ...
  }
}
```

### الإنجليزية (`en.json`)
```json
{
  "notifications": {
    "notifications": "Notifications",
    "noNotifications": "No notifications",
    "markAllRead": "Mark all as read",
    "viewAll": "View All",
    ...
  }
}
```

## المسارات (Routes)

```javascript
/notifications  - صفحة الإشعارات الكاملة (محمية)
```

## الأمان

- ✅ الاشتراك في الوقت الفعلي يُظهر فقط إشعارات المستخدم الحالي
- ✅ جميع العمليات تتحقق من `userId`
- ✅ الإشعارات مخصصة لكل مستخدم
- ⚠️ **مطلوب:** إضافة Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notifications/{notificationId} {
      // المستخدم يمكنه قراءة إشعاراته فقط
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;

      // المستخدم يمكنه تحديث إشعاراته (وضع علامة مقروء)
      allow update: if request.auth != null &&
                       resource.data.userId == request.auth.uid;

      // المستخدم يمكنه حذف إشعاراته
      allow delete: if request.auth != null &&
                       resource.data.userId == request.auth.uid;

      // السيرفر فقط يمكنه إنشاء الإشعارات
      // (في بيئة الإنتاج، استخدم Cloud Functions)
      allow create: if request.auth != null;
    }
  }
}
```

## الأداء والتحسينات

### ✅ تم تطبيقه
- Real-time subscriptions محدودة ب 50 إشعار
- Lazy loading للصفحة الكاملة
- Memoization في React components
- تحديث محلي للحالة قبل Firebase

### 🔄 تحسينات مستقبلية مقترحة
- Pagination للإشعارات القديمة
- إشعارات Push باستخدام FCM
- تجميع الإشعارات المتشابهة
- إعدادات تفضيلات الإشعارات للمستخدم
- صوت عند ورود إشعار جديد
- إشعارات البريد الإلكتروني (اختيارية)

## كيفية الاستخدام

### للمستخدمين
1. تسجيل الدخول
2. النظر لأيقونة الجرس في شريط التنقل
3. النقر لعرض آخر الإشعارات
4. "عرض الكل" للصفحة الكاملة
5. النقر على أي إشعار للانتقال للعنصر

### اختبار النظام (Development Mode)
في بيئة التطوير، تظهر في صفحة الإشعارات زر "Test Notifications":
1. انتقل إلى صفحة الإشعارات (`/notifications`)
2. انقر على زر "Test Notifications" في الأعلى
3. سيتم إنشاء 5 إشعارات تجريبية من أنواع مختلفة
4. 2 منها مقروءة و 3 غير مقروءة
5. مرتبة زمنياً بفارق ساعة بينها

**ملاحظة:** الزر يظهر فقط في development mode (`process.env.NODE_ENV === 'development'`)

### للمطورين - إضافة إشعار جديد

**الخطوة 1:** أضف النوع في `constants.js`
```javascript
export const INTERNAL_NOTIFICATION_TYPES = {
  // ... الأنواع الموجودة
  NEW_TYPE: 'newType',
};
```

**الخطوة 2:** أنشئ وظيفة في `internalNotificationsService.js`
```javascript
export const notifyNewEvent = async (eventData, userName) => {
  await createNotification({
    userId: eventData.targetUserId,
    type: INTERNAL_NOTIFICATION_TYPES.NEW_TYPE,
    title: 'event.newEvent',
    message: 'notifications.newEventOccurred',
    relatedId: eventData.id,
    relatedType: 'event',
    actionUrl: `/events/${eventData.id}`,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    metadata: {
      userName,
      eventName: eventData.name,
    },
  });
};
```

**الخطوة 3:** استدعها في الخدمة المناسبة
```javascript
import { notifyNewEvent } from './internalNotificationsService';

export const createEvent = async (eventData) => {
  // ... كود الإنشاء
  await notifyNewEvent(event, userName).catch(err =>
    console.error('Error sending notification:', err)
  );
};
```

**الخطوة 4:** أضف الترجمة
```json
// ar.json
"notifications": {
  "newEventOccurred": "حدث جديد: {{eventName}} من {{userName}}"
}

// en.json
"notifications": {
  "newEventOccurred": "New event: {{eventName}} from {{userName}}"
}
```

## الحالة الحالية

### ✅ تم التنفيذ
- ✅ البنية الأساسية الكاملة
- ✅ واجهة المستخدم (UI/UX)
- ✅ Real-time subscriptions
- ✅ التكامل مع التذاكر
- ✅ التكامل مع التصاريح
- ✅ الترجمة (عربي/إنجليزي)
- ✅ Context API للإدارة
- ✅ Error handling شامل
- ✅ Logging للتشخيص
- ✅ إنشاء إشعارات تجريبية للاختبار
- ✅ زر إعادة المحاولة عند الأخطاء
- ✅ Build ناجح ✓

### 🔄 قيد التطوير
- Bookings notifications (جاهز للتكامل فقط)
- Contracts notifications (جاهز للتكامل فقط)
- Bill reminders (جاهز، يحتاج scheduler)

### 📋 مخطط للمستقبل
- Push notifications (FCM)
- Email notifications
- SMS notifications (optional)
- User preferences
- Notification sounds
- Desktop notifications

---

**تم التنفيذ بنجاح في:** نوفمبر 2025
**الحالة:** جاهز للإنتاج ✓
**Firebase Only:** نعم ✓
**اللغات:** عربي + إنجليزي ✓
