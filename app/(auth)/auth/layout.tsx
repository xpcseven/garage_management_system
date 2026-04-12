import React from 'react'

const AuthLayout = ({children}: {children : React.ReactNode}) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100 to-blue-300 font-cairo'>
        {children}
    </div>
  )
}

export default AuthLayout