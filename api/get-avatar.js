// api/get-avatar.js
// Синхронизировано с эталонным get-avatar.js пользователя
// Адаптировано под текущую базу (profiles) и переменные окружения

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const CACHE_TTL_HOURS = 24

// =============================================
// SECURITY: Whitelist domains for proxy requests
// =============================================
const ALLOWED_PROXY_DOMAINS = ['cdninstagram.com', 'fbcdn.net', 'scontent']

function isAllowedProxyUrl(url) {
    try {
        const parsed = new URL(url)
        return ALLOWED_PROXY_DOMAINS.some(d => parsed.hostname.includes(d))
    } catch {
        return false
    }
}

// =============================================
// SECURITY: Validate username format
// =============================================
const USERNAME_REGEX = /^[a-z0-9._]{1,30}$/

function isValidUsername(username) {
    return USERNAME_REGEX.test(username)
}

async function fetchPage(url) {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1'
            },
            redirect: 'follow',
            signal: controller.signal
        })

        clearTimeout(timeoutId)
        const html = await response.text()

        return { statusCode: response.status, html, finalUrl: response.url }
    } catch (error) {
        return { statusCode: 500, html: '', finalUrl: '' }
    }
}

async function getFromCache(username) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/threads_avatars_cache?username=eq.${username}&select=username,avatar_url,cached_at`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                }
            }
        )
        const data = await response.json()

        if (data && data.length > 0) {
            const cached = data[0]
            const cachedAt = new Date(cached.cached_at)
            const hoursOld = (Date.now() - cachedAt.getTime()) / (1000 * 60 * 60)

            if (hoursOld < CACHE_TTL_HOURS) {
                return {
                    exists: true,
                    username: cached.username,
                    avatar: cached.avatar_url,
                    fromCache: true
                }
            }
        }
        return null
    } catch {
        return null
    }
}

async function getFromUsersErrors(username) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/users_errors?username=eq.${username}&select=username,avatar_url`,
            {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                }
            }
        )
        const data = await response.json()

        if (data && data.length > 0 && data[0].avatar_url) {
            return {
                exists: true,
                username: data[0].username,
                avatar: data[0].avatar_url,
                fromManual: true
            }
        }
        return null
    } catch {
        return null
    }
}

async function updateAvatarEverywhere(username, avatarUrl) {
    try {
        // 1. Обновляем кэш
        await fetch(`${SUPABASE_URL}/rest/v1/threads_avatars_cache`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                username: username,
                avatar_url: avatarUrl,
                cached_at: new Date().toISOString()
            })
        })

        // 2. Адаптация: Обновляем основную таблицу профилей
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?handle=eq.${username}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                avatar_url: avatarUrl
            })
        })
    } catch (error) {
        console.error('Update avatar error:', error)
    }
}

async function fetchFromThreads(username) {
    const url = `https://www.threads.net/@${username}` // Фикс домена
    const { html, statusCode, finalUrl } = await fetchPage(url)

    if (!html || html.length < 100) return { exists: false, username, avatar: null }
    if (finalUrl && (finalUrl.includes('login') || finalUrl.includes('accounts'))) return { exists: false, username, avatar: null }
    if (html.includes('loginPage') || html.includes('"login"')) return { exists: false, username, avatar: null }
    if (html.includes('Page not found') || statusCode === 404) return { exists: false, username, avatar: null }

    let avatar = null
    let ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/)
    if (!ogMatch) ogMatch = html.match(/property='og:image'\s+content='([^']+)'/)
    if (!ogMatch) ogMatch = html.match(/content="([^"]+)"\s+property="og:image"/)

    if (ogMatch) {
        const ogImage = ogMatch[1].replace(/&amp;/g, '&')
        // Фильтрация логотипов
        if (!ogImage.includes('threads-logo') &&
            !ogImage.includes('threads_app') &&
            !ogImage.includes('static.cdninstagram.com') &&
            !ogImage.includes('rsrc.php')) {
            avatar = ogImage
        }
    }

    // Fallback к twitter:image
    if (!avatar) {
        const twitterMatch = html.match(/name="twitter:image"\s+content="([^"]+)"/)
        if (twitterMatch) {
            const twitterImage = twitterMatch[1].replace(/&amp;/g, '&')
            if (!twitterImage.includes('threads-logo') && !twitterImage.includes('rsrc.php')) {
                avatar = twitterImage
            }
        }
    }

    // Последний шанс: profile_pic_url в JSON
    if (!avatar) {
        const jsonMatch = html.match(/"profile_pic_url":"([^"]+)"/)
        if (jsonMatch) {
            const jsonUrl = jsonMatch[1].replace(/\\u0026/g, '&')
            if (!jsonUrl.includes('threads-logo') && !jsonUrl.includes('rsrc.php')) {
                avatar = jsonUrl
            }
        }
    }

    const hasOgTitle = html.includes('og:title')
    const hasUsername = html.includes(`@${username}`) || html.includes(`"${username}"`)
    const exists = statusCode === 200 && !!(avatar || hasOgTitle || hasUsername)

    return { exists, username, avatar }
}

async function proxyImage(imageUrl, res) {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'image/*',
                'Referer': 'https://www.instagram.com/'
            },
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            return res.redirect(302, imageUrl)
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=86400')
        res.setHeader('Access-Control-Allow-Origin', '*')

        return res.send(buffer)
    } catch (error) {
        return res.redirect(302, imageUrl)
    }
}

function makeProxyUrl(avatarUrl, req) {
    if (!avatarUrl) return null

    if (avatarUrl.includes('cdninstagram.com') || avatarUrl.includes('fbcdn.net')) {
        const protocol = req.headers['x-forwarded-proto'] || 'http'
        const host = req.headers['host']
        return `${protocol}://${host}/api/get-avatar?proxy=1&url=${encodeURIComponent(avatarUrl)}`
    }

    return avatarUrl
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')

    // 1. Прокси запрос
    if (req.query.proxy === '1' && req.query.url) {
        const proxyUrl = decodeURIComponent(req.query.url)
        if (!isAllowedProxyUrl(proxyUrl)) {
            return res.status(403).json({ error: 'Proxy not allowed for this domain' })
        }
        return proxyImage(proxyUrl, res)
    }

    const username = req.query.username?.replace('@', '').trim().toLowerCase()
    if (!username) {
        return res.status(400).json({ error: 'No username' })
    }

    if (!isValidUsername(username)) {
        return res.status(400).json({ error: 'Invalid username format' })
    }

    try {
        // ШАГ 1: Проверяем кэш
        const cached = await getFromCache(username)
        if (cached) {
            return res.status(200).json({
                success: true,
                exists: true,
                handle: username,
                avatar: makeProxyUrl(cached.avatar, req),
                originalUrl: cached.avatar
            })
        }

        // ШАГ 2: Парсим Threads
        const result = await fetchFromThreads(username)

        // ШАГ 3: Если нашли аватарку — сохраняем
        if (result.exists && result.avatar) {
            await updateAvatarEverywhere(username, result.avatar)
            return res.status(200).json({
                success: true,
                ...result,
                handle: username,
                avatar: makeProxyUrl(result.avatar, req),
                originalUrl: result.avatar
            })
        }

        // ШАГ 4: Проверяем users_errors (ручные правки)
        const manual = await getFromUsersErrors(username)
        if (manual) {
            await updateAvatarEverywhere(username, manual.avatar)
            return res.status(200).json({
                success: true,
                ...manual,
                handle: username,
                avatar: makeProxyUrl(manual.avatar, req),
                originalUrl: manual.avatar
            })
        }

        // ШАГ 5: Не нашли
        return res.status(404).json({ exists: false, username, avatar: null, error: 'Настоящий аватар не найден' })

    } catch (error) {
        return res.status(500).json({ exists: false, username, avatar: null, error: error.message })
    }
}
