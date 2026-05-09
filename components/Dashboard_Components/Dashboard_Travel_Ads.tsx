import React from 'react'
import Image from 'next/image'
import publicGarageImage from "@/public/System/Public_Garagr.png";
import outsideGarageImage from "@/public/System/Outside_Garage.png";
const Dashboard_Travel_Ads = () => {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg">
                <div className="relative h-64 sm:h-72">
                    <Image
                        src={publicGarageImage}
                        alt="خدمات النقل العام"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-emerald-900/10 to-transparent" />
                    <span className="absolute right-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold">
                        النقل العام
                    </span>
                </div>
                <div className="space-y-4 p-6 text-right">
                    <h2 className="text-2xl font-bold text-emerald-700">
                        تشغيل رحلات النقل العام بكفاءة
                    </h2>
                    <p className="text-sm leading-7 text-slate-600">
                        إدارة خطوط النقل العام، تنظيم جداول الانطلاق والوصول، متابعة
                        الإشغال، وتحسين تجربة الركاب عبر نظام موحد وسهل الاستخدام.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>تنظيم المسارات والمحطات</li>
                        <li>متابعة الحجوزات اليومية لحظياً</li>
                        <li>تحسين الالتزام بالمواعيد والجودة التشغيلية</li>
                    </ul>
                </div>
            </article>

            <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
                <div className="relative h-64 sm:h-72">
                    <Image
                        src={outsideGarageImage}
                        alt="خدمات النقل الخارجي"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-blue-900/10 to-transparent" />
                    <span className="absolute right-4 top-4 rounded-full bg-blue-500/90 px-3 py-1 text-xs font-bold">
                        النقل الخارجي
                    </span>
                </div>
                <div className="space-y-4 p-6 text-right">
                    <h2 className="text-2xl font-bold text-blue-700">
                        حلول مرنة للنقل الخارجي بين المدن
                    </h2>
                    <p className="text-sm leading-7 text-slate-600">
                        خطّط رحلات النقل الخارجي بثقة عبر إدارة المركبات والسائقين،
                        توزيع المهام، وضمان التتبع التشغيلي الكامل لكل رحلة.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>إدارة خطوط السفر البعيدة والرحلات الطويلة</li>
                        <li>تتبع المركبات والسائقين أثناء التشغيل</li>
                        <li>تنسيق أفضل بين الطلبات والتحميل والانطلاق</li>
                    </ul>
                </div>
            </article>
        </div>
    )
}

export default Dashboard_Travel_Ads