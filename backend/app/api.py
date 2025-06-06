from fastapi import FastAPI, Response, HTTPException, Request, Depends, Header, Query, status, Security, Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, constr, Field
from fastapi.encoders import jsonable_encoder
from fastapi import Body
from fastapi.responses import JSONResponse

from typing import Optional, List

import json
import jwt #pip install pyjwt https://pypi.org/project/PyJWT/

import hashlib
import sys
sys.path.append('.. /dbase_setup')

from dbase_setup.db_api import check_token, get_players, get_games, add_game, search_players, get_games_filtered, get_games_count
from dbase_setup.db_api import check_login, check_logpas, add_logpas, update_jwt, check_jwt
from dbase_setup.db_api import get_player_games_by_role, get_player_wins_by_role
from dbase_setup.db_api import get_user_id_by_token, get_user_profile
from dbase_setup.db_api import add_profile
from dbase_setup.db_api import get_settings, set_registration_open, set_pin, check_pin
from dbase_setup.db_api import update_game
from dbase_setup.db_api import get_games_summary_strict

from datetime import datetime, timedelta

from collections import defaultdict
import time
import os
import bcrypt
import secrets
import bleach
from pathlib import Path
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent.parent / '.env.local'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

# Хранилище попыток: {login: [timestamps]}
login_attempts = defaultdict(list)
MAX_ATTEMPTS = 5
BLOCK_TIME = 60  # секунд

app = FastAPI() 

# SECRET_KEY = "3Kr0IS4oDlJy05QPoUdHlo1o7VbFRss3SYDACLBzm6c="
SECRET_KEY = os.environ.get("SECRET_KEY", "changeme")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 90

CSRF_SECRET = os.environ.get("CSRF_SECRET", "csrfchangeme")
CSRF_HEADER_NAME = "x-csrf-token"
CSRF_COOKIE_NAME = "csrf_token"

REFRESH_TOKEN_EXPIRE_DAYS = 2
REFRESH_TOKEN_COOKIE_NAME = "refresh_token"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mgatti.ru",
        "https://mgatti.ru:8080",
        "https://localhost:3000",
        "http://localhost:8000",
        "https://localhost:8000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
)

class Tokenclass(BaseModel):
    token: str

class Entryclass(BaseModel):
    username: str
    password: str

class Regclass(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=32)
    password: str = Field(..., min_length=8, max_length=128)

class RoleStatsResponse(BaseModel):
    peaceful: int
    mafia: int
    don: int
    sheriff: int
    lead: int

class WinStatsResponse(BaseModel):
    role: str
    games: int
    wins: int

class WinStatsListResponse(BaseModel):
    stats: list[WinStatsResponse]

class UserProfileResponse(BaseModel):
    username: str
    is_admin: bool
    status: Optional[str]
    geolocation: Optional[str]
    is_open_profile: bool
    avatar: str
    contact_email: Optional[str]
    is_online: bool

class GamePlayer(BaseModel):
    id: int
    name: str = Field(..., min_length=1, max_length=64)
    role: str = Field(..., min_length=1, max_length=32)
    # Добавьте другие поля по необходимости

class GameData(BaseModel):
    date: str = Field(..., min_length=8, max_length=10)
    winner: str = Field(..., min_length=1, max_length=32)
    table: int
    game_number: int
    participants: list[int]
    leadPlayerId: Optional[int]
    bestMoves: Optional[list[str]] = []
    players: list[GamePlayer]

class ProfileData(BaseModel):
    status: Optional[str] = Field("Игрок", max_length=64, min_length=1)
    geolocation: Optional[str] = Field("Россия", max_length=64, min_length=1)
    is_open_profile: Optional[int] = 1
    avatar: Optional[str] = Field("https://github.com/shadcn.png", max_length=256, min_length=1)
    contact_email: Optional[EmailStr]
    is_online: Optional[int] = 0

class AddUserRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=32)
    password: str = Field(..., min_length=8, max_length=128)
    profile: Optional[ProfileData] = None

class SettingsUpdateRequest(BaseModel):
    is_open_reg: Optional[bool] = None
    new_pin: Optional[str] = None

class PinCheckRequest(BaseModel):
    pin: str

class RegistrationStatusResponse(BaseModel):
    is_open_reg: bool

class SearchPlayersRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=128)
    limit: int = 30
    offset: int = 0

class GamesRequest(BaseModel):
    limit: int = 30
    offset: int = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None

class PlayersRequest(BaseModel):
    limit: int = 30
    offset: int = 0

class UpdateGamePlayer(BaseModel):
    user_id: int
    role: str
    additional_points: float | None = None

class UpdateGameRequest(BaseModel):
    winner: str | None = None
    table_number: int | None = None
    game_number: int | None = None
    lead_player_id: int | None = None
    best_moves: List[int] | None = None
    players: List[UpdateGamePlayer] | None = None

# SECURITY: Проверка секретов при запуске
if SECRET_KEY == "changeme" or CSRF_SECRET == "csrfchangeme":
    raise RuntimeError("SECURITY ERROR: Set proper SECRET_KEY and CSRF_SECRET in environment variables!")

DEBUG = os.environ.get("DEBUG", "0") == "1"

def sanitize_string(s: str) -> str:
    return bleach.clean(s, tags=[], attributes={}, styles=[], strip=True)

# --- CSRF ---
def verify_csrf_token(
    csrf_token: str = Header(None, alias=CSRF_HEADER_NAME),
    csrf_cookie: str = Cookie(None, alias=CSRF_COOKIE_NAME),
    request: Request = None
):
    # Разрешаем preflight OPTIONS без CSRF
    if request and request.method == "OPTIONS":
        return True
    # Для login/reg разрешаем отсутствие токена (первый запрос)
    if request and request.url.path in ["/api/login", "/api/reg"]:
        if not csrf_token or not csrf_cookie:
            return True
    if not csrf_token or not csrf_cookie:
        print("CSRF check failed: missing token or cookie")
        raise HTTPException(status_code=403, detail="CSRF token missing")
    if csrf_token != csrf_cookie:
        print("CSRF check failed: token mismatch")
        raise HTTPException(status_code=403, detail="CSRF token mismatch")
    if len(csrf_token) < 32:
        print("CSRF check failed: token too short")
        raise HTTPException(status_code=403, detail="Invalid CSRF token")
    return True

# Stateful CSRF: выдача токена и установка в httpOnly cookie
@app.get("/api/csrf-token")
def get_csrf_token(response: Response):
    token = secrets.token_urlsafe(32)
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=token,
        httponly=False,  # Фронт может прочитать токен
        # secure=True,   # НЕ нужно для localhost/dev
        # samesite="strict"  # НЕ нужно для localhost/dev
    )
    return {"csrf_token": token}

def get_device_id(request: Request) -> str:
    return request.headers.get('user-agent', 'unknown')

async def verify_token(authorization: Optional[str], request: Request):
    if not authorization or request is None:
        raise HTTPException(status_code=401, detail="Authorization header is missing or request not provided")
    try:
        # Поддержка форматов 'Bearer <token>' и просто '<token>'
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1]
        else:
            token = authorization.strip()
        if not token:
            print('verify_token error: empty token')
            raise HTTPException(status_code=401, detail="Token missing")
        device_id = get_device_id(request)
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
        if payload.get("device_id") != device_id:
            raise HTTPException(status_code=401, detail="Invalid device")
        user_data = get_user_id_by_token(token)  # возвращает user_id и is_admin
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_data
    except HTTPException as e:
        print('verify_token error:', e.detail)
        raise
    except Exception as e:
        print('verify_token error:', e)
        raise HTTPException(status_code=401, detail="Invalid token format")

# --- DEPENDS ДЛЯ FASTAPI ---
async def get_current_user(request: Request, authorization: str = Header(None)):
    return await verify_token(authorization, request)

@app.get("/api/user/{user_id}/profile", response_model=UserProfileResponse)
async def api_get_user_profile(
    user_id: int,
    user_data: dict = Depends(get_current_user)
):
    """
    Получает полную информацию о профиле пользователя по его ID
    Требуется авторизация
    Возвращает:
    - username: имя пользователя
    - is_admin: является ли администратором
    - status: статус пользователя
    - geolocation: местоположение
    - is_open_profile: открыт ли профиль
    - avatar: URL аватара
    - contact_email: контактный email
    - is_online: онлайн ли пользователь
    """
    try:
        profile = get_user_profile(user_id)
        if profile is None:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
            
        return profile

    except HTTPException:
        raise
    except Exception as e:
        print('Error:', e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@app.post("/api/get-user-id-by-token")
async def api_get_user_id_by_token(authorization: Optional[str] = Header(None)):
    """
    Получает ID пользователя по токену JWT
    Возвращает:
    - ID пользователя, если токен валиден
    - -1, если токен не найден
    - 401 ошибку, если токен не предоставлен
    """
    try:
        # Проверяем токен из заголовка Authorization (если есть)
        if authorization:
            try:
                auth_token = authorization.split(" ")[1]
                user_id = get_user_id_by_token(auth_token)
                if user_id is not None:
                    return user_id
            except Exception as e:
                print('Error in get-user-id-by-token:', e)
                pass
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    except HTTPException:
        raise
    except Exception as e:
        print('Error:', e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@app.get("/api/player/{user_id}/role-stats", response_model=RoleStatsResponse)
async def api_get_player_role_stats(
    user_id: int,
    user_data: dict = Depends(get_current_user)
):
    """
    Получает статистику игр по ролям для указанного пользователя
    Требуется авторизация
    """
    try:
        stats = get_player_games_by_role(user_id)
        if stats is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found or no games played"
            )
            
        return stats

    except Exception as e:
        print('Error:', e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@app.get("/api/player/{user_id}/win-stats", response_model=WinStatsListResponse)
async def api_get_player_win_stats(
    user_id: int,
    user_data: dict = Depends(get_current_user)
):
    """
    Получает статистику побед по ролям для указанного пользователя
    Требуется авторизация
    Возвращает список объектов с статистикой для каждой роли
    """
    try:
        stats = get_player_wins_by_role(user_id)
        if stats is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found or no games played"
            )
        
        # Преобразуем словарь в список объектов для ответа
        stats_list = [
            {"role": "peaceful", "games": stats["peaceful"]["games"], "wins": stats["peaceful"]["wins"]},
            {"role": "mafia", "games": stats["mafia"]["games"], "wins": stats["mafia"]["wins"]},
            {"role": "don", "games": stats["don"]["games"], "wins": stats["don"]["wins"]},
            {"role": "sheriff", "games": stats["sheriff"]["games"], "wins": stats["sheriff"]["wins"]},
            {"role": "lead", "games": stats["lead"]["games"], "wins": stats["lead"]["wins"]},
        ]
            
        return {"stats": stats_list}

    except Exception as e:
        print('Error:', e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@app.get("/api/player/{user_id}/stats")
async def api_get_player_full_stats(
    user_id: int,
    user_data: dict = Depends(get_current_user)
):
    """
    Получает полную статистику игрока (игры и победы по ролям)
    Требуется авторизация
    """
    try:
        # Получаем обе статистики
        role_stats = get_player_games_by_role(user_id)
        win_stats = get_player_wins_by_role(user_id)
        
        if role_stats is None or win_stats is None:
            raise HTTPException(
                status_code=404,
                detail="Player not found or no games played"
            )
        
        # Формируем ответ
        response = {
            "role_stats": role_stats,
            "win_stats": {
                "peaceful": win_stats["peaceful"],
                "mafia": win_stats["mafia"],
                "don": win_stats["don"],
                "sheriff": win_stats["sheriff"],
                "lead": win_stats["lead"],
            }
        }
            
        return response

    except Exception as e:
        print('Error:', e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

@app.post("/api/add-game")
async def api_add_game(
    game_data: GameData,
    user_data: dict = Depends(get_current_user),
    csrf_ok: bool = Depends(verify_csrf_token)
):
    if not user_data["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        success = add_game(
            date=game_data.date,
            winner=game_data.winner,
            table_number=game_data.table,
            game_number=game_data.game_number,
            participants=game_data.participants,
            lead_player_id=game_data.leadPlayerId,
            best_moves=game_data.bestMoves,
            players_data=[player.dict() for player in game_data.players]
        )
        if not success:
            raise HTTPException(status_code=500, detail="Database error")
        return {"status": "success", "game_id": None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search-players")
def api_search_players(
    req: SearchPlayersRequest,
    csrf_ok: bool = Depends(verify_csrf_token)
):
    try:
        data = search_players(req.query, limit=req.limit, offset=req.offset)
        if data is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Database error"}
            )
        return data
    except Exception as e:
        print('Error:', e)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

@app.post("/api/games-summary")
def api_games_summary(
    req: GamesRequest,
    csrf_ok: bool = Depends(verify_csrf_token)
):
    try:
        kwargs = {"offset": 0, "limit": 10000}
        if req.start_date:
            kwargs["start_date"] = req.start_date
        if req.end_date:
            kwargs["end_date"] = req.end_date
        games = get_games_filtered(**kwargs)
        return {"games": games}
    except Exception as e:
        print('Error:', e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/games")
def api_get_games(
    req: GamesRequest,
    csrf_ok: bool = Depends(verify_csrf_token)
):
    try:
        from datetime import datetime
        import calendar
        now = datetime.now()
        start_date = req.start_date
        end_date = req.end_date
        year = req.year
        month = req.month
        if year is not None or month is not None:
            y = year if year is not None else 2020
            m = month if month is not None else 1
            if year is None and month is not None:
                start_date = f"2020-{m:02d}-01"
                end_date = f"2100-{m:02d}-{calendar.monthrange(2100, m)[1]}"
            elif year is not None and month is None:
                start_date = f"{y}-01-01"
                end_date = f"{y}-12-31"
            elif year is not None and month is not None:
                start_date = f"{y}-{m:02d}-01"
                end_date = f"{y}-{m:02d}-{calendar.monthrange(y, m)[1]}"
        kwargs = {"offset": req.offset, "limit": req.limit}
        if start_date:
            kwargs["start_date"] = start_date
        if end_date:
            kwargs["end_date"] = end_date
        games = get_games_filtered(**kwargs)
        total = get_games_count(start_date=start_date, end_date=end_date)
        return {"games": games, "total": total}
    except Exception as e:
        print('Error:', e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/players")
def api_get_players(
    req: PlayersRequest,
    csrf_ok: bool = Depends(verify_csrf_token)
):
    try:
        data = get_players(limit=req.limit, offset=req.offset)
        if data is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Database error"}
            )
        return data
    except Exception as e:
        print('Error:', e)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

@app.get("/api/settings", response_model=RegistrationStatusResponse)
async def api_get_settings():
    """Получить текущие настройки (только флаг регистрации)"""
    settings = get_settings()
    if settings is None:
        raise HTTPException(status_code=500, detail="Settings not found")
    return {"is_open_reg": settings["is_open_reg"]}

@app.post("/api/settings/update")
async def api_update_settings(data: SettingsUpdateRequest, user_data: dict = Depends(get_current_user), csrf_ok: bool = Depends(verify_csrf_token)):
    """Изменить настройки (только для админа)"""
    if not user_data or not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    if data.is_open_reg is not None:
        set_registration_open(data.is_open_reg)
    if data.new_pin:
        set_pin(data.new_pin)
    return {"success": True}

@app.post("/api/settings/check-pin")
async def api_check_pin(data: PinCheckRequest, csrf_ok: bool = Depends(verify_csrf_token)):
    """Проверить пин-код (OTP) для dashboard"""
    if check_pin(data.pin):
        return {"success": True}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid pin")

# Функции для генерации токенов

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/api/login")
async def login_user(login_item: Entryclass, request: Request, response: Response):
    data = jsonable_encoder(login_item)
    login = data["username"]
    now = time.time()
    login_attempts[login] = [t for t in login_attempts[login] if now - t < BLOCK_TIME]
    csrf_token = None
    if len(login_attempts[login]) >= MAX_ATTEMPTS:
        return {'login_error': 'Слишком много попыток входа. Попробуйте позже.', 'csrf_token': None}
    try: 
        if check_logpas(data["username"], data["password"]):
            login_attempts[login] = []
            device_id = get_device_id(request)
            payload = data.copy()
            payload["exp"] = int((datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp())
            payload["device_id"] = device_id
            encoded_jwt = create_access_token(payload)
            update_jwt(data["username"], encoded_jwt)
            # Генерируем refresh-токен и ставим в cookie
            user = get_user_id_by_token(encoded_jwt)
            user_id = user["user_id"] if user else None
            refresh_token = create_refresh_token({"user_id": user_id})
            response.set_cookie(
                key=REFRESH_TOKEN_COOKIE_NAME,
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="strict",
                max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
            )
            # Генерируем CSRF-токен
            csrf_token = secrets.token_urlsafe(32)
            response.set_cookie(
                key=CSRF_COOKIE_NAME,
                value=csrf_token,
                httponly=False,  # Фронт может прочитать токен
                # secure=True,   # НЕ нужно для localhost/dev
                # samesite="strict"  # НЕ нужно для localhost/dev
            )
            return {'token': encoded_jwt, 'csrf_token': csrf_token}
        else:
            login_attempts[login].append(now)
            return {'login_error': 'Неверный логин или пароль', 'csrf_token': None}
    except Exception as e:
        if DEBUG:
            import traceback
            print('login error:', e)
            traceback.print_exc()
        return {'login_error': 'Ошибка сервера', 'csrf_token': None}

@app.post("/api/reg")
async def check_reg(data: Regclass, request: Request, response: Response):
    settings = get_settings()
    if settings and not settings["is_open_reg"]:
        raise HTTPException(status_code=403, detail="Регистрация временно закрыта администратором")
    reg = jsonable_encoder(data)
    csrf_token = None
    try:
        email    = reg["email"]
        login    = reg["username"]
        password = reg["password"]
        check = check_login(email, login)
        if check == -1:
            return {
                "reg_error": { "Несуществующая почта!" },
                "csrf_token": None
            }
        elif check == -3:
            return {
                "reg_error": { "Такой логин уже используется!" },
                "csrf_token": None
            }
        elif check == -2:
            return {
                "reg_error": { "Такая почта уже используется!" },
                "csrf_token": None
            }
        else:
            data = jsonable_encoder(data)
            device_id = get_device_id(request)
            payload = data.copy()
            payload["exp"] = int((datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp())
            payload["device_id"] = device_id
            encoded_jwt = create_access_token(payload)
            hashed_password = hash_password(password)
            add_logpas(email, login, hashed_password, encoded_jwt)
            # Генерируем refresh-токен и ставим в cookie
            user_id = get_user_id_by_token(encoded_jwt)[0] if get_user_id_by_token(encoded_jwt) else None
            refresh_token = create_refresh_token({"user_id": user_id})
            response.set_cookie(
                key=REFRESH_TOKEN_COOKIE_NAME,
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="strict",
                max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
            )
            # Генерируем CSRF-токен
            csrf_token = secrets.token_urlsafe(32)
            response.set_cookie(
                key=CSRF_COOKIE_NAME,
                value=csrf_token,
                httponly=False,  # Фронт может прочитать токен
                # secure=True,   # НЕ нужно для localhost/dev
                # samesite="strict"  # НЕ нужно для localhost/dev
            )
    except Exception as e:
        if DEBUG:
            print('Приём рег данных: ', e)
        return {
            "reg_error": { "Ошибка входа." },
            "csrf_token": None
        }
    return {
        "reg": { "Зарегистрирован!" },
        "token": encoded_jwt,
        "csrf_token": csrf_token
    }

@app.post("/api/tokencheck")
async def token_check(token: str = Body(..., media_type="text/plain")):
    token = json.loads(token)
    try:
        if check_token(token["auth"]):
            print('good')
            return {'login_result': 'good' }
        else:
            return {'login_error': 'Несуществующий токен.'}
    except Exception as e:
        print('login error:', e)

@app.post("/api/add-user")
async def api_add_user(data: AddUserRequest, csrf_ok: bool = Depends(verify_csrf_token)):
    check = check_login(data.email, data.username)
    if check == -2:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    if check == -3:
        raise HTTPException(status_code=400, detail="Username уже зарегистрирован")
    if check != True:
        raise HTTPException(status_code=400, detail="Некорректные данные")
    hashed_password = hash_password(data.password)
    add_logpas(data.email, data.username, hashed_password, jwt=None)

    # Получаем user_id только что созданного пользователя
    try:
        cnx = get_user_profile.__globals__["mysql"].connector.connect(
            user=get_user_profile.__globals__["username"],
            password=get_user_profile.__globals__["password"],
            host=get_user_profile.__globals__["host"],
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)
        cursor.execute("SELECT id FROM users WHERE login = %s", (data.email,))
        user_id = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения user_id: {e}")

    # Создание профиля с поддержкой кастомных данных
    profile_data = data.profile or {}
    status = sanitize_string(profile_data.get("status", "Игрок"))
    geolocation = sanitize_string(profile_data.get("geolocation", "Россия"))
    is_open_profile = profile_data.get("is_open_profile", 1)
    avatar = sanitize_string(profile_data.get("avatar", "https://github.com/shadcn.png"))
    contact_email = sanitize_string(profile_data.get("contact_email")) if profile_data.get("contact_email") else None
    is_online = 0
    profile_created = add_profile(
        user_id,
        status=status,
        geolocation=geolocation,
        is_open_profile=is_open_profile,
        avatar=avatar,
        contact_email=contact_email,
        is_online=is_online
    )
    if not profile_created:
        raise HTTPException(status_code=500, detail="Ошибка создания профиля")

    return {"status": "success", "user_id": user_id}

@app.post("/api/refresh-token")
def refresh_token(response: Response, refresh_token: str = Cookie(None, alias=REFRESH_TOKEN_COOKIE_NAME)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token type")
        user_id = payload.get("user_id")
        # Можно добавить дополнительные проверки (например, в БД)
        # Генерируем новый access-токен
        new_access_token = create_access_token({"user_id": user_id})
        return {"token": new_access_token}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@app.patch("/api/game/{game_id}")
async def api_update_game(
    game_id: int,
    data: UpdateGameRequest,
    user_data: dict = Depends(get_current_user),
    csrf_ok: bool = Depends(verify_csrf_token)
):
    if not user_data["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    ok = update_game(
        game_id=game_id,
        winner=data.winner,
        table_number=data.table_number,
        game_number=data.game_number,
        lead_player_id=data.lead_player_id,
        best_moves=data.best_moves,
        players_data=[p.dict() for p in data.players] if data.players else None
    )
    if not ok:
        raise HTTPException(status_code=500, detail="Database error")
    return {"status": "success"}

@app.post("/api/games-summary-strict")
def api_games_summary_strict(
    req: GamesRequest,
    csrf_ok: bool = Depends(verify_csrf_token)
):
    try:
        games = get_games_summary_strict(start_date=req.start_date, end_date=req.end_date)
        return {"games": games}
    except Exception as e:
        print('Error:', e)
        raise HTTPException(status_code=500, detail="Internal server error")

