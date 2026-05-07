import React from 'react'

const AuthLayout = ({children}: {children : React.ReactNode}) => {
  return (
    <div className="relative min-h-screen overflow-hidden [font-family:'CairoFont',Arial,Helvetica,sans-serif]">
      <div className='absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-900' />
      <div className='pointer-events-none absolute -top-24 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-purple-400/20 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-28 -left-24 h-[24rem] w-[24rem] rounded-full bg-cyan-300/20 blur-3xl' />
      <div className='pointer-events-none absolute -right-24 top-1/3 h-[20rem] w-[20rem] rounded-full bg-blue-500/20 blur-3xl' />
      <div className='pointer-events-none absolute inset-0 opacity-[0.07] [background:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:36px_36px]' />

      <div className='relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6'>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout