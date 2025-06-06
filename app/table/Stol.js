import React, { useState, useEffect } from'react';
import { ReactComponent as Stol } from './stol.svg';
import '../index.css';
import { Nav } from './Navs';

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

function getRandomInt(n) {
    return Math.floor(Math.random() * (2 * n + 1)) - n;
}

function RemoveStroke(player_id) {
    try {
        const circle = document.querySelector(`#role${player_id} circle`);
        circle.style.stroke = 'none';
        circle.style.opacity = '1';
    } catch (err) { }
}

function SetStroke(player_id) {
    try {
        const circle = document.querySelector(`#role${player_id} circle`);
        circle.style.stroke = '#99FF99';
        circle.style.strokeWidth = '3.6';
        circle.style.opacity = '0.7';
    } catch (err) { }
}

function SetBlackSheriff(player_id) {
    try {
        const antisher = document.querySelector(`#antisheriff${player_id}`);
        antisher.classList.toggle('hidden');
        const circle = document.querySelector(`#role${player_id} circle`);
        if (antisher.classList.contains('hidden')) { // Проверяем убрали или поставили лжешерифа
            circle.style.fill = '#999999'; // Ставим серйы если убарли
        }
        else {
            circle.style.fill = '#000000'; // Ставим черный если поставили
        }
        const sher = document.querySelector(`#sheriff${player_id}`);
        sher.classList.add('hidden');
    } catch (err) { }
}

function SetRedSheriff(player_id) {
    try {
        const sher = document.querySelector(`#sheriff${player_id}`);
        sher.classList.toggle('hidden');
        const circle = document.querySelector(`#role${player_id} circle`);
        circle.style.fill = '#c00';
        const antisher = document.querySelector(`#antisheriff${player_id}`);
        antisher.classList.add('hidden');
    } catch (err) { }
}

const Menu = (props) => {
    try {
        document.querySelector('#close').classList.remove('hidden'); // проявляем элемент close
        document.querySelector('#red').classList.remove('hidden'); // проявляем элемент red
        document.querySelector('#black').classList.remove('hidden'); // проявляем элемент black
        document.querySelector('#blacksheriff').classList.remove('hidden'); // проявляем элемент blacksheriff
        document.querySelector('#redsheriff').classList.remove('hidden'); // проявляем элемент redsheriff
        document.querySelector('#votekick').classList.remove('hidden'); // проявляем элемент votekick
        document.querySelector('#killed').classList.remove('hidden'); // проявляем элемент killed
        document.querySelector('#redblack').classList.remove('hidden'); // проявляем элемент redblack
        document.querySelector('#blackred').classList.remove('hidden'); // проявляем элемент blackred
    } catch (err) {
        console.log(`Ошибка в скрытии меню: ${err}`);
    }
};

const CloseMenu = (props) => {
    try {
        document.querySelector('#close').classList.add('hidden'); // прячем элемент close
        document.querySelector('#red').classList.add('hidden'); // прячем элемент red
        document.querySelector('#black').classList.add('hidden'); // прячем элемент black
        document.querySelector('#blacksheriff').classList.add('hidden'); // прячем элемент blacksheriff
        document.querySelector('#redsheriff').classList.add('hidden'); // прячем элемент redsheriff
        document.querySelector('#votekick').classList.add('hidden'); // прячем элемент votekick
        document.querySelector('#killed').classList.add('hidden'); // прячем элемент killed
        document.querySelector('#redblack').classList.add('hidden'); // прячем элемент redblack
        document.querySelector('#blackred').classList.add('hidden'); // прячем элемент blackred
    } catch (err) {
        console.log(`Ошибка в скрытии меню: ${err}`);
    }
};

export const Table = () => {
  const [showMenu, setShowMenu] = useState(false);
  //const [vote1, vote2, vote3, vote4, vote5, vote6, vote7, vote8, vote9, vote10] = useState(false);
  //const [dead1, dead2, dead3, dead4, dead5, dead6, dead7, dead8, dead9, dead10] = useState(false);
  const [menuId, setMenuId] = useState(-1);

  const handleChairClick = (event) => {
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
        if (!molot.classList.contains('hidden')) { // если игрок уже был выгнан
            colt.classList.remove('hidden'); // Добавляем кольт
            molot.classList.add('hidden'); // Убираем молот
        } else {
            if (colt.classList.contains('hidden')) { // Если игрок не был убит
                colt.classList.remove('hidden'); // Добавляем кольт
                switch(menuId) { // Двигаем стул игрока
                    case '1':
                        group.setAttribute('transform', `rotate(${getRandomInt(2)}) translate(-5, 28)`);
                        break;
                    case '2':
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(-30, 24)`);
                        break;
                    case '3':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-32, -5)`);
                        break;
                    case '4':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-30, -15)`);
                        break;
                    case '5':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-12, -25)`);
                        break;
                    case '6':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(7, -25)`);
                        break;
                    case '7':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(20, -15)`);
                        break;
                    case '8':
                        group.setAttribute('transform', `rotate(${getRandomInt(1)}) translate(29, 5)`);
                        break;
                    case '9':
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(15, 16)`);
                        break;
                    case '10':
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
                circle.setAttribute('fill-opacity', '1');
            }
        }
        player_id = -1;
    } else if (chairId.indexOf('vote') !== -1) { // Нажали выгнали
        const circle = document.querySelector(`#role${menuId} circle`);
        const molot = document.querySelector(`#molot${menuId}`);
        const group = document.getElementById(`seat${menuId}`);
        const colt = document.querySelector(`#colt${menuId}`);
        if (!colt.classList.contains('hidden')) { // если игрок убит
            colt.classList.add('hidden'); // Убираем кольт
            molot.classList.remove('hidden'); // Добавляем молот
        } else { // был жив
            if (molot.classList.contains('hidden')) { // Если игрок не был выгнан
                molot.classList.remove('hidden'); // Добавляем молот
                switch(menuId) { // Двигаем стул игрока
                    case '1':
                        group.setAttribute('transform', `rotate(${getRandomInt(2)}) translate(-5, 28)`);
                        break;
                    case '2':
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(-30, 24)`);
                        break;
                    case '3':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-32, -5)`);
                        break;
                    case '4':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-30, -15)`);
                        break;
                    case '5':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(-12, -25)`);
                        break;
                    case '6':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(7, -25)`);
                        break;
                    case '7':
                        group.setAttribute('transform', `rotate(${getRandomInt(4)}) translate(20, -15)`);
                        break;
                    case '8':
                        group.setAttribute('transform', `rotate(${getRandomInt(1)}) translate(29, 5)`);
                        break;
                    case '9':
                        group.setAttribute('transform', `rotate(${getRandomInt(3)}) translate(15, 16)`);
                        break;
                    case '10':
                        group.setAttribute('transform', `rotate(${getRandomInt(2)}) translate(5, 25)`);
                        break;
                    default:
                        group.setAttribute('transform', `rotate(${getRandomInt(1)}) translate(5, 5)`);
                        break;
                }
                group.style.opacity = '0.7';
                circle.setAttribute('fill-opacity', '0.5');
            } else { // Игрок уже был выган
                molot.classList.add('hidden'); // Убираме кольт
                group.setAttribute('transform', 'translate(0, 0)');
                group.style.opacity = '1';
                circle.setAttribute('fill-opacity', '1');
            }
        }
        player_id = -1;
    } else if (chairId.indexOf('redsheriff1') !== -1) { // Нажали шериф
        SetRedSheriff(menuId);
        player_id = -1;
    } else if (chairId.indexOf('redblack') !== -1) { // Красный и черный 
        const circle = document.querySelector(`#role${menuId} circle`);
        circle.style.fill = 'url(#RedBlackGrad)';
        player_id = -1;
    } else if (chairId.indexOf('blackred') !== -1) { // Красный и черный 
        const circle = document.querySelector(`#role${menuId} circle`);
        circle.style.fill = 'url(#BlackRedGrad)';
        player_id = -1;
    } else if (chairId.indexOf('blacksheriff2') !== -1) { // Нажали лжешериф
        SetBlackSheriff(menuId);
        player_id = -1;
    } else if (chairId.indexOf('close') !== -1) { // Нажали закрыть меню
        player_id = -1;
    } else if (chairId.indexOf('dislike') !== -1 || chairId.indexOf('black') !== -1) { // Нажали черный игрок
        const circle = document.querySelector(`#role${menuId} circle`);
        circle.style.fill = '#000000';
        const sher = document.querySelector(`#sheriff${menuId}`); 
        const antisher = document.querySelector(`#antisheriff${menuId}`);
        if (!sher.classList.contains('hidden')) { // Проверяем был ли игрок шерифом
            try {            
                sher.classList.add('hidden'); // Убираем шерифа
                document.querySelector(`#antisheriff${menuId}`).classList.remove('hidden'); // Ставим метку лжешерифа
            } catch (err) { }
        } else if (!antisher.classList.contains('hidden')) { // Проверяем был ли антишерифом
            try {            
                antisher.classList.add('hidden'); // Убираем метку лжешерифа
            } catch (err) { }
        }
        player_id = -1;
    } else if (chairId.indexOf('like') !== -1 || chairId.indexOf('red') !== -1) { // Нажали игрок красный
        const circle = document.querySelector(`#role${menuId} circle`);
        circle.style.fill = '#c00';
        const antisher = document.querySelector(`#antisheriff${menuId}`);
        antisher.classList.add('hidden');
        const sher = document.querySelector(`#sheriff${menuId}`);
        sher.classList.add('hidden');
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
    <div className="kometa-ui">
        <Nav />
        <div className='Tb'>
            {showNotification && (
                <div style={{ position: 'fixed', top: 92, left: 0, width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '10px', textAlign: 'center' }}>
                Пожалуйста, переверните свой телефон в горизонтальное положение для лучшего просмотра.
                </div>
            )}    
            <Stol onClick={(event) => handleChairClick(event)}/>
            {showMenu && <Menu id={menuId} />}
            {!showMenu && <CloseMenu id={menuId} />} 
        </div>
    </div>
  );
};