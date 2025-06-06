import mysql.connector
from getpass import getpass
import bcrypt

def create_database(host, username, password):
    try:
        # Подключение к базе данных
        cnx = mysql.connector.connect(
            user=username,
            password=password,
            host=host
        )
        cursor = cnx.cursor()
        # Создание базы данных
        cursor.execute("CREATE DATABASE IF NOT EXISTS mafia;")
        print(f"База данных mafia создана или уже существует.")
        # Переключение на БД мафии
        cursor.execute("USE mafia;")
        # Создаём таблицу для входа пользователей
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT,
            login VARCHAR(255) NOT NULL,
            username VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            jwt VARCHAR(511),
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ''')
        print(f"Таблица users создана или уже существует.")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS games (
                game_id INT AUTO_INCREMENT PRIMARY KEY,
                game_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                winner ENUM('mafia', 'peaceful') NOT NULL
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ''')
        print(f"Таблица games создана или уже существует.")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS game_players (
                game_player_id INT AUTO_INCREMENT PRIMARY KEY,
                game_id INT,
                user_id INT,
                role ENUM('peaceful', 'mafia', 'don', 'sheriff', 'lead') NOT NULL,
                FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ''')
        print(f"Таблица game_players создана или уже существует.")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS additional_points (
                point_id INT AUTO_INCREMENT PRIMARY KEY,
                game_player_id INT,
                points INT NOT NULL,
                FOREIGN KEY (game_player_id) REFERENCES game_players(game_player_id) ON DELETE CASCADE
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ''')
        print(f"Таблица additional_points создана или уже существует.")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS killed_first (
                killed_first_id INT AUTO_INCREMENT PRIMARY KEY,
                game_id INT,
                user_id INT,
                FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ''')
        print(f"Таблица killed_first создана или уже существует.")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS best_move (
                best_move_id INT AUTO_INCREMENT PRIMARY KEY,
                killed_first_id INT,
                user_id INT,
                FOREIGN KEY (killed_first_id) REFERENCES killed_first(killed_first_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ''')
        print(f"Таблица best_move создана или уже существует.")

        cursor.execute('SELECT COUNT(*) FROM users;')
        user_count = cursor.fetchone()[0]

        if user_count == 0:
            # Добавление тестовых пользователей с bcrypt-хешами
            test_users = [
                ('user1', 'User One', 'password1', 'jwt1', False),
                ('user2', 'User Two', 'password2', 'jwt2', True),
                ('user3', 'User Three', 'password3', 'jwt3', False),
                ('user4', 'User 4', 'password3', 'jwt4', False),
                ('user5', 'User 5', 'password3', 'jwt5', False),
                ('user6', 'User 6', 'password3', 'jwt6', False),
                ('user7', 'User 7', 'password3', 'jwt7', False),
                ('user8', 'User 8', 'password3', 'jwt8', False),
                ('user9', 'User 9', 'password3', 'jwt9', False),
                ('user10', 'User 10', 'password3', 'jwt10', False),
                ('user11', 'User 11', 'password3', 'jwt11', False),
                ('user12', 'User 12', 'password3', 'jwt12', False),
            ]
            for login, username, password, jwt, is_admin in test_users:
                password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute('INSERT INTO users (login, username, password, jwt, is_admin) VALUES (%s, %s, %s, %s, %s)', (login, username, password_hash, jwt, is_admin))
            cursor.execute('''
                -- Добавление тестовых игр
                INSERT INTO games (game_date, winner) VALUES
                ('2023-01-01 12:00:00', 'mafia'),
                ('2023-01-02 14:00:00', 'peaceful'),
                ('2023-01-03 16:00:00', 'mafia');

                -- Добавление тестовых игроков в игры
                INSERT INTO game_players (game_id, user_id, role) VALUES
                (1, 1, 'mafia'),
                (1, 2, 'peaceful'),
                (1, 3, 'peaceful'),
                (1, 4, 'sheriff'),
                (1, 5, 'peaceful'),
                (1, 6, 'peaceful'),
                (1, 7, 'mafia'),
                (1, 8, 'peaceful'),
                (1, 9, 'don'),
                (1, 10, 'peaceful'),
                (1, 11, 'lead'),
                (2, 1, 'don'),
                (2, 2, 'mafia'),
                (2, 3, 'sheriff'),
                (2, 4, 'peaceful'),
                (2, 5, 'peaceful'),
                (2, 6, 'peaceful'),
                (2, 7, 'peaceful'),
                (2, 8, 'peaceful'),
                (2, 9, 'peaceful'),
                (2, 10, 'mafia'),
                (2, 11, 'lead'),
                (3, 1, 'mafia'),
                (3, 2, 'mafia'),
                (3, 3, 'peaceful'),
                (3, 4, 'don'),
                (3, 5, 'sheriff'),
                (3, 6, 'peaceful'),
                (3, 7, 'peaceful'),
                (3, 8, 'peaceful'),
                (3, 9, 'peaceful'),
                (3, 10, 'peaceful'),
                (3, 11, 'lead');

                -- Добавление тестовых дополнительных очков
                INSERT INTO additional_points (game_player_id, points) VALUES
                (1, 10),
                (7, 20),
                (2, 5),
                (12, -40),
                (13, 30);

                -- Добавление тестовых записей о первых убитых
                INSERT INTO killed_first (game_id, user_id) VALUES
                (1, 2),
                (2, 1),
                (3, 3);

                -- Добавление тестовых записей о лучших ходах
                INSERT INTO best_move (killed_first_id, user_id) VALUES
                (1, 1),
                (1, 2),
                (1, 3),
                (2, 3),
                (2, 5),
                (2, 6),
                (3, 2),
                (3, 10),
                (3, 8);
            ''')
            print(f"Тестовые данные добавлены.")
        else:
            print("Тестовые пользователи уже существуют.")
        # Закрытие соединения
        cursor.close()
        cnx.close()
    except mysql.connector.Error as err:
        print(f"Ошибка создания базы данных: {err}")

def auto_main():
    host = input("Введите хост (по умолчанию localhost): ") or 'localhost'
    username = input("Введите логин: ")
    password = getpass("Введите пароль: ")
    
    create_database(host, username, password)
    return host, username, password
