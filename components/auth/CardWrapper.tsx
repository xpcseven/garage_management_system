"use client"
import React from 'react'
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader
 } from '@/components/ui/card';
import { Header } from '@/components/auth/Header';
import Social from '@/components/auth/Social';
import BackButton from '@/components/auth/BackButton';

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel : string;
    backButtonLabel : string;
    backButtonHref: string;
    showSocial? : boolean;
}

const CardWrapper = ({
    children,
    headerLabel,
    backButtonLabel,
    backButtonHref,
    showSocial
} :CardWrapperProps ) => {
  return (
   <Card className='w-[400px] shadow-md bg-transparent'>
    <CardHeader>
      <Header label={headerLabel}/>
    </CardHeader>
    <CardContent>

    {children}
    </CardContent>
    {showSocial && (
      <CardFooter>
        <Social />
      </CardFooter>
    )}

    <CardFooter>
      <BackButton  
      label={backButtonLabel}
      href={backButtonHref}
      />
    </CardFooter>
   </Card>
  )
}

export default CardWrapper