# 📅 BookDent - تطبيق حجز مواعيد طبيب الأسنان بالذكاء الاصطناعي

## 🦷 نبذة عن المشروع

**BookDent** هو تطبيق ويب متقدم (PWA) لحجز مواعيد عند أطباء الأسنان، يستخدم الذكاء الاصطناعي لتلقي طلبات المواعيد تلقائياً وإرسالها للطبيب.

### الميزات الرئيسية:

✅ **حجز ذكي بالـ AI** - المريض يكتب طلبه بطريقة طبيعية والـ AI يفهمه  
✅ **واجهة الطبيب** - الطبيب يسجل بيانات عيادته والمواعيد المتاحة  
✅ **نظام الاشتراك** - الأطباء يدفعون اشتراك شهري بسيط  
✅ **إشعارات تلقائية** - الطبيب يستقبل طلبات المواعيد فوراً  
✅ **دعم العربية والإنجليزية** - واجهة ثنائية اللغة  
✅ **PWA** - يعمل بدون انترنت (بعد التحميل الأول)  

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React.js** - واجهة المستخدم
- **Redux** - إدارة الحالة
- **Tailwind CSS** - التصميم
- **i18n** - دعم اللغات

### Backend
- **Node.js + Express** - خادم الويب
- **MongoDB** - قاعدة البيانات
- **JWT** - المصادقة
- **Stripe/Payoneer API** - نظام الدفع

### AI & Automation
- **OpenAI API / Gemini** - فهم الطلبات الطبيعية
- **Socket.io** - إشعارات فورية

---

## 📁 هيكل المشروع

```
book-dent/
├── frontend/              # تطبيق React
│   ├── src/
│   │   ├── components/    # مكونات React
│   │   ├── pages/         # الصفحات
│   │   ├── services/      # خدمات API
│   │   └── i18n/          # دعم اللغات
│   └── package.json
│
├── backend/               # خادم Node.js
│   ├── src/
│   │   ├── routes/        # المسارات
│   │   ├── controllers/   # منطق العمل
│   │   ├── models/        # نماذج قاعدة البيانات
│   │   ├── middleware/    # middleware
│   │   └── ai/            # منطق الـ AI
│   └── package.json
│
└── README.md
```

---

## 🚀 البدء السريع

### 1. استنساخ المشروع
```bash
git clone https://github.com/wassimb693-commits/book-dent.git
cd book-dent
```

### 2. تثبيت المكتبات
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. إعداد متغيرات البيئة
```bash
# Backend .env
MONGODB_URI=your_mongodb_uri
STRIPE_KEY=your_stripe_key
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_secret
```

### 4. تشغيل المشروع
```bash
# Frontend
npm start

# Backend
npm start
```

---

## 💰 نموذج الأعمال

### خطة الاشتراك:

| الخطة | السعر | الميزات |
|------|-------|---------|
| **Free** | مجاني | 5 مواعيد شهرياً |
| **Pro** | $10/شهر | 50 موعد شهرياً + إشعارات |
| **Business** | $30/شهر | غير محدود + دعم 24/7 |

---

## 👥 الفريق

- **المطور:** Wassim B. (wassimb693)
- **الحالة:** في التطوير 🔨

---

## 📝 الترخيص

هذا المشروع مرخص تحت **MIT License**

---

## 📞 التواصل

- GitHub: [@wassimb693](https://github.com/wassimb693)
- Email: wassimb693@gmail.com

---

**آخر تحديث:** 2026-08-30 ✨
