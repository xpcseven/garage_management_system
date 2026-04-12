import React from 'react'

type Var = {
    name: string;
    num : number;
}
const Card_02 = ({name,num}:Var) => {
    return (
        <div className='group relative h-[220px] w-[220px] rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 overflow-hidden'>
            {/* Background decorative elements */}
            <div className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300'></div>
            <div className='absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300'></div>
            
            {/* Main content */}
            <div className='relative z-10 text-center'>
                <div className='mb-4'>
                    <h1 className='text-white text-center text-2xl font-bold leading-tight group-hover:text-orange-100 transition-colors duration-300'>{name}</h1>
                </div>

                <div className='relative'>
                    <div className='absolute inset-0 bg-white/20 rounded-full blur-sm'></div>
                    <div className='relative bg-white/30 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 group-hover:bg-white/40 transition-all duration-300'>
                        <h1 className='text-white text-center text-3xl font-black group-hover:scale-110 transition-transform duration-300'>{num}</h1>
                    </div>
                </div>
                
                {/* Decorative line */}
                <div className='w-16 h-1 bg-white/60 rounded-full mx-auto group-hover:bg-white/80 transition-colors duration-300'></div>
            </div>

            {/* Hover effect overlay */}
            <div className='absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl'></div>
        </div>
    )
}

export default Card_02