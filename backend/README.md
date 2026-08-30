
# 📱 BookDent Backend - Dental Appointment Booking Platform

## 🏥 نظام حجز المواعيد السني الذكي

BookDent هو تطبيق متقدم لحجز المواعيد السنية مع تقنيات الذكاء الاصطناعي المتطورة، نظام دفع متعدد الطرق، ومحفظة رقمية للأطباء.

---

## ✨ المميزات الرئيسية

### 🤖 الذكاء الاصطناعي
- معالجة رسائل المرضى تلقائياً واستخراج بيانات المواعيد
- روبوت محادثة ذكي (Chatbot) للرد على الاستفسارات
- توليد التوصيات الطبية تلقائياً
- اقتراح مواعيد متاحة بناءً على الطلب
- الإجابة على الأسئلة الشائعة

### 💳 نظام الدفع المتقدم
- **Stripe** - بطاقات ائتمان وSusbcriptions
- **PayPal** - محفظة رقمية
- **بطاقات ائتمان عامة** - معالجة مباشرة
- محفظة رقمية للأطباء
- سحب الأموال إلى حسابات بنكية أجنبية

### 👨‍⚕️ إدارة الأطباء
- ملفات تعريف شاملة
- جدول أوقات العمل
- إدارة الاشتراكات (Free, Pro, Business)
- إحصائيات المواعيد والتقييمات

### 📅 نظام المواعيد
- حجز ذكي للمواعيد
- تحديث حالة المواعيد
- إشعارات فورية عبر Socket.io
- تاريخ شامل للمواعيد

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 14+
- MongoDB
- API Key من OpenAI
- حسابات Stripe و PayPal (اختياري)

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/wassimb693-commits/book-dent.git
cd book-dent/backend

# تثبيت المكتبات
npm install

# إنشاء ملف البيئة
cp .env.example .env

# تعديل المتغيرات بحسب بيانات الخادم الخاص بك
nano .env
```

### ملف `.env` المطلوب

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/book-dent

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
```

### تشغيل الخادم

```bash
# في بيئة التطوير (مع Nodemon)
npm run dev

# في بيئة الإنتاج
npm start
```

سيعمل الخادم على `http://localhost:5000`

---

## 📚 API Endpoints

### 🔐 المصادقة (`/api/auth`)

```
POST   /api/auth/register      - تسجيل طبيب جديد
POST   /api/auth/login         - دخول الطبيب
GET    /api/auth/me            - الحصول على بيانات الطبيب الحالي
```

### 👨‍⚕️ الأطباء (`/api/doctors`)

```
GET    /api/doctors                           - قائمة جميع الأطباء
GET    /api/doctors/:doctorId                 - بيانات طبيب معين
PUT    /api/doctors/:doctorId                 - تحديث الملف الشخصي
GET    /api/doctors/search/specialization/:spec - البحث حسب التخصص
GET    /api/doctors/:doctorId/stats           - إحصائيات الطبيب
```

### 📅 المواعيد (`/api/appointments`)

```
POST   /api/appointments/create               - حجز موعد جديد
GET    /api/appointments/doctor/:doctorId     - مواعيد الطبيب
PUT    /api/appointments/:id/status           - تحديث حالة الموعد
GET    /api/appointments/:id                  - بيانات الموعد
```

### 💳 الدفع (`/api/payments`)

#### Stripe
```
POST   /api/payments/stripe/create-session    - إنشاء جلسة الدفع
POST   /api/payments/stripe/webhook           - Webhook من Stripe
```

#### الدفع بالبطاقة
```
POST   /api/payments/card/charge              - دفع مباشر بالبطاقة
```

#### المحفظة والسحب
```
GET    /api/payments/wallet/:doctorId         - رصيد المحفظة
POST   /api/payments/wallet/withdraw          - سحب الأموال
GET    /api/payments/history/:doctorId        - سجل الدفعات
```

### 🤖 الذكاء الاصطناعي (`/api/ai`)

```
POST   /api/ai/process-appointment   - معالجة رسالة الموعد
POST   /api/ai/chat                  - محادثة مع الروبوت
POST   /api/ai/recommendations       - توصيات طبية ذكية
POST   /api/ai/suggest-slots         - اقتراح مواعيد متاحة
POST   /api/ai/faq                   - الإجابة على الأسئلة الشائعة
POST   /api/ai/generate-prescription - توليد وصفة طبية
```

---

## 🗄️ قاعدة البيانات

### Collections

#### Doctor
- معلومات الطبيب الشخصية
- بيانات العيادة
- جدول الأوقات
- بيانات الاشتراك
- التقييمات والآراء

#### Appointment
- بيانات المريض
- موعد وتوقيت الموعد
- حالة الموعد
- بيانات معالجة AI

#### Wallet
- رصيد الطبيب
- سجل العمليات
- حسابات بنكية مسجلة
- تفاصيل السحب

#### Payment
- سجل الدفعات
- طريقة الدفع
- رقم المعاملة
- حالة الدفع

---

## 🔄 Socket.io Events

### من الخادم إلى العميل

```javascript
// إشعار موعد جديد
io.emit(`doctor-${doctorId}`, {
  type: 'new_appointment',
  appointment: {...}
});

// تحديث حالة الموعد
io.emit(`appointment-${appointmentId}`, {
  type: 'status_updated',
  status: 'confirmed',
  appointment: {...}
});
```

---

## 💰 نظام الدفع والمحفظة

### خطوات السحب (Withdrawal Flow)

1. **الطبيب يسدد الرسوم** → المبلغ يُضاف للمحفظة
2. **طلب السحب** → إرسال بيانات الحساب البنكي
3. **التحقق** → معالجة الطلب من قبل الفريق
4. **التحويل** → تحويل المبلغ للحساب البنكي الأجنبي
5. **التأكيد** → إشعار الطبيب بنجاح العملية

### الخطة المالية

| الخطة | السعر | المواعيد | المميزات |
|------|-------|---------|---------|
| Free | مجاني | 5 شهري | أساسي |
| Pro | $10 | 50 شهري | متقدم + تحليلات |
| Business | $30 | ∞ | كل المميزات |

---

## 🛠️ أدوات التطوير

```bash
# اختبار الواجهة البرمجية
npm test

# فحص الأخطاء
npm run lint

# بناء للإنتاج
npm run build
```

---

## 📝 ملاحظات مهمة

### أمان الحسابات البنكية
- لا نحفظ رقم الحساب كاملاً (آخر 4 أرقام فقط)
- كل البيانات مشفرة في قاعدة البيانات
- معالجة HTTPS فقط

### استخدام OpenAI API
- تأكد من وجود Credit كافي
- حد يومي: 1000 request
- موديل: gpt-3.5-turbo (الأسرع والأرخص)

### Stripe Integration
- استخدم مفاتيح الاختبار في التطوير
- فعّل الـ Webhook للاشتراكات
- اختبر جميع السيناريوهات المختلفة

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. فتح Issue لمناقشة التغييرات المقترحة
2. Fork المشروع
3. إنشاء branch جديد
4. عمل commit مع رسائل واضحة
5. فتح Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

---

## 📧 التواصل

- **البريد الإلكتروني**: wassimb693@gmail.com
- **GitHub**: [@wassimb693-commits](https://github.com/wassimb693-commits)

---

## 🔗 الروابط المهمة

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)

---

**شكراً لاستخدام BookDent! 🦷✨**
