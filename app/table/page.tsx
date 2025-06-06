'use client'

import Script from 'next/script'
import React, { useState, useEffect } from'react';
import Stol from './stol.svg';
import dynamic from 'next/dynamic'
import { MobileMenu } from "../navbar"
import Link from "next/link"

import LogoSvg from '../logo.svg'

function getRandomInt(n: any) {
    return Math.floor(Math.random() * (2 * n + 1)) - n;
}

function RemoveStroke(player_id: any) {
    try {
        const circle = document.querySelector(`#role${player_id} circle`) as SVGElement | null;
        if (circle) {
            circle.style.stroke = 'none';
            circle.style.opacity = '1';
        }
    } catch (err) { }
}

function SetStroke(player_id: any) {
    try {
        const circle = document.querySelector(`#role${player_id} circle`) as SVGElement | null;
        if (circle) {
            circle.style.stroke = '#99FF99';
            circle.style.strokeWidth = '3.6';
            circle.style.opacity = '0.7';
        }
    } catch (err) { }
}

function SetBlackSheriff(player_id: any) {
    try {
        const antisher = document.querySelector(`#antisheriff${player_id}`);
        if (antisher) {
            antisher.classList.toggle('hidden');
        }
        const circle = document.querySelector(`#role${player_id} circle`) as SVGElement | null;
        if (antisher && antisher.classList.contains('hidden') && circle) { // Проверяем убрали или поставили лжешерифа
            circle.style.fill = '#999999'; // Ставим серый если убрали
        }
        else if (circle) {
            circle.style.fill = '#000000'; // Ставим черный если поставили
        }
        const sher = document.querySelector(`#sheriff${player_id}`);
        if (sher) {
            sher.classList.add('hidden');
        }
    } catch (err) { }
}

function SetRedSheriff(player_id: any) {
    try {
        const sher = document.querySelector(`#sheriff${player_id}`);
        if (sher) {
            sher.classList.toggle('hidden');
        }
        const circle = document.querySelector(`#role${player_id} circle`) as SVGElement | null;
        if (circle) {
            circle.style.fill = '#c00';
        }
        const antisher = document.querySelector(`#antisheriff${player_id}`);
        if (antisher) {
            antisher.classList.add('hidden');
        }
    } catch (err) { }
}

const Menu = ({ id }: { id: number }) => {
    useEffect(() => {
        try {
            const close = document.querySelector('#close');
            if (close) {
                close.classList.remove('hidden'); // проявляем элемент close
            }
            const red = document.querySelector('#red');
            if (red) {
                red.classList.remove('hidden'); // проявляем элемент red
            }
            const black = document.querySelector('#black');
            if (black) {
                black.classList.remove('hidden'); // проявляем элемент black
            }
            const blacksheriff = document.querySelector('#blacksheriff');
            if (blacksheriff) {
                blacksheriff.classList.remove('hidden'); // проявляем элемент blacksheriff
            }
            const redsheriff = document.querySelector('#redsheriff');
            if (redsheriff) {
                redsheriff.classList.remove('hidden'); // проявляем элемент redsheriff
            }
            const votekick = document.querySelector('#votekick');
            if (votekick) {
                votekick.classList.remove('hidden'); // проявляем элемент votekick
            }
            const killed = document.querySelector('#killed');
            if (killed) {
                killed.classList.remove('hidden'); // проявляем элемент killed
            }
            const redblack = document.querySelector('#redblack');
            if (redblack) {
                redblack.classList.remove('hidden'); // проявляем элемент redblack
            }
            const blackred = document.querySelector('#blackred');
            if (blackred) {
                blackred.classList.remove('hidden'); // проявляем элемент blackred
            }
        } catch (err) {
            console.log(`Ошибка в скрытии меню: ${err}`);
        }
    }, []);
    return (
        <div/>
    );
};

const CloseMenu = ({ id }: { id: number }) => {
    useEffect(() => {
        try {
            const close = document.querySelector('#close');
            if (close) {
                close.classList.add('hidden'); // прячем элемент close
            }
            const red = document.querySelector('#red');
            if (red) {
                red.classList.add('hidden'); // прячем элемент red
            }
            const black = document.querySelector('#black');
            if (black) {
                black.classList.add('hidden'); // прячем элемент black
            }
            const blacksheriff = document.querySelector('#blacksheriff');
            if (blacksheriff) {
                blacksheriff.classList.add('hidden'); // прячем элемент blacksheriff
            }
            const redsheriff = document.querySelector('#redsheriff');
            if (redsheriff) {
                redsheriff.classList.add('hidden'); // прячем элемент redsheriff
            }
            const votekick = document.querySelector('#votekick');
            if (votekick) {
                votekick.classList.add('hidden'); // прячем элемент votekick
            }
            const killed = document.querySelector('#killed');
            if (killed) {
                killed.classList.add('hidden'); // прячем элемент killed
            }
            const redblack = document.querySelector('#redblack');
            if (redblack) {
                redblack.classList.add('hidden'); // прячем элемент redblack
            }
            const blackred = document.querySelector('#blackred');
            if (blackred) {
                blackred.classList.add('hidden'); // прячем элемент blackred
            }
        } catch (err) {
            console.log(`Ошибка в скрытии меню: ${err}`);
        }
    }, []);
    return (
        <div/>
    );
};

function Table(){
  const [showMenu, setShowMenu] = useState(false);
  //const [vote1, vote2, vote3, vote4, vote5, vote6, vote7, vote8, vote9, vote10] = useState(false);
  //const [dead1, dead2, dead3, dead4, dead5, dead6, dead7, dead8, dead9, dead10] = useState(false);
  const [menuId, setMenuId] = useState(-1);

  const handleChairClick = (event: any) => {

    const chairId = event.target.getAttribute('id');
    let player_id;
    
    //const svgElement = document.querySelector(`#${chairId}`);
    
    if (chairId === null) {
        console.log(`Зачем на тень нажали?`);
        player_id = -1;
    } else if (chairId.indexOf('coltkiller') !== -1) { // Нажали кольт
        const circle = document.querySelector(`#role${menuId} circle`);
        const colt = document.querySelector(`#colt${menuId}`);
        const molot = document.querySelector(`#molot${menuId}`);
        const group = document.getElementById(`seat${menuId}`);
        if (molot && colt && !molot.classList.contains('hidden')) { // если игрок уже был выгнан
            colt.classList.remove('hidden'); // Добавляем кольт
            molot.classList.add('hidden'); // Убираем молот
        } else if (colt && group) {
            if (colt.classList.contains('hidden') && circle) { // Если игрок не был убит
                colt.classList.remove('hidden'); // Добавляем кольт
                switch(menuId) { // Двигаем стул игрока
                    case 1:
                        group.setAttribute('transform', `rotate(${getRandomInt(2)}) translate(-5, 28)`);
                        break;
                    case 2:
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(-30, 24)`);
                        break;
                    case 3:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-32, -5)`);
                        break;
                    case 4:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-30, -15)`);
                        break;
                    case 5:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-12, -25)`);
                        break;
                    case 6:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(7, -25)`);
                        break;
                    case 7:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(20, -15)`);
                        break;
                    case 8:
                        group.setAttribute('transform', `rotate(${getRandomInt(1)}) translate(29, 5)`);
                        break;
                    case 9:
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(15, 16)`);
                        break;
                    case 10:
                        group.setAttribute('transform', `rotate(${getRandomInt(2)}) translate(5, 25)`);
                        break;
                    default:
                        group.setAttribute('transform', `rotate(${getRandomInt(1)}) translate(5, 5)`);
                        break;
                }
                group.style.opacity = '0.7';
                circle.setAttribute('fill-opacity', '0.5');
            } else { // Игрок уже был убит
                colt.classList.add('hidden'); // Убираме кольт
                group.setAttribute('transform', 'translate(0, 0)');
                group.style.opacity = '1';
                if (circle) {
                    circle.setAttribute('fill-opacity', '1');
                }
            }
        }
        player_id = -1;
    } else if (chairId.indexOf('vote') !== -1) { // Нажали выгнали
        const circle = document.querySelector(`#role${menuId} circle`);
        const molot = document.querySelector(`#molot${menuId}`);
        const group = document.getElementById(`seat${menuId}`);
        const colt = document.querySelector(`#colt${menuId}`);
        if (colt && molot && !colt.classList.contains('hidden')) { // если игрок убит
            colt.classList.add('hidden'); // Убираем кольт
            molot.classList.remove('hidden'); // Добавляем молот
        } else { // был жив
            if (molot && group && molot.classList.contains('hidden')) { // Если игрок не был выгнан
                molot.classList.remove('hidden'); // Добавляем молот
                switch(menuId) { // Двигаем стул игрока
                    case 1:
                        group.setAttribute('transform', `rotate(${getRandomInt(2)}) translate(-5, 28)`);
                        break;
                    case 2:
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(-30, 24)`);
                        break;
                    case 3:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-32, -5)`);
                        break;
                    case 4:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-30, -15)`);
                        break;
                    case 5:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-12, -25)`);
                        break;
                    case 6:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(7, -25)`);
                        break;
                    case 7:
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(20, -15)`);
                        break;
                    case 8:
                        group.setAttribute('transform', `rotate(${getRandomInt(1)}) translate(29, 5)`);
                        break;
                    case 9:
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(15, 16)`);
                        break;
                    case 10:
                        group.setAttribute('transform', `rotate(${getRandomInt(2)}) translate(5, 25)`);
                        break;
                    default:
                        group.setAttribute('transform', `rotate(${getRandomInt(1)}) translate(5, 5)`);
                        break;
                }
                group.style.opacity = '0.7';
                if (circle) {
                    circle.setAttribute('fill-opacity', '0.5');
                }
            } else { // Игрок уже был выган
                if (molot) {
                    molot.classList.add('hidden'); // Убираме кольт
                }
                if (group) {
                    group.setAttribute('transform', 'translate(0, 0)');
                    group.style.opacity = '1';
                }
                if (circle) {
                    circle.setAttribute('fill-opacity', '1');
                }
            }
        }
        player_id = -1;
    } else if (chairId.indexOf('redsheriff1') !== -1) { // Нажали шериф
        SetRedSheriff(menuId);
        player_id = -1;
    } else if (chairId.indexOf('redblack') !== -1) { // Красный и черный 
        const circle = document.querySelector(`#role${menuId} circle`) as SVGElement | null;
        if (circle) {
            circle.style.fill = 'url(#RedBlackGrad)';
        }
        player_id = -1;
    } else if (chairId.indexOf('blackred') !== -1) { // Красный и черный 
        const circle = document.querySelector(`#role${menuId} circle`) as SVGElement | null;
        if (circle) {
            circle.style.fill = 'url(#BlackRedGrad)';
        }
        player_id = -1;
    } else if (chairId.indexOf('blacksheriff2') !== -1) { // Нажали лжешериф
        SetBlackSheriff(menuId);
        player_id = -1;
    } else if (chairId.indexOf('close') !== -1) { // Нажали закрыть меню
        player_id = -1;
    } else if (chairId.indexOf('dislike') !== -1 || chairId.indexOf('black') !== -1) { // Нажали черный игрок
        const circle = document.querySelector(`#role${menuId} circle`) as SVGElement | null;
        if (circle) {
            circle.style.fill = '#000000';
        }
        const sher = document.querySelector(`#sheriff${menuId}`); 
        const antisher = document.querySelector(`#antisheriff${menuId}`);
        if (sher && !sher.classList.contains('hidden')) { // Проверяем был ли игрок шерифом
            try {            
                sher.classList.add('hidden'); // Убираем шерифа
                if (antisher) {
                    antisher.classList.remove('hidden'); // Ставим метку лжешерифа
                }
            } catch (err) { }
        } else if (antisher && !antisher.classList.contains('hidden')) { // Проверяем был ли антишерифом
            try {            
                antisher.classList.add('hidden'); // Убираем метку лжешерифа
            } catch (err) { }
        }
        player_id = -1;
    } else if (chairId.indexOf('like') !== -1 || chairId.indexOf('red') !== -1) { // Нажали игрок красный
        const circle = document.querySelector(`#role${menuId} circle`) as SVGElement | null;
        if (circle) {
            circle.style.fill = '#c00';
        }
        const antisher = document.querySelector(`#antisheriff${menuId}`);
        if (antisher) {
            antisher.classList.add('hidden');
        }
        const sher = document.querySelector(`#sheriff${menuId}`);
        if (sher) {
            sher.classList.add('hidden');
        }
        player_id = -1;
    } else if (chairId.indexOf('seat') !== -1) { // Нажали на кресло
        console.log(`Нажали на кресло игрока с id: ${chairId}`);
        try { // Получаем id игрока
            if (chairId.length === 5) { 
                player_id = chairId[4];
            } else if (chairId[5] === '-') {
                player_id = chairId[4];
            } else {
                player_id = chairId[4] + chairId[5];
            }
        } catch (err) { // ловим ошибки
            console.log(`Ошибка в стульях: ${err}`);
        }
        
    } else if (chairId.indexOf('role') !== -1) { // Нажали на кружок игрока
        console.log(`Нажали на кружок игрока с id: ${chairId}`);
        try {
            if (chairId.length === 5) {
                player_id = chairId[4];
            } else {
                player_id = chairId[4] + chairId[5];
            }
        } catch (err) {
            console.log(`Ошибка в кружках: ${err}`);
        }
    } else {
        console.log(`Что вообще нажали: ${chairId}`);
        player_id = -1;
    }
    console.log(`Полученный id: ${player_id}`);

    if (player_id !== -1) {
        setShowMenu(true);
        RemoveStroke(menuId);
        setMenuId(player_id);
        SetStroke(player_id);
    } else {
        setShowMenu(false);
        RemoveStroke(menuId);
        setMenuId(0);
    }

  };

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    grad.setAttribute("id", "grad");
    grad.setAttribute("x1", "0%");
    grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%");
    grad.setAttribute("y2", "0%");

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "50%");
    stop1.setAttribute("stop-color", "#FF0000");
    grad.appendChild(stop1);

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "50%");
    stop2.setAttribute("stop-color", "#000000");
    grad.appendChild(stop2);
    
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 500) {
        setShowNotification(true);
      } else {
        setShowNotification(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div className="w-full h-full overflow-auto">
        <div className="min-w-[200px] min-h-[200px] w-full h-full flex items-center justify-center">
          <Stol onClick={(event: any) => handleChairClick(event)} className="w-full h-full" />
        </div>
      </div>
      {showMenu && <Menu id={menuId} />}
      {!showMenu && <CloseMenu id={menuId} />} 
    </div>
  );

};



export default function GamePage() {
  const handleLogout = () => { }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Table />
      </div>
      <div className="absolute top-0 left-0 right-0 flex justify-normal z-10">
        <div className="relative">
          <div className="relative px-2 py-4">
            <div className="flex justify-between items-start">
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