"use client"

import dynamicImport  from 'next/dynamic'
import { MobileMenu } from "../navbar"
import Link from "next/link"

import LogoSvg from '../logo.svg'

import { Suspense } from 'react';

export const dynamic = 'force-dynamic'

const GlobeComponent = dynamicImport (() => import('@/components/GlobeComponent'), {
  ssr: false,
  loading: () => <p>Загрузка 3D глобуса . . .</p>
})

export default function GlobePage() {
  const handleLogout = () => { }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Globe component taking full screen */}
      <div className="absolute inset-0">
        <Suspense fallback="Загрузка 3D глобуса . . .">
          <GlobeComponent />
        </Suspense>
      </div>
      
      {/* Menu container with semi-transparent oval background */}
      <div className="absolute top-0 left-0 right-0 flex justify-center p-4 z-10">
        <div className="relative">

          <div className="relative px-8 py-2">
            <div className="flex justify-between items-center p-4">
            <Link href="/" className="text-2xl font-bold">
              <LogoSvg
                  alt="Мафия GATTI Сыктывкар"
                  width={60}
                  height={60}
                  className="mr-2 flex justify-start"
              />
            </Link>
            <div className="fixed right-3">
              <MobileMenu isAuthenticated={false} isAdmin={false} handleLogout={handleLogout} />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
