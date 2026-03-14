#!/usr/bin/env python3

import sys
import subprocess
import importlib.util
from urllib.parse import urljoin, urlparse

def check_and_install(package, pip_name=None):
    """Проверяет и устанавливает библиотеку при необходимости"""
    spec = importlib.util.find_spec(package)
    if spec is None:
        install_name = pip_name if pip_name else package
        print(f"Библиотека {package} не найдена. Устанавливаю {install_name}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", install_name])
            print(f"✓ {install_name} установлен!")
        except subprocess.CalledProcessError:
            print(f"✗ Ошибка установки {install_name}")
            return False
    return True

# Проверяем библиотеки
required = [
    ('bs4', 'beautifulsoup4'),
    ('requests', 'requests')
]

for module, pip_name in required:
    if not check_and_install(module, pip_name):
        sys.exit(1)

from bs4 import BeautifulSoup
import requests

def analyze_threads_profile(url):
    """Анализирует Threads профиль и извлекает информацию о медиа"""
    
    results = {
        'profile_image': None,
        'og_images': [],
        'twitter_images': [],
        'page_images': [],
        'possible_post_images': [],
        'meta_tags': []
    }
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        print(f"📡 Загружаем страницу: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Собираем ВСЕ метатеги для анализа
        print("\n🔍 Анализируем метатеги...")
        
        # Open Graph теги
        og_tags = soup.find_all('meta', property=lambda x: x and x.startswith('og:'))
        for tag in og_tags:
            prop = tag.get('property', '')
            content = tag.get('content', '')
            if content:
                results['meta_tags'].append(f"OG: {prop} = {content}")
                if 'image' in prop:
                    results['og_images'].append(content)
        
        # Twitter Card теги
        twitter_tags = soup.find_all('meta', attrs={'name': lambda x: x and x.startswith('twitter:')})
        for tag in twitter_tags:
            name = tag.get('name', '')
            content = tag.get('content', '')
            if content:
                results['meta_tags'].append(f"Twitter: {name} = {content}")
                if 'image' in name:
                    results['twitter_images'].append(content)
        
        # 2. Изображения профиля (обычно в og:image или link rel)
        profile_img = soup.find('meta', property='og:image')
        if profile_img:
            results['profile_image'] = profile_img.get('content')
        
        # 3. Все изображения на странице
        print("🔍 Ищем изображения на странице...")
        all_images = soup.find_all('img', src=True)
        
        for img in all_images[:20]:  # Ограничиваем для читаемости
            src = img.get('src', '')
            alt = img.get('alt', '')
            width = img.get('width', '')
            height = img.get('height', '')
            
            # Преобразуем относительные URL в абсолютные
            if src:
                if src.startswith('//'):
                    src = 'https:' + src
                elif not src.startswith(('http://', 'https://')):
                    src = urljoin(url, src)
                
                img_info = {
                    'url': src,
                    'alt': alt[:100] + '...' if len(alt) > 100 else alt,
                    'size': f"{width}x{height}" if width and height else "unknown"
                }
                results['page_images'].append(img_info)
                
                # Пытаемся определить, может ли это быть изображение поста
                if any(keyword in src.lower() or (alt and keyword in alt.lower()) 
                       for keyword in ['post', 'media', 'content', 'thread', 'scontent']):
                    results['possible_post_images'].append(img_info)
        
        return results
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка при запросе: {e}")
        return None
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return None

def print_results(results, url):
    """Красиво выводит результаты"""
    
    if not results:
        print("Не удалось получить результаты анализа")
        return
    
    print("\n" + "="*70)
    print(f"📊 ОТЧЕТ АНАЛИЗА: {url}")
    print("="*70)
    
    # 1. Основное изображение профиля
    if results['profile_image']:
        print(f"\n👤 АВАТАР ПРОФИЛЯ:")
        print(f"   {results['profile_image']}")
    
    # 2. Open Graph изображения
    if results['og_images']:
        print(f"\n📸 OPEN GRAPH ИЗОБРАЖЕНИЯ ({len(results['og_images'])}):")
        for i, img in enumerate(results['og_images'][:3], 1):
            print(f"   {i}. {img}")
        if len(results['og_images']) > 3:
            print(f"   ... и еще {len(results['og_images']) - 3} изображений")
    
    # 3. Twitter Card изображения
    if results['twitter_images']:
        print(f"\n🐦 TWITTER CARD ИЗОБРАЖЕНИЯ ({len(results['twitter_images'])}):")
        for i, img in enumerate(results['twitter_images'][:3], 1):
            print(f"   {i}. {img}")
    
    # 4. Возможные изображения постов
    if results['possible_post_images']:
        print(f"\n📝 ВОЗМОЖНЫЕ ИЗОБРАЖЕНИЯ ПОСТОВ ({len(results['possible_post_images'])}):")
        for i, img in enumerate(results['possible_post_images'][:5], 1):
            print(f"   {i}. {img['url']}")
            if img['alt']:
                print(f"      Alt текст: {img['alt']}")
            if img['size'] != 'unknown':
                print(f"      Размер: {img['size']}")
    
    # 5. Общая статистика
    print(f"\n📈 СТАТИСТИКА:")
    print(f"   • Всего изображений на странице: {len(results['page_images'])}")
    print(f"   • Open Graph тегов: {len([x for x in results['meta_tags'] if 'OG:' in x])}")
    print(f"   • Twitter Card тегов: {len([x for x in results['meta_tags'] if 'Twitter:' in x])}")
    
    # 6. Важные метатеги
    if results['meta_tags']:
        print(f"\n🏷️ ВАЖНЫЕ МЕТАТЕГИ:")
        important_tags = ['title', 'description', 'url', 'site_name', 'type']
        for tag in results['meta_tags'][:10]:  # Показываем первые 10
            if any(keyword in tag.lower() for keyword in important_tags):
                print(f"   • {tag}")

def main():
    """Основная функция"""
    
    print("="*70)
    print("🛠️  АНАЛИЗАТОР СНИППЕТОВ THREADS/PROFILE")
    print("="*70)
    
    # Тестовые URL (можно изменить)
    test_urls = [
        "https://www.threads.com/@usemikehelp",
        # Добавьте другие URL для тестирования
    ]
    
    for url in test_urls:
        print(f"\n\n🎯 Начинаем анализ: {url}")
        results = analyze_threads_profile(url)
        
        if results:
            print_results(results, url)
        else:
            print(f"❌ Не удалось проанализировать {url}")
        
        print(f"\n{'='*70}")
        
        # Спросим, хотим ли продолжить
        if len(test_urls) > 1 and url != test_urls[-1]:
            cont = input("\nПродолжить анализ следующего URL? (y/n): ")
            if cont.lower() != 'y':
                break

if __name__ == "__main__":
    main()