'use client'
import React from 'react'

const Dashboard_Details = () => {
    return (
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 text-right sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-purple-100 bg-white p-4">
                <p className="text-sm text-slate-500">تشغيل يومي</p>
                <p className="mt-1 text-xl font-bold text-purple-600">رحلات منتظمة</p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-white p-4">
                <p className="text-sm text-slate-500">إدارة ذكية</p>
                <p className="mt-1 text-xl font-bold text-purple-600">مركبات وسائقون</p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-white p-4">
                <p className="text-sm text-slate-500">خدمة العملاء</p>
                <p className="mt-1 text-xl font-bold text-purple-600">حجوزات دقيقة</p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-white p-4">
                <p className="text-sm text-slate-500">توسّع الأعمال</p>
                <p className="mt-1 text-xl font-bold text-purple-600">نقل عام وخارجي</p>
            </div>
        </div>
    )
}

export default Dashboard_Details