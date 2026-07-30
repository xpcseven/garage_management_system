# نظام التصميم الأمامي — بنفسج آشور (Tailwind CSS)

> مرجع واجهات منصة آشور للسياحة والسفر. الهوية الحالية: **بنفسجي** بلمسة معاصرة — ليست قالب indigo→purple القديم.

## 0) الدور

كل قرار لون/خط/تخطيط يخدم منصة سياحية عراقية (شركات، فنادق، مطاعم، مزارع) بهوية بنفسجية واضحة ومميزة.

---

## 1) لوحة الألوان — "بنفسج آشور"

| الاسم | Hex | الاستخدام |
|---|---|---|
| `plum` | `#5B21B6` | أساسي: هيدر، أزرار، روابط |
| `orchid` | `#8B5CF6` | تدرجات، نشط، ظلال |
| `lilac` / `orchid.light` | `#A78BFA` | تمييزات خفيفة |
| `fuchsia.brand` | `#C026D3` | مطاعم / تمييز دافئ |
| `mist` | `#F5F3FF` | خلفية الصفحة |
| `dusk` | `#1E1B4B` | النصوص |

```js
colors: {
  plum:   { DEFAULT: '#5B21B6', light: '#7C3AED', dark: '#3B0764', soft: '#EDE9FE' },
  orchid: { DEFAULT: '#8B5CF6', light: '#A78BFA', dark: '#6D28D9' },
  mist:   { DEFAULT: '#F5F3FF', dark: '#EDE9FE', deep: '#DDD6FE' },
  dusk:   { DEFAULT: '#1E1B4B', muted: '#312E81' },
  fuchsia:{ brand: '#C026D3', soft: '#FAE8FF' },
}
```

فئات: فنادق → `plum` · مطاعم → `fuchsia` · مزارع → `orchid.dark` · شركات سياحية → `orchid`.

---

## 2) الطباعة

- نص: **Cairo** (`font-sans` / `font-cairo` / `font-body`)
- عرض (عناوين كبيرة فقط): **Aref Ruqaa** (`font-display`)
- بيانات/أرقام: **IBM Plex Sans** (`font-data`) مع Cairo كاحتياطي

---

## 3) بطاقة التذكرة

استخدم `components/Shared/TicketStub.tsx` لكل بطاقة مكان/شريك. خلفية بيضاء + حلقة `plum/10` + خط متقطع + ثقوب.

---

## 4) مكوّنات مساعدة

- `.ashur-panel` — لوحة محتوى بظل بنفسجي
- `.ashur-page-title` — عنوان صفحة بـ `font-display` ولون `plum`
- الهيدر: `plum-dark` مع وهج `orchid` / `fuchsia` خفيف — **ليس** تدرج indigo→purple القديم

---

## 5) RTL والحركة

- خصائص منطقية: `ps/pe/ms/me/start/end`
- Hover بطاقات: `hover:-translate-y-1` + ميل التذكرة فقط
- `motion-reduce:transition-none`
