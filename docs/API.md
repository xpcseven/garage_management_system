# واجهة API الآمنة (Token)

القاعدة: `https://your-domain.com/api/v1`

## نموذج الأمان (موصى به)

| التوكن | الاستخدام | العمر | التخزين |
|--------|-----------|-------|---------|
| **Access Token** | كل طلب API | 15 دقيقة (قابل للتعديل) | ذاكرة التطبيق فقط |
| **Refresh Token** | تجديد الجلسة | 30 يوماً | `expo-secure-store` / Keychain |

- Access Token = **JWT** موقّع بـ `AUTH_SECRET` (لا يُخزَّن في قاعدة البيانات).
- Refresh Token = سلسلة عشوائية؛ يُحفظ في DB **مشفّر SHA-256** فقط (لا يمكن استرجاعه من DB).
- عند كل `refresh` يُلغى التوكن القديم ويُصدر جديد (**تدوير**).

---

## 1. تسجيل الدخول

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**الاستجابة:**

```json
{
  "ok": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "opaque-long-string",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": { "id": "...", "email": "...", "name": "...", "role": "USER" }
  }
}
```

---

## 2. الطلبات المحمية

```http
Authorization: Bearer <accessToken>
```

عند انتهاء Access Token (401 `TOKEN_EXPIRED`):

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "<refreshToken>" }
```

يُرجع `accessToken` و`refreshToken` جديدين.

---

## 3. تسجيل الخروج

```http
POST /api/v1/auth/logout
{ "refreshToken": "<refreshToken>" }
```

---

## 4. بيانات عامة (بدون توكن)

| الطريقة | المسار |
|--------|--------|
| GET | `/public/slider` |
| GET | `/public/tourism-places` |
| GET | `/public/tourism-places/cards` | كاردات صفحة `/tourism-places` (نفس الشكل) |
| GET | `/public/tourism-places/cards?limit=6` | أول 6 أماكن (مثل الرئيسية) |
| GET | `/public/tourism-places/:placeId` |
| GET | `/public/cities` |
| GET | `/health` |

### كاردات الأماكن السياحية (مثل `/tourism-places`)

```http
GET http://localhost:3000/api/v1/public/tourism-places/cards
```

مثال عنصر في الاستجابة:

```json
{
  "id": "uuid",
  "name": "بابل",
  "description": "وصف المكان أو «بدون وصف»",
  "imageUrl": "http://localhost:3000/uploads/....jpg",
  "images": ["..."],
  "imageCount": 3,
  "hasImages": true,
  "locationLabel": "بابل — المحافظة",
  "governorate": "بابل",
  "cityName": null,
  "cityRegion": null,
  "detailPath": "/tourism-places/uuid",
  "detailUrl": "http://localhost:3000/tourism-places/uuid",
  "createdAt": "2026-05-01T12:00:00.000Z"
}
```

## 5. مسافر (دور `USER` + `Authorization: Bearer <accessToken>`)

| الطريقة | المسار | الوصف |
|--------|--------|--------|
| GET | `/garages` | قائمة الكراجات |
| GET | `/garages/:garageId` | تفاصيل كراج |
| GET | `/garages/:garageId/trips` | رحلات الكراج |
| GET | `/trips/freelance` | رحلات مستقلة |
| GET | `/trips/search?fromCityId=&toCityId=&q=&scope=all\|garage\|freelance` | بحث رحلات |
| GET | `/trips/:tripId/seats` | مقاعد متاحة |
| GET | `/tourism-programs` | برامج سياحية |
| GET | `/bookings` | حجوزاتي |
| POST | `/bookings/trip` | حجز مقعد `{ tripId, seatId, luggage? }` |
| POST | `/bookings/tourism-program` | `{ programId, passengersCount }` |
| DELETE | `/bookings/:bookingId` | إلغاء حجز |

فهرس كامل: `GET /api/v1`

---

## Expo — مثال

```ts
const API = process.env.EXPO_PUBLIC_API_URL!; // https://domain.com/api/v1

async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  await SecureStore.setItemAsync("refreshToken", json.data.refreshToken);
  return json.data.accessToken; // احفظه في state
}

async function apiGet(path: string, accessToken: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (json.code === "TOKEN_EXPIRED") {
    // استدعِ /auth/refresh ثم أعد المحاولة
  }
  if (!json.ok) throw new Error(json.error);
  return json.data;
}
```

---

## إعداد السيرفر

1. `AUTH_SECRET` قوي (32+ حرف عشوائي) — **لا تشاركه أبداً**.
2. `npm run db:push` أو migrate لجدول `ApiRefreshToken`.
3. HTTPS إلزامي في الإنتاج.
4. لا تضع التوكنات في `.env` العام — فقط في التطبيق بعد Login.

---

## متغيرات البيئة

```env
API_ACCESS_TOKEN_TTL=15m
API_REFRESH_TOKEN_DAYS=30
AUTH_SECRET=...
```
