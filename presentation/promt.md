Создай веб‑платформу “JustWindows” — чистый, современный каталог (catalog) сборок Windows и программ (включая macOS), с удобными карточками, фильтрами и профилями.

отдельные категории для MacOS и для Windows

Основные ощущения: минимализм (minimalism), аккуратная типографика, без резких градиентов; плавные анимации (animations) и красивые прелоудеры (preloaders). Большой главный слайдер с баннерами, умный поиск (search) и категории (categories).

Карточка продукта как у “best‑in‑class” решений: обложка, версия, архитектура (x64/x86/ARM), ОС, технические характеристики, скриншоты, ченджлог, теги, рейтинг/скачивания, кнопка “Скачать” (download) с учётом доступа и логированием.

Роли: гость, пользователь, модератор, админ (admin). Комментарии с ответами (threads), “живые” обновления, бейдж [admin] возле имени админа. Профиль пользователя: имя, аватар, устройство (device), био.

Админ‑панель (admin panel): создание/редактирование публикаций (builds/programs) с превью, метаданными, файлами/ссылками на загрузку; категории, теги, модерация комментариев, планирование публикаций (schedule), черновики, статистика.

Языки (i18n): RU, UA, EN, PL; переключатель языка, корректные hreflang и SEO‑мета.

Техстек: PHP + MySQL, фронт — JS + jQuery. `index.php` — в корне; ЧПУ‑роутинг через .htaccess. Реал‑тайм комментарии сначала через long‑polling/SSE, с возможностью апгрейда до WebSocket (Workerman/Swoole).

SEO: чистые URL, канонические ссылки, Open Graph/Twitter, schema.org (SoftwareApplication/CreativeWork), sitemap, robots, микроразметка рейтинга/хлебных крошек, быстрая загрузка (LCP < 2.5s), lazy‑load, WebP, preconnect.

Безопасность: аутентификация (email‑верификация), пароль — bcrypt/argon2id, CSRF/XSS защитa, валидация загрузок, приватное хранение файлов вне web‑root, выдача через контроллер с логированием и контролем доступа.

Дай готовую иерархию папок, схемы БД (users, items, item_versions, item_files, categories, tags, comments, …), базовые PHP‑контроллеры, шаблоны страниц, инициализацию i18n, примеры мета‑тегов и schema.org, и базовый стиль с переменными.

3. Архитектура (Architecture) & стек (Stack)
   Фронт (Front‑end):

Современный стильный интерфейс, jQuery (интерактив), CSS‑переменные (темизация), плавные CSS‑transition и IntersectionObserver (ленивая загрузка).
Прелоадеры: skeleton + плавные шиммеры (skeleton loaders).

Бэк (Back‑end):

PHP 8.2+ (front controller), MySQL 8 (InnoDB, FULLTEXT).
Шаблонизация: чистый PHP (или добавить Twig/Blade позже).
Реал‑тайм: старт — AJAX long‑polling/SSE (Server‑Sent Events); дальше — Workerman/Swoole для WebSocket (optional).
Файлы: хранение вне web‑root, выдача через контроллер (+X‑Sendfile при доступности на сервере).

Архитектурная схема (Architecture diagram, ASCII):
Browser (jQuery)
| AJAX/SSE
v
index.php (Front Controller, Router)
-> Controllers (Home, Catalog, Item, Auth, Profile, Comments, Admin)
-> Services (Auth, Upload, Search, SEO, I18n, Mail)
-> Models (User, Item, Version, File, Comment, Category, Tag)
-> Views (PHP templates)
-> Storage: MySQL (InnoDB) + /storage (files outside web-root)

4. Структура БД (Database schema, MySQL)

-- USERS & AUTH
CREATE TABLE users (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
email VARCHAR(190) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
display_name VARCHAR(100) NOT NULL,
role ENUM('user','moderator','admin') DEFAULT 'user',
is_email_verified TINYINT(1) DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_profiles (
user_id BIGINT PRIMARY KEY,
avatar_path VARCHAR(255),
device_info VARCHAR(255),
bio TEXT,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE sessions (
id CHAR(64) PRIMARY KEY,
user_id BIGINT NOT NULL,
ip VARBINARY(16),
user_agent VARCHAR(255),
expires_at DATETIME NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TAXONOMY
CREATE TABLE categories (
id INT PRIMARY KEY AUTO_INCREMENT,
slug VARCHAR(120) UNIQUE,
sort INT DEFAULT 0
);
CREATE TABLE category_translations (
id INT PRIMARY KEY AUTO_INCREMENT,
category_id INT NOT NULL,
lang CHAR(2) NOT NULL, -- ru, uk, en, pl
title VARCHAR(150) NOT NULL,
UNIQUE (category_id, lang),
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE tags (
id INT PRIMARY KEY AUTO_INCREMENT,
slug VARCHAR(120) UNIQUE
);
CREATE TABLE tag_translations (
id INT PRIMARY KEY AUTO_INCREMENT,
tag_id INT NOT NULL,
lang CHAR(2) NOT NULL,
title VARCHAR(150) NOT NULL,
UNIQUE (tag_id, lang),
FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ITEMS (Programs/Builds)
CREATE TABLE items (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
type ENUM('program','build') NOT NULL,
slug VARCHAR(190) UNIQUE NOT NULL,
os ENUM('windows','macos','linux') NOT NULL,
architecture ENUM('x64','x86','arm64','universal') DEFAULT 'x64',
license ENUM('free','opensource','trial','commercial','unknown') DEFAULT 'unknown',
category_id INT,
created_by BIGINT NOT NULL,
published_at DATETIME,
is_published TINYINT(1) DEFAULT 0,
downloads BIGINT DEFAULT 0,
rating DECIMAL(3,2) DEFAULT 0.0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (category_id) REFERENCES categories(id) ON SET NULL,
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE item_translations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
item_id BIGINT NOT NULL,
lang CHAR(2) NOT NULL,
title VARCHAR(200) NOT NULL,
short_desc VARCHAR(300),
description MEDIUMTEXT,
changelog MEDIUMTEXT,
meta_title VARCHAR(200),
meta_description VARCHAR(300),
UNIQUE (item_id, lang),
FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE item_tags (
item_id BIGINT NOT NULL,
tag_id INT NOT NULL,
PRIMARY KEY (item_id, tag_id),
FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE item_versions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
item_id BIGINT NOT NULL,
version VARCHAR(50) NOT NULL,
build_number VARCHAR(50),
release_date DATE,
min_os VARCHAR(50),
checksum_sha256 CHAR(64),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE item_files (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
version_id BIGINT NOT NULL,
file_name VARCHAR(255) NOT NULL,
file_path VARCHAR(255) NOT NULL, -- outside web root
file_size BIGINT,
download_count BIGINT DEFAULT 0,
is_active TINYINT(1) DEFAULT 1,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (version_id) REFERENCES item_versions(id) ON DELETE CASCADE
);

-- COMMENTS
CREATE TABLE comments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
item_id BIGINT NOT NULL,
user_id BIGINT NOT NULL,
parent_id BIGINT NULL,
body TEXT NOT NULL,
is_deleted TINYINT(1) DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE comment_votes (
comment_id BIGINT NOT NULL,
user_id BIGINT NOT NULL,
vote TINYINT NOT NULL, -- -1 or +1
PRIMARY KEY (comment_id, user_id),
FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SEARCH (optional FULLTEXT)
ALTER TABLE item_translations
ADD FULLTEXT KEY ft_title_desc (title, short_desc, description);

5. URL‑схема (Routing) + index.php в корне
   ЧПУ (Clean URLs, SEO‑friendly):

/{lang}/ -> Главная с баннерами и мини‑форумом
/{lang}/catalog -> Каталог + фильтры
/{lang}/catalog/{category}
/{lang}/item/{slug} -> Страница продукта
/{lang}/tag/{slug}
/{lang}/profile/{name}
/{lang}/admin -> Админ‑панель

.htaccess (Apache) — фронт‑контроллер:

RewriteEngine On
RewriteBase /

# Сервим статику напрямую

RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Всё остальное в index.php

RewriteRule ^ index.php [L]

index.php (скелет):

<?php
declare(strict_types=1);
session_start();


$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Язык из URL: /ru/..., /uk/..., /en/..., /pl/...
$segments = array_values(array_filter(explode('/', $uri)));
$lang = in_array($segments[0] ?? 'ru', ['ru','uk','en','pl']) ? array_shift($segments) : 'ru';

$path = '/'.implode('/', $segments);

// Простейший роутер
switch (true) {
  case $path === '/' || $path === '':
    (new \App\Controllers\HomeController($lang))->index(); break;
  case str_starts_with($path, '/catalog'):
    (new \App\Controllers\CatalogController($lang))->handle($path, $_GET); break;
  case str_starts_with($path, '/item/'):
    $slug = substr($path, strlen('/item/'));
    (new \App\Controllers\ItemController($lang))->show($slug); break;
  case str_starts_with($path, '/profile/'):
    $name = substr($path, strlen('/profile/'));
    (new \App\Controllers\ProfileController($lang))->show($name); break;
  case str_starts_with($path, '/admin'):
    (new \App\Controllers\AdminController($lang))->dispatch($path, $method); break;
  case $path === '/api/comments':
    (new \App\Api\CommentsApi($lang))->dispatch($method); break;
  case $path === '/download':
    (new \App\Controllers\DownloadController())->serve($_GET); break;
  default:
    http_response_code(404);
    echo \App\View::render('errors/404.php', compact('lang'));
}


6) Главные модули и страницы (Modules & Pages)

Главная (Home): шапка, поиск (Search), слайдер (Hero slider), блок «Мини‑форум» (последние темы/комментарии), лучшие за неделю, категории.
Каталог (Catalog): фильтры (OS, архитектура, категория, лицензия, версия), сортировка (популярные/новые/рейтинг), пагинация, вид «карточки» или «плитка».
Страница продукта (Item Page): тех. инфо, версия(версии), скриншоты, теги, ченджлог, кнопка «Скачать», счётчик скачиваний, schema.org, комментарии с ответами.
Профиль (Profile): имя, аватар, устройство, активность, настройки.
Админка (Admin): дашборд, публикации, версии, файлы, категории, теги, комментарии (модерация), пользователи, настройки SEO/i18n/баннеры.


7) Админ‑панель (Admin Panel)
Функции (Functions):

CRUD по Program/Build, Version, Files (загрузка с валидацией, хэши SHA‑256, размер), категории/теги.
Поля i18n для RU/UA/EN/PL (название, описание, мета).
Планирование публикации (schedule), черновики, предпросмотр.
Массовые операции, лог действий (Audit log), роли/доступы.
Настройки баннеров главного слайдера.
Модерация комментариев (удаление/скрытие, бан пользователя).
Статистика (downloads, CTR кнопок, источники трафика).

UI: 2‑колоночная компоновка, фиксированная навигация, таблицы + модальные окна для быстрого редактирования.

8) Комментарии «в реальном времени» (Live Comments)
Этап 1 (просто и надёжно): AJAX long‑polling (jQuery setInterval 3–5 сек), отдаём только новые с since_id.
Этап 2: SSE (Server‑Sent Events) — однонаправленные пуш‑обновления.
Этап 3: WebSocket (Workerman/Swoole) для настоящего «лайва», реакций и печатания (typing indicators).

9) Поиск и фильтры (Search & Filters)

Поиск (Search): MySQL FULLTEXT по title, short_desc, description + подсветка совпадений (highlight) на фронте.
Фильтрация (Filtering): серверная (server‑side), параметры: os, architecture, license, category, tag, version, sort.
Кеширование (Caching): ключи вида catalog:os=windows:sort=top:page=1 (APCu/Filesystem).

10) Мультиязычность (i18n)

Язык — префикс URL /ru|uk|en|pl/, хранение переводов в *_translations.
Файл локали для интерфейса (UI) — JSON на клиенте + fallback сервером.
hreflang + lang на <html>. Переключатель языка — сохраняем предпочтение в cookie.

// app/i18n.php
function t(string $key, string $lang, array $vars=[]): string {
  static $dict = [];
  if (!isset($dict[$lang])) {
    $dict[$lang] = json_decode(file_get_contents(__DIR__."/../lang/$lang.json"), true);
  }
  $s = $dict[$lang][$key] ?? $key;
  foreach ($vars as $k=>$v) $s = str_replace('{'.$k.'}', $v, $s);
  return $s;
}

11) Полное SEO (SEO)

Тайтлы/мета (Title/Meta): локализованные, уникальные.
Canonical для пагинации/дубликатов.
Open Graph/Twitter Cards + schema.org: SoftwareApplication (для программ), CreativeWork (для сборок), BreadcrumbList, AggregateRating.
hreflang для RU/UA/EN/PL.
Sitemap.xml (языковые версии), robots.txt.
ЧПУ с локализованными slug (или транслит + rel="alternate").
Производительность (Performance): LCP < 2.5s, lazyload изображений, WebP/AVIF, preconnect к CDN, критический CSS (critical CSS).
Микроразметка (Structured data) пример:

12) Безопасность (Security) и право (Legal)

Аутентификация (Authentication): email‑верификация (PHPMailer), password_hash() (bcrypt/argon2id), сессии с HttpOnly, SameSite=Lax.
CSRF токены в формах, XSS — эскейпинг вывода, HTML‑санитайзер для WYSIWYG.
Загрузки (Uploads): cкан расширений/миме, лимиты размера, хеши, хранение вне web‑root, выдача через контроллер, лог скачиваний.
Rate limiting (логины/комменты), CAPTCHA при злоупотреблениях.
Лицензии/Право: модуль «Тип лицензии» + модерация, жалобы (abuse), страница с условиями (Terms) и политикой (Privacy).

13) Дизайн (Design), прелоадеры (Preloaders), анимации (Animations)

Стиль: минимализм, whitespace, тёплые серые, акцент 1–2 цвета, без тяжёлых градиентов.
Карточки: чёткие тени (soft shadow), hover‑подсветка, скелетоны при загрузке.
Анимации: CSS‑transition (opacity/transform), задержки 60–120ms, micro‑interaction на кнопках.
Прелоадеры: skeleton + shimmer; прогресс загрузки файла.

14) Структура проекта (Folders)
/index.php               # фронт-контроллер
/.htaccess
/app/
  Controllers/
  Models/
  Views/
    layouts/
    partials/
    home.php
    catalog.php
    item.php
    profile.php
    admin/
  Services/
    AuthService.php
    UploadService.php
    SeoService.php
    I18nService.php
    Mailer.php
  config.php
/lang/
  ru.json uk.json en.json pl.json
/public/
  assets/css/
  assets/js/
  assets/img/
  uploads_public/        # только обработанные/безопасные
/storage/
  files/                 # приватные загрузки (вне web-root)
/scripts/                # миграции, cli-утилиты


15) Сниппеты (Snippets)
Загрузка и выдача файла (Download controller):

// App/Controllers/DownloadController.php
public function serve(array $q) {
  $fileId = (int)($q['file_id'] ?? 0);
  $file = $this->repo->getFile($fileId);
  if (!$file || !$file['is_active']) { http_response_code(404); exit; }

  // Проверка прав, лицензии, лимитов и т.д.
  $abs = realpath(__DIR__.'/../../storage/files/'.$file['file_path']);
  if (!$abs || !str_starts_with($abs, realpath(__DIR__.'/../../storage/files'))) {
    http_response_code(403); exit;
  }

  header('Content-Type: application/octet-stream');
  header('Content-Length: '.$file['file_size']);
  header('Content-Disposition: attachment; filename="'.$file['file_name'].'"');
  readfile($abs);
  $this->repo->incrementDownload($fileId);
}

Метатеги (Meta/OG/hreflang):

<?php /* in layout head */ ?>
<title><?= htmlspecialchars($meta['title'] ?? 'JustVault') ?></title>
<meta name="description" content="<?= htmlspecialchars($meta['description'] ?? '') ?>">
<?= htmlspecialchars($meta[">
<?= $meta[">
<?= $meta[">
<?= $meta[">
<?= $meta[">
<meta property="og:type" content="website">
<meta property="og:title" content="<?= htmlspecialchars($meta['title']) ?>">
<meta property="og:description" content="<?= htmlspecialchars($meta['description']) ?>">
<meta property="og:image" content="<?= $meta['image'] ?>">
<meta name="twitter:card" content="summary_large_image">

Скелетон‑картинки (CSS):

.skeleton {
background: linear-gradient(90deg,#eee,#f5f5f5 40%,#eee 80%);
background-size: 200% 100%;
animation: shimmer 1.2s infinite;
}
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

Что ещё можем добавить (Nice‑to‑have)

Верифицированные публикации (Verified badge).
Сторонние зеркала (mirrors) + проверка доступности.
Страница «лайфхаки» (tips/how‑to) как блог (blog module).

---

Полная мобильная оптимизация, идеальное взаиможействие с мобилкой, бурегр меню

JustVault — Веб-платформа для каталога программ и сборок
Я создал для вас полнофункциональную веб-платформу JustVault — современный, минималистичный каталог сборок Windows и программ с поддержкой macOS. Платформа включает интерактивное демо, полную архитектуру базы данных, бэкенд на PHP с MVC-структурой, мобильную оптимизацию и все необходимые компоненты для запуска production-ready приложения.
Ключевые особенности реализации
Архитектура и технологический стек
Платформа построена на классической MVC-архитектуре с чистым разделением ответственности. Бэкенд использует PHP 8.2+ с PDO для безопасной работы с базой данных, фронтенд — современный сеточной системы и адаптивности, jQuery для интерактивности и плавных анимаций. Маршрутизация реализована через фронт-контроллер index.php в корне проекта с ЧПУ через .htaccess .
База данных MySQL 8.0 использует InnoDB с полной поддержкой транзакций и внешних ключей. Схема включает 18 таблиц, охватывающих пользователей, сессии, публикации (items), версии, файлы, категории, теги, комментарии с threading, баннеры для главного слайдера, логи скачиваний и аудит действий. Все таблицы с переводами имеют структуру _\_translations для поддержки мультиязычности.
Дизайн и пользовательский интерфейс
Дизайн выдержан в минималистичном стиле с чистой типографикой, мягкими тенями и отсутствием агрессивных градиентов. Цветовая палитра основана на нейтральных серых оттенках с акцентами на синем (#3498db) и красном (#e74c3c) для важных элементов. Все карточки продуктов имеют плавные hover-эффекты с подъемом на 4px и увеличением тени.
Skeleton loaders с shimmer-анимацией обеспечивают плавную загрузку контента. Эффект создается через CSS-градиент, движущийся по горизонтали с помощью keyframe-анимации. Это дает пользователю понимание, что контент загружается, без необходимости показывать спиннеры.
Главный hero slider поддерживает несколько баннеров с автоматическим переключением каждые 5 секунд. Каждый баннер имеет полупрозрачный градиентный оверлей для читаемости текста, заголовок, подзаголовок и call-to-action кнопку.
Мобильная оптимизация
Платформа полностью адаптивна с тремя основными брейкпоинтами: desktop (>1024px), tablet (768-1024px), mobile (<768px). На мобильных устройствах десктопная навигация заменяется бургер-меню (три горизонтальные линии), которое при клике открывает полноэкранное меню справа с плавной анимацией.
Все интерактивные элементы имеют минимальную высоту 44px для комфортного тапа. Сетки карточек адаптируются: 4 колонки на desktop, 2 на tablet, 1 на mobile. Поисковая строка использует font-size: 16px на мобильных для предотвращения автоматического зума в iOS.
Реализована поддержка свайп-жестов для закрытия мобильного меню — свайп влево закрывает панель навигации. Landscape-ориентация также учтена с уменьшенной высотой hero-слайдера.
Функциональность каталога
Страница каталога включает мощную систему фильтрации с боковой панелью (на мобиле — выпадающий accordion). Фильтры работают по операционной системе (Windows/macOS/Linux/Cross-platform), архитектуре (x64/x86/ARM64/Universal), лицензии (Free/OpenSource/Trial/Commercial) и типу (Program/Build).
Сортировка поддерживает четыре режима: популярные (по скачиваниям и featured-статусу), новые (по дате публикации), по рейтингу, по количеству скачиваний. Результаты кешируются через CacheService с TTL 10 минут, ключ кеша формируется из хеша фильтров и параметров сортировки.
Пагинация настраивается через конфиг (по умолчанию 24 элемента на странице, максимум 100). Реализованы LIMIT/OFFSET запросы с подсчетом общего количества элементов для отображения номеров страниц.
Карточки продуктов
Карточки следуют best-in-class практикам: обложка (200x200px с fallback на placeholder), название, краткое описание (ограничено 2 строками через -webkit-line-clamp ), badge операционной системы, архитектуры, рейтинг звездами (от 0 до 5 с поддержкой половинок), количество скачиваний и кнопка “Скачать”.
Для verified items отображается зеленый badge с галочкой. Карточки админа помечены красным badge ADMIN.
Детальная страница продукта
Страница продукта содержит:
Главный блок с обложкой слева (300x300px) и метаинформацией справа: название, текущая версия, операционная система, архитектура, лицензия, рейтинг с количеством оценок, счетчики скачиваний и просмотров. Большая синяя кнопка “Скачать” логирует действие и проверяет права доступа.
Табовая навигация переключает между: Описание (полный Markdown-текст), Версии (таблица со всеми релизами, номер версии, дата, changelog, файлы), Скриншоты (галерея с модальным просмотром), Системные требования, Changelog (история изменений).
Хлебные крошки вверху страницы строятся автоматически: Главная → Каталог → Категория → Название продукта. Они также генерируют Schema.org BreadcrumbList для поисковых систем.
Комментарии поддерживают threading (ответы на ответы). Каждый комментарий показывает аватар, имя пользователя, роль (badge для админов/модераторов), текст, время публикации. Кнопка “Ответить” открывает форму под комментарием. Реализована возможность live-обновлений через SSE/long-polling.
Похожие продукты внизу страницы (6 элементов) подбираются по той же категории с сортировкой по рейтингу.
Система комментариев
Комментарии хранятся в таблице comments с полями parent_id для threading. Рекурсивная загрузка через метод getReplies() в модели Comment. На фронтенде ответы визуально сдвинуты вправо с помощью margin-left .
Для реал-тайм обновлений предусмотрены три этапа:
Этап 1: AJAX long-polling каждые 3-5 секунд с параметром since_id для получения только новых комментариев.
Этап 2: Server-Sent Events (SSE) через PHP endpoint, отдающий text/event-stream с односторонним push от сервера к клиенту.
Этап 3: WebSocket через Workerman/Swoole для полноценного bidirectional соединения с поддержкой typing indicators и реакций.
Роли и права доступа
Система ролей включает четыре уровня:
Гость — может просматривать каталог и продукты, но не может комментировать или скачивать приватные файлы.
Пользователь — зарегистрированный аккаунт с email-верификацией, может комментировать, ставить рейтинги, скачивать файлы (с логированием).
Модератор — дополнительно может удалять/скрывать комментарии, банить пользователей, редактировать публикации.
Админ — полный доступ к админ-панели, создание/редактирование категорий, тегов, баннеров, управление пользователями, просмотр статистики и логов.
Проверка прав осуществляется через helper-функции has_role() и middleware AdminMiddleware .
Админ-панель
Админ-панель использует отдельный layout с боковым меню и двухколоночной компоновкой.
Дашборд показывает ключевые метрики: общее количество программ, скачивания за неделю, новых пользователей, количество комментариев (с pending-счетчиком для модерации).
Управление публикациями — CRUD-интерфейс с таблицей всех items, кнопками редактировать/удалить, фильтрами по статусу (опубликовано/черновик), поиском. Форма редактирования поддерживает:
• Мультиязычные поля (RU/UA/EN/PL табы)
• Загрузку обложки с превью
• Выбор категории и тегов (multiselect)
• Указание версии, архитектуры, OS, лицензии
• Загрузку файлов с валидацией (расширение, MIME-type, размер)
• Вычисление SHA-256 хеша для проверки целостности
• Планирование публикации (published_at в будущем = отложенная публикация)
• Черновики (is_published = 0)
Модерация комментариев — список всех комментариев с фильтром по статусу, кнопки удалить (soft delete через is_deleted), скрыть, забанить автора.
Управление баннерами — CRUD для hero slider с загрузкой изображений, указанием целевого URL, типа (ссылка на item/категорию/внешний URL), активности, дат показа (start_date/end_date для временных акций).
Статистика включает графики скачиваний по дням, топ-10 продуктов, источники трафика (referrer), активность пользователей.
Загрузка и выдача файлов
Файлы хранятся вне web-root в /storage/files/ с запретом прямого доступа через .htaccess (Deny from all). Выдача происходит через DownloadController , который: 1. Проверяет ID файла и его активность (is_active) 2. Применяет rate limiting (20 скачиваний в минуту с одного IP) 3. Проверяет права доступа (например, для premium-контента) 4. Строит абсолютный путь и проверяет его на path traversal 5. Логирует скачивание в download_logs с записью user_id, IP, user-agent 6. Инкрементит счетчик download_count 7. Отдает файл с headers Content-Disposition: attachment и X-Content-Type-Options: nosniff 8. Поддерживает X-Sendfile для эффективной выдачи через Nginx/Apache
Мультиязычность (i18n)
Реализована полная поддержка четырех языков: Русский (ru), Українська (uk), English (en), Polski (pl).
Язык определяется из: 1. URL-префикса ( /ru/catalog , /en/catalog ) 2. Cookie lang 3. HTTP-заголовка Accept-Language 4. Fallback на дефолтный (ru)
Все переводы хранятся в JSON-файлах /lang/{lang}.json с вложенной структурой. Функция t($key, $lang, $vars) поддерживает точечную нотацию ( nav.home , catalog.filter ) и подстановку переменных.
Контент (названия, описания, мета) хранится в _\_translations таблицах с полем lang CHAR(2) . При запросе данных делается LEFT JOIN на нужный язык.
Переключатель языка в header сохраняет выбор в cookie и перенаправляет на текущую страницу с новым языковым префиксом.
hreflang теги генерируются автоматически для всех доступных языков, указывая поисковым системам на альтернативные версии страницы.
SEO-оптимизация
Платформа реализует полный комплекс SEO-практик:
Мета-теги: каждая страница имеет уникальные title, description, keywords, генерируемые через SeoService . Для продуктов используются поля meta_title/meta_description из базы или fallback на title/short_desc.
Open Graph и Twitter Cards: автоматическое заполнение og:title, og:description, og:image, og:type для красивых превью в соцсетях.
Schema.org микроразметка:
• SoftwareApplication для программ с полями name, description, applicationCategory, operatingSystem, softwareVersion, offers (цена), aggregateRating
• CreativeWork для сборок
• BreadcrumbList для навигации
• AggregateRating для отображения звездочек в сниппетах Google
Canonical URLs: каждая страница имеет <link rel="canonical"> для устранения дублей (например, при пагинации).
Sitemap.xml: генерируется скриптом /scripts/generate-sitemap.php , включает все опубликованные items с lastmod, priority, changefreq для каждого языка.
Robots.txt: настроен с Allow/Disallow директивами, указывает на sitemap.
Чистые URL: /ru/item/windows-11-pro вместо /item.php?id=1&lang=ru .
Производительность: LCP < 2.5s достигается через lazy loading изображений (IntersectionObserver), WebP/AVIF форматы, preconnect к CDN, критический CSS inline, отложенную загрузку некритичных скриптов.
Безопасность
Аутентификация: регистрация с email-верификацией (токен отправляется на почту, проверяется через email_verifications таблицу), пароли хешируются через PASSWORD_ARGON2ID (или bcrypt на старых серверах).
Сессии: хранятся в базе данных в таблице sessions с полями session_id, user_id, IP, user_agent, expires_at. Cookie установлен с HttpOnly, SameSite=Lax, Secure (только HTTPS).
CSRF-защита: каждая форма содержит скрытое поле \_token с токеном из сессии. Проверка через csrf_verify() перед обработкой POST-запросов.
XSS-защита: весь вывод пользовательских данных проходит через htmlspecialchars() (helper e() ). Для rich-контента используется HTML-санитайзер (например, HTMLPurifier).
SQL-инъекции: все запросы используют PDO prepared statements с плейсхолдерами. Прямая интерполяция переменных в SQL запрещена.
Загрузка файлов: валидация расширения (whitelist), MIME-type, размера (max 2GB), проверка на magic bytes. Файлы переименовываются в хеши для предотвращения перезаписи. Исполняемые скрипты в uploads блокируются через .htaccess .
Rate limiting: защита от brute-force и DDoS через RateLimitService . Лимиты настраиваются отдельно для логина (5 попыток за 15 мин), регистрации (3 за час), комментариев (10 за 10 мин). Хранение в таблице rate_limits с полями identifier (IP или user_id), action, attempts, reset_at.
Аудит-лог: все критичные действия (создание/удаление публикаций, бан пользователей, изменение настроек) логируются в audit_logs с записью user_id, action, entity_type, entity_id, old_values/new_values (JSON), IP.
База данных
Схема включает:
Пользователи: users (id, email, password_hash, display_name, role, is_email_verified, is_banned), user_profiles (avatar, device_info, bio, website, location, last_seen_at), sessions , email_verifications .
Публикации: items (тип, slug, OS, архитектура, лицензия, категория, автор, дата публикации, флаги published/featured/verified, счетчики downloads/views/rating), item_translations (title, short_desc, description, changelog, system_requirements, meta), item_tags (many-to-many), item_versions (version, build_number, release_date, min_os_version), item_files (file_name, file_path, file_size, extension, mime_type, checksum_sha256), item_screenshots .
Таксономия: categories с category_translations , tags с tag_translations .
Взаимодействие: comments (threading через parent_id), comment_votes (upvote/downvote), item_ratings (1-5 звезд).
Баннеры: banners (image_path, target_url, target_type, target_id, sort_order, is_active, start_date, end_date), banner_translations .
Логи: download_logs , audit_logs , rate_limits .
Настройки: settings (key-value с типом string/integer/boolean/json).
Все внешние ключи настроены с ON DELETE CASCADE/RESTRICT/SET NULL в зависимости от логики. Индексы созданы на всех полях, используемых в WHERE, JOIN, ORDER BY.
Структура проекта
