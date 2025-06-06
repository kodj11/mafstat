from dbase_setup.auto import auto_main
import mysql.connector
import hashlib
import re
import bcrypt

host, username, password = auto_main()

def get_user_profile(user_id, host=host, username=username, password=password):
    """
    Получает данные профиля пользователя по его ID
    Возвращает словарь с данными пользователя или None в случае ошибки
    """
    try:
        # Подключение к базе данных
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host,
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)

        # SQL-запрос для получения данных пользователя
        query = """
            SELECT 
                u.username,
                u.is_admin,
                p.status,
                p.geolocation,
                p.is_open_profile,
                p.avatar,
                p.contact_email,
                p.is_online
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = %s
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            # Формируем словарь с данными пользователя
            user_profile = {
                "username": result[0],
                "is_admin": bool(result[1]),
                "status": result[2],
                "geolocation": result[3],
                "is_open_profile": bool(result[4]),
                "avatar": result[5],
                "contact_email": result[6],
                "is_online": bool(result[7])
            }
            return user_profile
        else:
            return None  # Пользователь не найден

    except Exception as e:
        print("Database error:", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def get_user_id_by_token(token, host=host, username=username, password=password):
    """Получает данные пользователя по токену, включая is_admin"""
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)
        query = """
            SELECT u.id, u.is_admin 
            FROM users u 
            WHERE u.jwt = %s
        """
        cursor.execute(query, (token,))
        result = cursor.fetchone()
        return {"user_id": result[0], "is_admin": bool(result[1])} if result else None
    except Exception as e:
        print("Database error:", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def get_player_games_by_role(user_id, host=host, username=username, password=password):
    """
    Получает количество игр пользователя для каждой роли
    Возвращает словарь с количеством игр по ролям
    """
    try:
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host,
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)

        query = """
            SELECT 
                role,
                COUNT(*) as games_count
            FROM game_players
            WHERE user_id = %s
            GROUP BY role
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()

        # Создаем словарь с нулевыми значениями для всех возможных ролей
        roles_stats = {
            'peaceful': 0,
            'mafia': 0,
            'don': 0,
            'sheriff': 0,
            'lead': 0
        }

        # Заполняем словарь данными из запроса
        for role, count in result:
            roles_stats[role] = count

        return roles_stats

    except Exception as e:
        print("Database error:", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()


def get_player_wins_by_role(user_id, host=host, username=username, password=password):
    """
    Получает статистику побед пользователя для каждой роли
    Возвращает словарь с количеством побед и общим количеством игр по ролям
    """
    try:
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host,
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)

        query = """
            SELECT 
                gp.role,
                COUNT(*) as total_games,
                SUM(CASE WHEN g.winner = gp.role OR 
                          (gp.role IN ('mafia', 'don') AND g.winner = 'mafia') OR
                          (gp.role IN ('peaceful', 'sheriff', 'lead') AND g.winner = 'peaceful')
                     THEN 1 ELSE 0 END) as wins_count
            FROM game_players gp
            JOIN games g ON gp.game_id = g.game_id
            WHERE gp.user_id = %s
            GROUP BY gp.role
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchall()

        # Создаем словарь с нулевыми значениями для всех возможных ролей
        wins_stats = {
            'peaceful': {'games': 0, 'wins': 0},
            'mafia': {'games': 0, 'wins': 0},
            'don': {'games': 0, 'wins': 0},
            'sheriff': {'games': 0, 'wins': 0},
            'lead': {'games': 0, 'wins': 0}
        }

        # Заполняем словарь данными из запроса
        for role, total_games, wins in result:
            wins_stats[role] = {
                'games': total_games,
                'wins': wins
            }

        return wins_stats

    except Exception as e:
        print("Database error:", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def add_game(date, winner: str, table_number: int, game_number: int, participants: list, lead_player_id: int, best_moves: list, players_data: list, host=host, username=username, password=password):
    try:
        # Проверка корректности winner
        if winner not in ('mafia', 'peaceful'):
            raise ValueError("Invalid winner value")
        
        # Проверка table_number (0 < table_number < 10)
        if not (0 < table_number < 10):
            raise ValueError("table_number must be between 1 and 9")
        
        # Проверка game_number (0 < game_number < 50)
        if not (0 < game_number < 50):
            raise ValueError("game_number must be between 1 and 49")
        
        # Проверка участников
        if not isinstance(players_data, list) or len(players_data) != 10:
            raise ValueError("Invalid players data")

        # Проверка ролей
        valid_roles = {'peaceful', 'mafia', 'don', 'sheriff', 'lead'}
        for player in players_data:
            if player.get("role") not in valid_roles:
                raise ValueError(f"Invalid role: {player.get('role')}")
            
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host,
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)

        # 1. Добавляем игру с table_number и game_number
        insert_game_query = """
            INSERT INTO games (game_date, winner, table_number, game_number)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_game_query, (date, winner, table_number, game_number))
        game_id = cursor.lastrowid

        # 2. Обрабатываем участников
        first_killed_player = None
        mafia_count = 0

        # Считаем количество мафий в лучших ходах
        valid_moves = [move for move in best_moves if move is not None and 1 <= move <= 10]
        for move in valid_moves:
            player_idx = move - 1
            if player_idx < len(players_data):
                role = players_data[player_idx].get("role", "peaceful")
                if role in ["mafia", "don"]:
                    mafia_count += 1

        killed_first_added = False  # Флаг для отслеживания первого убитого

        for player in players_data:
            # 3. Вставляем игрока
            insert_player_query = """
                INSERT INTO game_players (game_id, user_id, role)
                VALUES (%s, %s, %s)
            """
            cursor.execute(insert_player_query, (
                game_id,
                player["id"],
                player.get("role", "peaceful")
            ))
            game_player_id = cursor.lastrowid

            # 4. Обработка убитых первыми (только первого в игре)
            if player.get("killedFirst", False) and not killed_first_added:
                insert_killed_first = """
                    INSERT INTO killed_first (game_id, user_id)
                    VALUES (%s, %s)
                """
                cursor.execute(insert_killed_first, (game_id, player["id"]))
                killed_first_added = True

            # 5. Обработка доп. баллов
            additional_points = player.get("additionalPoints", 0)
            killed_first = player.get("killedFirst", False)

            # Автоматическое назначение баллов за убийство первого
            if killed_first and additional_points == 0 and killed_first_added:
                if mafia_count == 2:
                    additional_points = 0.25
                elif mafia_count >= 3:
                    additional_points = 0.5

            if additional_points != 0:
                insert_points_query = """
                    INSERT INTO additional_points (game_player_id, points)
                    VALUES (%s, %s)
                """
                cursor.execute(insert_points_query, (game_player_id, additional_points))

        # 6. Добавляем ведущего
        if lead_player_id:
            insert_lead_query = """
                INSERT INTO game_players (game_id, user_id, role)
                VALUES (%s, %s, 'lead')
            """
            cursor.execute(insert_lead_query, (game_id, lead_player_id))

        # 7. Сохраняем лучшие ходы (исправленная версия)
        if best_moves:
            # Получаем killed_first_id для этой игры
            cursor.execute("SELECT killed_first_id FROM killed_first WHERE game_id = %s", (game_id,))
            killed_first_id = cursor.fetchone()[0] if cursor.rowcount > 0 else None
            insert_best_moves_query = """
                INSERT INTO best_move (killed_first_id, user_id)
                VALUES (%s, %s)
            """
            # Для каждого лучшего хода (номера игрока 1-10)
            for move_number in best_moves:
                if move_number is None or not (1 <= move_number <= 10):
                    continue

                # Находим user_id выбранного игрока
                player_idx = move_number - 1
                if player_idx >= len(players_data):
                    continue

                user_id = players_data[player_idx].get("id")
                if user_id:
                    cursor.execute(insert_best_moves_query, (killed_first_id, user_id))

        cnx.commit()
        return True

    except Exception as e:
        print("Database error:", e)
        cnx.rollback()
        return False
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def search_players(query, limit=30, offset=0, host=host, username=username, password=password):
    try:
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host,
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)

        # Получаем общее количество совпавших пользователей
        count_query = """
            SELECT COUNT(*) FROM users WHERE username LIKE %s
        """
        cursor.execute(count_query, (f"%{query}%",))
        total = cursor.fetchone()[0]

        # Основной запрос с JOIN профиля и подсчетом игр
        sql = """
            SELECT 
                u.id,
                u.login,
                u.username,
                u.is_admin,
                u.created_at,
                p.status,
                p.geolocation,
                p.is_open_profile,
                p.avatar,
                p.contact_email,
                p.is_online,
                COUNT(gp.game_id) AS games_played
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN game_players gp ON u.id = gp.user_id
            WHERE u.username LIKE %s
            GROUP BY u.id
            ORDER BY u.username ASC
            LIMIT %s OFFSET %s
        """
        cursor.execute(sql, (f"%{query}%", limit, offset))
        result = cursor.fetchall()
        columns = [
            'id', 'login', 'username', 'is_admin', 'created_at',
            'status', 'geolocation', 'is_open_profile', 'avatar',
            'contact_email', 'is_online', 'games_played'
        ]
        players = [dict(zip(columns, row)) for row in result]
        return {"players": players, "total": total}
    except Exception as e:
        print("Database error (search_players):", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def get_games(host=host, username=username, password=password):
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)

        query = """
            SELECT
                g.game_id,
                g.game_date,
                g.winner,
                g.table_number,
                g.game_number,
                u.id AS user_id,
                u.username AS nickname,
                gp.role,
                SUM(CASE
                    WHEN (g.winner = 'mafia' AND gp.role IN ('mafia', 'don')) OR
                         (g.winner = 'peaceful' AND gp.role IN ('peaceful', 'sheriff', 'lead')) THEN 1
                    ELSE 0
                END) AS base_score,
                COALESCE(SUM(ap.points), 0) AS additional_points,
                CASE WHEN gp.role = 'lead' THEN TRUE ELSE FALSE END AS is_lead,
                kf_outer.user_id AS killed_first_player_id_in_game,
                (SELECT GROUP_CONCAT(u_bm.username SEPARATOR ', ')
                 FROM best_move bm
                 JOIN users u_bm ON bm.user_id = u_bm.id
                 WHERE bm.killed_first_id = kf_outer.killed_first_id
                ) AS best_movers_nicknames
            FROM games g
            LEFT JOIN game_players gp ON g.game_id = gp.game_id
            LEFT JOIN users u ON gp.user_id = u.id
            LEFT JOIN additional_points ap ON gp.game_player_id = ap.game_player_id
            LEFT JOIN killed_first kf_outer ON g.game_id = kf_outer.game_id
            GROUP BY 
                g.game_id, g.game_date, g.winner, g.table_number, g.game_number, 
                u.id, u.username, gp.role, 
                kf_outer.user_id, kf_outer.killed_first_id -- kf_outer.killed_first_id нужен для подзапроса
            ORDER BY g.game_id DESC, g.game_date DESC, u.id;
        """
        cursor.execute(query)
        results = cursor.fetchall()
        games_dict = {}

        for row in results:
            game_id = row[0]
            game_date = row[1]
            winner = row[2]
            table_number = row[3]
            game_number = row[4]
            player_user_id = row[5]
            nickname = row[6]
            role = row[7]
            base_score = float(row[8])
            additional_points = float(row[9]) if row[9] is not None else 0.0
            is_lead = row[10]
            killed_first_player_id_for_game = row[11] 
            best_movers_nicknames_str = row[12]

            score = base_score + additional_points

            if game_id not in games_dict:
                games_dict[game_id] = {
                    "game_id": game_id,
                    "game_date": game_date.strftime("%Y-%m-%d %H:%M:%S") if game_date else None,
                    "winner": winner,
                    "table_number": table_number,
                    "game_number": game_number,
                    "players": [],
                    "best_movers": best_movers_nicknames_str.split(', ') if best_movers_nicknames_str else [],
                    "killed_first_player_id_for_game": killed_first_player_id_for_game
                }
            
            is_killed_first_flag = (player_user_id == games_dict[game_id]["killed_first_player_id_for_game"]) \
                                   if games_dict[game_id]["killed_first_player_id_for_game"] is not None else False

            # Форматируем additional_points: округляем до 2 знаков, убираем лишний 0, если есть
            def format_points(val):
                if val is None or abs(val) < 1e-8:
                    return None
                val = round(val + 1e-8, 2)  # защита от плавающей точки
                s = ("%.2f" % val).rstrip('0').rstrip('.')
                return float(s) if '.' in s else int(s)
            games_dict[game_id]["players"].append({
                "id": player_user_id,
                "nickname": nickname,
                "role": role,
                "score": round(score, 2),
                "is_lead": is_lead,
                "is_killed_first": is_killed_first_flag,
                "additional_points": format_points(additional_points)
            })
        
        for game_obj in games_dict.values():
            if "killed_first_player_id_for_game" in game_obj:
                del game_obj["killed_first_player_id_for_game"]

        games_list = list(games_dict.values())
        return games_list

    except Exception as e:
        print("Database error (get_games):", e)
        return None
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'cnx' in locals() and cnx: cnx.close()

def get_players(limit=30, offset=0, host=host, username=username, password=password):
    """
    Возвращает список пользователей с полной информацией профиля, отсортированных по username (алфавиту), с пагинацией.
    Также возвращает общее количество пользователей (total).
    """
    try:
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host,
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)

        # Получаем общее количество пользователей
        cursor.execute("SELECT COUNT(*) FROM users")
        total = cursor.fetchone()[0]

        # Основной запрос с JOIN профиля и подсчетом игр
        query = """
            SELECT 
                u.id,
                u.login,
                u.username,
                u.is_admin,
                u.created_at,
                p.status,
                p.geolocation,
                p.is_open_profile,
                p.avatar,
                p.contact_email,
                p.is_online,
                COUNT(gp.game_id) AS games_played
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN game_players gp ON u.id = gp.user_id
            GROUP BY u.id
            ORDER BY u.username ASC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, (limit, offset))
        result = cursor.fetchall()

        columns = [
            'id', 'login', 'username', 'is_admin', 'created_at',
            'status', 'geolocation', 'is_open_profile', 'avatar',
            'contact_email', 'is_online', 'games_played'
        ]
        players = [dict(zip(columns, row)) for row in result]

        return {"players": players, "total": total}

    except Exception as e:
        print("Database error:", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()


def is_valid_email(login):
    regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
    if re.fullmatch(regex, login) == 'None' or re.fullmatch(regex, login) == None:
        return 0
    else:
        return 1

def check_login(login, login_username, host=host, username=username, password=password):
    if not is_valid_email(login):
        return -1
    # Подключение к базе данных
    cnx = mysql.connector.connect(
        user=username,
        password=password,
        host=host
    )
    cursor = cnx.cursor(buffered=True)
    
    # Переключение на БД мафии
    cursor.execute("USE mafia;")
    
    # Проверяем, есть ли такая почта в базе данных
    cursor.execute("SELECT * FROM users WHERE login = %s;", (login,))
    # Получаем результат запроса
    result = cursor.fetchone()
    # Если результат не пустой, значит почта уже существует
    if result:
        cursor.close()
        cnx.close()
        return -2 # запрещаем регистрацию
    else:
        # Проверяем, есть ли такой логин в базе данных
        cursor.execute("SELECT * FROM users WHERE username = %s;", (login_username,))
        # Получаем результат запроса
        result = cursor.fetchone()
        # Если результат не пустой, значит почта уже существует
        if result:
            cursor.close()
            cnx.close()
            return -3 # запрещаем регистрацию
        else:
            cursor.close()
            cnx.close()
            return True
    

def check_logpas(login, login_password, host=host, username=username, password=password):
    cnx = mysql.connector.connect(
        user=username,
        password=password,
        host=host
    )
    cursor = cnx.cursor(buffered=True)
    cursor.execute("USE mafia;")
    cursor.execute("SELECT password FROM users WHERE login = %s OR username = %s", (login, login))
    result = cursor.fetchone()
    cursor.close()
    cnx.close()
    if result:
        stored_hash = result[0]
        return bcrypt.checkpw(login_password.encode('utf-8'), stored_hash.encode('utf-8'))
    return False

def add_logpas(login, login_username, login_password, jwt, host=host, username=username, password=password):
    cnx = mysql.connector.connect(
        user=username,
        password=password,
        host=host
    )
    cursor = cnx.cursor(buffered=True)
    cursor.execute("USE mafia;")
    password_hash = bcrypt.hashpw(login_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute("INSERT INTO users (login, username, password, jwt) VALUES (%s, %s, %s, %s)", (login, login_username, password_hash, jwt))
    cnx.commit()
    cursor.close()
    cnx.close()
    return True

def update_jwt(login, jwt):
    # Подключение к базе данных
    cnx = mysql.connector.connect(
        user=username,
        password=password,
        host=host
    )
    cursor = cnx.cursor(buffered=True)
    
    # Переключение на БД мафии
    cursor.execute("USE mafia;")

    cursor.execute("UPDATE users SET jwt = %s WHERE login = %s OR username = %s", (jwt, login, login))
    cnx.commit()

    # Закрываем курсор и соединение
    cursor.close()
    cnx.close()

    return True

def check_jwt(login):
    # Подключение к базе данных
    cnx = mysql.connector.connect(
        user=username,
        password=password,
        host=host
    )
    cursor = cnx.cursor(buffered=True)
    
    # Переключение на БД мафии
    cursor.execute("USE mafia;")

    cursor.execute("SELECT jwt FROM users WHERE login = %s OR username = %s", (login, login))
    
    result = cursor.fetchone()
    
    # Закрываем курсор и соединение
    cursor.close()
    cnx.close()
    if result:
        return result[0]
    else:
        return False

def check_token(token):
    # Подключение к базе данных
    cnx = mysql.connector.connect(
        user=username,
        password=password,
        host=host
    )
    cursor = cnx.cursor(buffered=True)
    
    # Переключение на БД мафии
    cursor.execute("USE mafia;")
    print('let check')
    cursor.execute("SELECT username FROM users WHERE jwt = %s", (token,))
    result = cursor.fetchone()
    print('res: ', result) 
    # Закрываем курсор и соединение
    cursor.close()
    cnx.close()
    
    if result:
        return True
    else:
        return False

def get_games_filtered(start_date=None, end_date=None, offset=0, limit=30, host=host, username=username, password=password):
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)

        filters = []
        params = []
        # Если фильтруем по дате, сравниваем только дату (без времени)
        if start_date:
            filters.append("DATE(g.game_date) >= %s")
            params.append(start_date)
        if end_date:
            filters.append("DATE(g.game_date) <= %s")
            params.append(end_date)
        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

        # 1. Получаем game_id с лимитом и смещением
        cursor.execute(
            f"""
            SELECT g.game_id
            FROM games g
            JOIN game_players gp ON g.game_id = gp.game_id AND gp.role != 'lead'
            {where_clause}
            GROUP BY g.game_id
            HAVING COUNT(*) >= 10
            ORDER BY g.game_id DESC, MAX(g.game_date) DESC
            LIMIT %s OFFSET %s
            """, tuple(params + [limit, offset])
        )
        game_ids = [row[0] for row in cursor.fetchall()]
        if not game_ids:
            return []

        # 2. Получаем все данные по этим game_id
        format_strings = ','.join(['%s'] * len(game_ids))
        query = f"""
            SELECT
                g.game_id,
                g.game_date,
                g.winner,
                g.table_number,
                g.game_number,
                u.id AS user_id,
                u.username AS nickname,
                gp.role,
                SUM(CASE
                    WHEN (g.winner = 'mafia' AND gp.role IN ('mafia', 'don')) OR
                         (g.winner = 'peaceful' AND gp.role IN ('peaceful', 'sheriff', 'lead')) THEN 1
                    ELSE 0
                END) AS base_score,
                COALESCE(SUM(ap.points), 0) AS additional_points,
                CASE WHEN gp.role = 'lead' THEN TRUE ELSE FALSE END AS is_lead,
                kf_outer.user_id AS killed_first_player_id_in_game,
                (SELECT GROUP_CONCAT(u_bm.username SEPARATOR ', ')
                 FROM best_move bm
                 JOIN users u_bm ON bm.user_id = u_bm.id
                 WHERE bm.killed_first_id = kf_outer.killed_first_id
                ) AS best_movers_nicknames
            FROM games g
            LEFT JOIN game_players gp ON g.game_id = gp.game_id
            LEFT JOIN users u ON gp.user_id = u.id
            LEFT JOIN additional_points ap ON gp.game_player_id = ap.game_player_id
            LEFT JOIN killed_first kf_outer ON g.game_id = kf_outer.game_id
            WHERE g.game_id IN ({format_strings})
            GROUP BY 
                g.game_id, g.game_date, g.winner, g.table_number, g.game_number, 
                u.id, u.username, gp.role, 
                kf_outer.user_id, kf_outer.killed_first_id
            ORDER BY g.game_id DESC, g.game_date DESC, u.id
        """
        cursor.execute(query, tuple(game_ids))
        results = cursor.fetchall()
        games_dict = {}

        for row in results:
            game_id = row[0]
            game_date = row[1]
            winner = row[2]
            table_number = row[3]
            game_number = row[4]
            player_user_id = row[5]
            nickname = row[6]
            role = row[7]
            base_score = float(row[8])
            additional_points = float(row[9]) if row[9] is not None else 0.0
            is_lead = row[10]
            killed_first_player_id_for_game = row[11] 
            best_movers_nicknames_str = row[12]

            score = base_score + additional_points

            if game_id not in games_dict:
                games_dict[game_id] = {
                    "game_id": game_id,
                    "game_date": game_date.strftime("%Y-%m-%d %H:%M:%S") if game_date else None,
                    "winner": winner,
                    "table_number": table_number,
                    "game_number": game_number,
                    "players": [],
                    "best_movers": best_movers_nicknames_str.split(', ') if best_movers_nicknames_str else [],
                    "killed_first_player_id_for_game": killed_first_player_id_for_game
                }
            is_killed_first_flag = (player_user_id == games_dict[game_id]["killed_first_player_id_for_game"]) \
                                   if games_dict[game_id]["killed_first_player_id_for_game"] is not None else False
            # Форматируем additional_points: округляем до 2 знаков, убираем лишний 0, если есть
            def format_points(val):
                if val is None or abs(val) < 1e-8:
                    return None
                val = round(val + 1e-8, 2)  # защита от плавающей точки
                s = ("%.2f" % val).rstrip('0').rstrip('.')
                return float(s) if '.' in s else int(s)
            games_dict[game_id]["players"].append({
                "id": player_user_id,
                "nickname": nickname,
                "role": role,
                "score": round(score, 2),
                "is_lead": is_lead,
                "is_killed_first": is_killed_first_flag,
                "additional_points": format_points(additional_points)
            })
        for game_obj in games_dict.values():
            if "killed_first_player_id_for_game" in game_obj:
                del game_obj["killed_first_player_id_for_game"]
        games_list = list(games_dict.values())
        return games_list
    except Exception as e:
        print("Database error (get_games_filtered):", e)
        return None
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'cnx' in locals() and cnx: cnx.close()

def get_games_count(start_date=None, end_date=None, host=host, username=username, password=password):
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)
        filters = []
        params = []
        if start_date:
            filters.append("game_date >= %s")
            params.append(start_date)
        if end_date:
            filters.append("game_date <= %s")
            params.append(end_date)
        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        query = f"SELECT COUNT(*) FROM games {where_clause};"
        cursor.execute(query, tuple(params))
        count = cursor.fetchone()[0]
        return count
    except Exception as e:
        print("Database error (get_games_count):", e)
        return 0
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'cnx' in locals() and cnx: cnx.close()

def add_profile(user_id, status="Игрок", geolocation="Россия", is_open_profile=1, avatar="https://github.com/shadcn.png", contact_email=None, is_online=0, host=host, username=username, password=password):
    """
    Создаёт профиль пользователя с дефолтными значениями
    """
    try:
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host,
            database="mafia"
        )
        cursor = cnx.cursor(buffered=True)
        insert_query = """
            INSERT INTO profiles (user_id, status, geolocation, is_open_profile, avatar, contact_email, is_online)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (user_id, status, geolocation, is_open_profile, avatar, contact_email, is_online))
        cnx.commit()
        return True
    except Exception as e:
        print("Database error (add_profile):", e)
        return False
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def get_settings(host=host, username=username, password=password):
    """Получить текущие настройки (is_open_reg, pin)"""
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)
        cursor.execute("SELECT is_open_reg, pin FROM settings WHERE id=1")
        row = cursor.fetchone()
        if row:
            return {"is_open_reg": bool(row[0]), "pin": row[1]}
        return None
    except Exception as e:
        print("Database error (get_settings):", e)
        return None
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def set_registration_open(is_open, host=host, username=username, password=password):
    """Изменить флаг открыта ли регистрация"""
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor()
        cursor.execute("UPDATE settings SET is_open_reg=%s WHERE id=1", (int(is_open),))
        cnx.commit()
        return True
    except Exception as e:
        print("Database error (set_registration_open):", e)
        return False
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def set_pin(new_pin, host=host, username=username, password=password):
    """Изменить пин-код для dashboard (хранить в виде хэша)"""
    try:
        hashed_pin = bcrypt.hashpw(new_pin.encode(), bcrypt.gensalt()).decode()
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor()
        cursor.execute("UPDATE settings SET pin=%s WHERE id=1", (hashed_pin,))
        cnx.commit()
        return True
    except Exception as e:
        print("Database error (set_pin):", e)
        return False
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def check_pin(pin, host=host, username=username, password=password):
    """Проверить пин-код (OTP) для dashboard"""
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)
        cursor.execute("SELECT pin FROM settings WHERE id=1")
        row = cursor.fetchone()
        if row and row[0]:
            return bcrypt.checkpw(pin.encode(), row[0].encode())
        return False
    except Exception as e:
        print("Database error (check_pin):", e)
        return False
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def update_game(game_id, winner=None, table_number=None, game_number=None, lead_player_id=None, best_moves=None, players_data=None, host=host, username=username, password=password):
    """
    Обновляет данные игры: победителя, ведущего, лучшие ходы, игроков (роль, дополнительные баллы), номер стола и номер игры.
    """
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)

        # 1. Обновляем основные поля игры
        update_fields = []
        params = []
        if winner is not None:
            update_fields.append("winner = %s")
            params.append(winner)
        if table_number is not None:
            update_fields.append("table_number = %s")
            params.append(table_number)
        if game_number is not None:
            update_fields.append("game_number = %s")
            params.append(game_number)
        if update_fields:
            cursor.execute(f"UPDATE games SET {', '.join(update_fields)} WHERE game_id = %s", tuple(params + [game_id]))

        # 2. Обновляем ведущего
        if lead_player_id is not None:
            # Удаляем старого ведущего
            cursor.execute("DELETE FROM game_players WHERE game_id = %s AND role = 'lead'", (game_id,))
            # Добавляем нового ведущего
            cursor.execute("INSERT INTO game_players (game_id, user_id, role) VALUES (%s, %s, 'lead')", (game_id, lead_player_id))

        # 3. Обновляем игроков (роль, дополнительные баллы)
        if players_data is not None:
            # Получаем соответствие user_id -> game_player_id
            cursor.execute("SELECT game_player_id, user_id FROM game_players WHERE game_id = %s AND role != 'lead'", (game_id,))
            id_map = {row[1]: row[0] for row in cursor.fetchall()}
            for player in players_data:
                user_id = player.get("user_id") or player.get("id")
                role = player.get("role")
                additional_points = player.get("additional_points")
                if user_id not in id_map:
                    continue
                game_player_id = id_map[user_id]
                if role:
                    cursor.execute("UPDATE game_players SET role = %s WHERE game_player_id = %s", (role, game_player_id))
                # Обновляем дополнительные баллы
                cursor.execute("DELETE FROM additional_points WHERE game_player_id = %s", (game_player_id,))
                if additional_points is not None:
                    try:
                        val = float(additional_points)
                        if abs(val) > 1e-8:
                            cursor.execute("INSERT INTO additional_points (game_player_id, points) VALUES (%s, %s)", (game_player_id, val))
                    except Exception:
                        pass

        # 4. Обновляем лучшие ходы
        if best_moves is not None:
            # Удаляем старые лучшие ходы
            cursor.execute("SELECT killed_first_id FROM killed_first WHERE game_id = %s", (game_id,))
            row = cursor.fetchone()
            killed_first_id = row[0] if row else None
            if killed_first_id:
                cursor.execute("DELETE FROM best_move WHERE killed_first_id = %s", (killed_first_id,))
                for user_id in best_moves:
                    if user_id:
                        cursor.execute("INSERT INTO best_move (killed_first_id, user_id) VALUES (%s, %s)", (killed_first_id, user_id))

        cnx.commit()
        return True
    except Exception as e:
        print("Database error (update_game):", e)
        cnx.rollback()
        return False
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'cnx' in locals(): cnx.close()

def get_games_summary_strict(start_date=None, end_date=None, host=host, username=username, password=password):
    try:
        cnx = mysql.connector.connect(user=username, password=password, host=host, database="mafia")
        cursor = cnx.cursor(buffered=True)
        filters = []
        params = []
        if start_date:
            filters.append("DATE(g.game_date) >= %s")
            params.append(start_date)
        if end_date:
            filters.append("DATE(g.game_date) <= %s")
            params.append(end_date)
        where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
        # Получаем game_id, где ровно 10 игроков (без ведущего)
        cursor.execute(f'''
            SELECT g.game_id
            FROM games g
            JOIN game_players gp ON g.game_id = gp.game_id
            WHERE gp.role != 'lead' {('AND ' + ' AND '.join(filters)) if filters else ''}
            GROUP BY g.game_id
            HAVING COUNT(*) = 10
        ''', tuple(params))
        game_ids = [row[0] for row in cursor.fetchall()]
        if not game_ids:
            return []
        format_strings = ','.join(['%s'] * len(game_ids))
        query = f'''
            SELECT
                g.game_id,
                g.game_date,
                g.winner,
                g.table_number,
                g.game_number,
                u.id AS user_id,
                u.username AS nickname,
                gp.role,
                SUM(CASE
                    WHEN (g.winner = 'mafia' AND gp.role IN ('mafia', 'don')) OR
                         (g.winner = 'peaceful' AND gp.role IN ('peaceful', 'sheriff')) THEN 1
                    ELSE 0
                END) AS base_score,
                COALESCE(SUM(ap.points), 0) AS additional_points,
                CASE WHEN gp.role = 'lead' THEN TRUE ELSE FALSE END AS is_lead,
                kf_outer.user_id AS killed_first_player_id_in_game,
                (SELECT GROUP_CONCAT(u_bm.username SEPARATOR ', ')
                 FROM best_move bm
                 JOIN users u_bm ON bm.user_id = u_bm.id
                 WHERE bm.killed_first_id = kf_outer.killed_first_id
                ) AS best_movers_nicknames
            FROM games g
            LEFT JOIN game_players gp ON g.game_id = gp.game_id
            LEFT JOIN users u ON gp.user_id = u.id
            LEFT JOIN additional_points ap ON gp.game_player_id = ap.game_player_id
            LEFT JOIN killed_first kf_outer ON g.game_id = kf_outer.game_id
            WHERE g.game_id IN ({format_strings}) AND gp.role != 'lead'
            GROUP BY 
                g.game_id, g.game_date, g.winner, g.table_number, g.game_number, 
                u.id, u.username, gp.role, 
                kf_outer.user_id, kf_outer.killed_first_id
            ORDER BY g.game_id DESC, g.game_date DESC, u.id
        '''
        cursor.execute(query, tuple(game_ids))
        results = cursor.fetchall()
        games_dict = {}
        for row in results:
            game_id = row[0]
            game_date = row[1]
            winner = row[2]
            table_number = row[3]
            game_number = row[4]
            player_user_id = row[5]
            nickname = row[6]
            role = row[7]
            base_score = float(row[8])
            additional_points = float(row[9]) if row[9] is not None else 0.0
            is_lead = row[10]
            killed_first_player_id_for_game = row[11] 
            best_movers_nicknames_str = row[12]
            score = base_score + additional_points
            if game_id not in games_dict:
                games_dict[game_id] = {
                    "game_id": game_id,
                    "game_date": game_date.strftime("%Y-%m-%d %H:%M:%S") if game_date else None,
                    "winner": winner,
                    "table_number": table_number,
                    "game_number": game_number,
                    "players": [],
                    "best_movers": best_movers_nicknames_str.split(', ') if best_movers_nicknames_str else [],
                    "killed_first_player_id_for_game": killed_first_player_id_for_game
                }
            is_killed_first_flag = (player_user_id == games_dict[game_id]["killed_first_player_id_for_game"]) \
                                   if games_dict[game_id]["killed_first_player_id_for_game"] is not None else False
            def format_points(val):
                if val is None or abs(val) < 1e-8:
                    return None
                val = round(val + 1e-8, 2)
                s = ("%.2f" % val).rstrip('0').rstrip('.')
                return float(s) if '.' in s else int(s)
            games_dict[game_id]["players"].append({
                "id": player_user_id,
                "nickname": nickname,
                "role": role,
                "score": round(score, 2),
                "is_lead": is_lead,
                "is_killed_first": is_killed_first_flag,
                "additional_points": format_points(additional_points)
            })
        for game_obj in games_dict.values():
            if "killed_first_player_id_for_game" in game_obj:
                del game_obj["killed_first_player_id_for_game"]
        games_list = list(games_dict.values())
        return games_list
    except Exception as e:
        print("Database error (get_games_summary_strict):", e)
        return None
    finally:
        if 'cursor' in locals() and cursor: cursor.close()
        if 'cnx' in locals() and cnx: cnx.close()
