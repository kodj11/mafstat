'use client'
import { useEffect } from "react";
import { NavMenu } from "./navbar";
import Script from 'next/script';
import { Features } from "@/sections/Features";
import { ProductShowcase } from "@/sections/ProductShowcase";
import { FAQs } from "@/sections/FAQs";

import { Footer } from "@/sections/Footer";
import Hide from "@/components/HideText";
import "@/css/grad.css";

import Footer2 from "@/components/footer/Footer1";

import Lenis from 'lenis';

export default function Home() {
  useEffect( () => {
    const lenis = new Lenis()

    function raf(time: any) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])
  return (
    <>
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
      
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pt-8 pb-10 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <NavMenu />
        <div className="scrolling" >
        
          <div className="stickys">
            
            <div className="intros">
              <div id="intro-01" className="intro active"> 
                <div className="mainDiv mainDivText">
                  <h1 className="bigTitle"><span className="welcomeTexjt">Мирный город</span> приветствует тебя </h1>
                  <div className='research'>листай вниз для продолжения</div>
                </div>
              </div>
              
              <div id="intro-02" className="intro"> 
                <div className="animate__animated animate__fadeInUp">
                  <br/><br/><br/>
                  <FAQs />
                  
                </div>
              </div>
              
              <div id="intro-03" className="intro"> 
                <div className="animate__animated animate__fadeInUp">
                  <Features />
                </div>
              </div>
            </div>
          </div>
          
          <div className="our-values-scroll">
            <div className="our-values-scroll-01"></div>
            <div className="our-values-scroll-02"></div>
            <div className="our-values-scroll-04"></div>
            <div className="our-values-scroll-03"><Hide/></div>
            <div className="our-values-scroll-05">
            <br/><br/><br/>
            <ProductShowcase />
            </div>
          </div>
          
        </div>
        <Footer />
      </div>
      <Footer2 />

      <Script
        // Безопасно: используется только для собственного скрипта, не пользовательский ввод
        dangerouslySetInnerHTML={{
          __html: `
            jQuery(document).ready(function ($) {
	
            $(document).scroll(function() {
              
              // calculate where the sections start
              var first_window = ($('.stickys').offset().top);
              var second_window = ($('.our-values-scroll-01').offset().top);
              var third_window = ($('.our-values-scroll-02').offset().top);
              var footer = ($('.f0ter').offset().top);
              
              var scrollPos = $(document).scrollTop();

              // Apply text changes
              if (scrollPos < second_window) {
                jQuery('#intro-02, #intro-03').removeClass('active');
                jQuery('#intro-01').addClass('active');
              }		
              else if (scrollPos >= second_window && scrollPos < third_window) {
                jQuery('#intro-01, #intro-03').removeClass('active');
                jQuery('#intro-02').addClass('active');
              }
              else if (scrollPos >= third_window && scrollPos < footer) {
                jQuery('#intro-01, #intro-02').removeClass('active');
                jQuery('#intro-03').addClass('active');  
              }
              else { // дальше изменяемого блока
                jQuery('#intro-01, #intro-02').removeClass('active');
                jQuery('#intro-03').addClass('active');  
              } 
              
            });
            
          });
          `
        }}
      />
    </>
  );
}