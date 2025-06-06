'use client';

import { useState, useEffect } from 'react';

export const Banner = () => {
 const [showBanner, setShowBanner] = useState(true);

 useEffect(() => {
   const bannerClosed = localStorage.getItem('bannerClosed');
   if (bannerClosed) {
     const closedDate = new Date(parseInt(bannerClosed));
     const currentDate = new Date();
     const timeDiff = Math.abs(currentDate.getTime() - closedDate.getTime());
     const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
     if (diffDays < 3) {
       setShowBanner(false);
     }
   }
 }, []);

 const handleCloseBanner = () => {
   setShowBanner(false);
   localStorage.setItem('bannerClosed', new Date().getTime().toString());
 };

 if (!showBanner) {
   return null;
 }

 return (
   <section className="py-3 text-center bg-[linear-gradient(to_right,rgb(252,214,255,.7),rgb(41,216,255,.7),rgb(255,253,128,.7),rgb(248,154,191,.7),rgb(252,214,255,.7))] bg-opacity-70 relative">
     <button onClick={handleCloseBanner} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
       &times;
     </button>
     <div className="container">
       <p className="font-medium">
         <span className="hidden md:inline">Introducing a completely redesigned interface – </span>
         <a href="#" className="underline underline-offset-4">Explore the demo</a>
       </p>
     </div>
   </section>
 );
};
