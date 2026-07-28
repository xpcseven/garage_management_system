# إعداد البريد Gmail لتأكيد الحساب

## سبب الخطأ `535 BadCredentials` / `EAUTH`

Google يرفض تسجيل الدخول عبر SMTP. الكود يعمل، لكن `GMAIL_USER` أو `GMAIL_APP_PASSWORD` غير صحيحين.

**ملاحظة:** كلمة مرور حساب Google العادية **لا تعمل**. يجب استخدام **App Password** فقط.

## الخطوات (إلزامي)

1. سجّل دخول إلى نفس الحساب الموجود في `.env` كـ `GMAIL_USER` (حالياً `tourism.noreplay@gmail.com`).
2. فعّل **التحقق بخطوتين** (2-Step Verification):  
   https://myaccount.google.com/signinoptions/twostepverification
3. أنشئ **App Password**:  
   https://myaccount.google.com/apppasswords  
   - التطبيق: Mail  
   - الجهاز: Other (مثلاً Ashuor)
4. انسخ الـ 16 حرفاً وضعها في `.env`:

```env
GMAIL_USER=tourism.noreplay@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

بدون مسافات وبدون علامات اقتباس.

5. أعد تشغيل السيرفر (`Ctrl+C` ثم `npm run dev`).
6. اختبر الاتصال:

```bash
node scripts/test-smtp.js
```

النتيجة المتوقعة: `SMTP OK for tourism.noreplay@gmail.com`

## أخطاء شائعة

| المشكلة | الحل |
|--------|------|
| استخدام كلمة مرور الحساب العادية | استخدم App Password فقط |
| الحساب بدون 2FA | فعّل التحقق بخطوتين أولاً |
| App Password قديم/محذوف | أنشئ واحداً جديداً |
| `GMAIL_USER` حساب مختلف عن منشئ الـ App Password | يجب أن يكونا نفس الحساب |
| لم تُعد تشغيل السيرفر بعد تعديل `.env` | أعد التشغيل |

## بديل سريع: Resend

إذا استمر رفض Gmail:

1. أنشئ مفتاحاً من https://resend.com
2. أضف إلى `.env`:

```env
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

النظام يجرب Gmail أولاً، وإن فشل ينتقل تلقائياً إلى Resend.

## أثناء التطوير بدون بريد

عند فشل الإرسال يُطبع رابط التحقق في الطرفية وفي صفحة التسجيل (محلياً فقط):

`http://localhost:3000/auth/verify-email?token=...`

التفاصيل الكاملة للتدفق: `Plan/verifidEmail.md`
