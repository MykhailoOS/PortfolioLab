# Supabase Storage Setup for Image Uploads

## Что нужно сделать:

### 1. Создать Storage Bucket

1. Зайдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Storage** (слева в меню)
4. Нажмите **New bucket**
5. Настройки:
   - **Name**: `portfolio-images`
   - **Public**: ✅ **Включить** (чтобы изображения были доступны публично)
   - **File size limit**: 5 MB (или больше, если нужно)
   - **Allowed MIME types**: `image/png`, `image/jpeg`, `image/webp`, `image/avif`
6. Нажмите **Create bucket**

### 2. Настроить RLS Policies

Перейдите в **SQL Editor** и выполните скрипт из файла `supabase-storage-setup.sql`:

```sql
-- Скопируйте и выполните весь код из supabase-storage-setup.sql
```

Или настройте вручную через UI:

1. В **Storage** → **Policies** для bucket `portfolio-images`
2. Создайте следующие политики:

#### Policy 1: Upload (INSERT)

- **Name**: Users can upload to their own folder
- **Target roles**: authenticated
- **WITH CHECK expression**:
  ```sql
  (bucket_id = 'portfolio-images') AND
  ((auth.uid())::text = (storage.foldername(name))[1])
  ```

#### Policy 2: Update (UPDATE)

- **Name**: Users can update their own files
- **Target roles**: authenticated
- **USING expression**:
  ```sql
  (bucket_id = 'portfolio-images') AND
  ((auth.uid())::text = (storage.foldername(name))[1])
  ```

#### Policy 3: Delete (DELETE)

- **Name**: Users can delete their own files
- **Target roles**: authenticated
- **USING expression**:
  ```sql
  (bucket_id = 'portfolio-images') AND
  ((auth.uid())::text = (storage.foldername(name))[1])
  ```

#### Policy 4: Read (SELECT)

- **Name**: Public read access
- **Target roles**: public
- **USING expression**:
  ```sql
  bucket_id = 'portfolio-images'
  ```

### 3. Проверка

После настройки:

1. Зайдите на сайт https://just-site.win
2. Откройте любой проект
3. В секции About попробуйте загрузить фотографию
4. Если все работает - увидите preview изображения
5. Закройте и снова откройте проект - изображение должно загрузиться

### Структура хранения файлов

Файлы будут храниться в следующей структуре:

```
portfolio-images/
  ├── <user_id_1>/
  │   ├── 1699123456789-abc123.jpg
  │   ├── 1699123457890-def456.png
  │   └── ...
  ├── <user_id_2>/
  │   └── ...
  └── ...
```

Каждый пользователь может загружать/удалять только свои файлы!

## Что исправлено:

✅ Убрана секция Visual Effects из Inspector  
✅ Исправлен горизонтальный скролл при сворачивании панелей  
✅ Миграция загрузки изображений с Directus на Supabase Storage  
✅ Добавлена валидация размера файла (5 MB) и типа (PNG/JPEG/WEBP/AVIF)  
✅ Автоматическое определение размеров изображения при загрузке  
✅ Улучшенная обработка ошибок

## После настройки Storage

Обязательно протестируйте:

- [ ] Загрузку изображения в About секцию
- [ ] Загрузку изображения в Projects секцию
- [ ] Отображение загруженного изображения после перезагрузки страницы
- [ ] Удаление изображения
- [ ] Загрузку слишком большого файла (должна быть ошибка)
- [ ] Загрузку файла неправильного формата (должна быть ошибка)
