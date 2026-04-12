"use client"
import Image from 'next/image'
import React from 'react'

type Var = {
    name: string;
    type?:string;
    src: string;
    description: string;
}

const Card_01 = ({ name,type, src, description }: Var) => {
    return (
        <div className="group w-full h-40 sm:h-48 md:h-56 rounded-2xl relative flex flex-col p-6 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer">
            
            {/* الصورة مع تأثيرات محسنة */}
            <div className="absolute top-0 left-0 w-full h-full">
                <Image
                    alt={name}
                    src={src}
                    fill
                    className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay متدرج مع تأثيرات متعددة */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/60 via-black/30 to-transparent rounded-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-amber-900/80 via-amber-800/40 to-transparent rounded-2xl"></div>
                
                {/* تأثير إضاءة في الزاوية */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            </div>


            {/* المحتوى النصي مع تحسينات */}
            <div className="relative z-10 flex flex-col justify-end h-full">
            <div className="mb-1">
                    <h1 className="text-white text-sm sm:text-sm leading-tight group-hover:text-orange-200 transition-colors duration-300 drop-shadow-lg">
                        {type}
                    </h1>
                </div>
                {/* العنوان مع تأثيرات */}
                <div className="mb-3">
                    <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight group-hover:text-orange-200 transition-colors duration-300 drop-shadow-lg">
                        {name}
                    </h1>
                </div>
                
                {/* الوصف مع تحسينات */}
                <div className="mb-2">
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed group-hover:text-white transition-colors duration-300 drop-shadow-md line-clamp-3">
                        {description}
                    </p>
                </div>
                
                {/* خط زخرفي */}
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full group-hover:w-24 transition-all duration-300"></div>
            </div>

            {/* تأثير hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            {/* تأثير الحدود */}
            <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-orange-300/50 transition-colors duration-300"></div>
        </div>
    )
}

export default Card_01