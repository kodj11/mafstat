import React from 'react'
import Link from 'next/link';

export default function Content() {
  return (
    <div className='bg-[#4E4E5A] py-8 px-12 h-full w-full flex flex-col justify-between'>
        <Section1 />
        <Section2 />
    </div>
  )
}

const Section1 = () => {
    return (
        <div>
            <Nav />
        </div>
    )
}

const Section2 = () => {
    return (
        <div className='flex justify-between items-end'>
            <h1 className='text-[14vw] leading-[0.8] mt-10'>Быстрые ссылки</h1>
            <p>2025</p>
        </div>
    )
}

const Nav = () => {
    return (
        <div className='flex shrink-0 gap-20'>
            <div className='flex flex-col gap-2'>
                <h3 className='mb-2 uppercase text-[#ffffff80]'>Полезное на сайте</h3>
                <Link href="/table">
                    <p className='text-gray-200'>Стол теории</p>
                </Link>
                <Link href="/map">
                    <p className='text-gray-200'>Карта мафии</p>
                </Link>
                <Link href="/profile">
                    <p className='text-gray-200'>Профиль</p>
                </Link>
                <Link href="/game">
                    <p className='text-gray-200'>Рассадка стола</p>
                </Link>
            </div>
            <div className='flex flex-col gap-2'>
                <h3 className='mb-2 uppercase text-[#ffffff80]'>Почитать на досуге</h3>
                <Link href="https://vk.com/mafiaparanoya">
                    <p className='text-gray-200'>Интересные материалы и мемы</p>
                </Link>
                <Link href="https://www.wildberries.ru/catalog/36250642/detail.aspx">
                    <p className='text-gray-200'>Книги по спортивной мафии</p>
                </Link>
                <Link href="https://gomafia.pro/Официальные%20правила%20игры%20Мафия.pdf">
                    <p className='text-gray-200'>Правила FSM</p>
                </Link>
                <Link href="https://vk.com/mgatti">
                    <p className='text-gray-200'>Группа ВК</p>
                </Link>
            </div>
        </div>
    )
}