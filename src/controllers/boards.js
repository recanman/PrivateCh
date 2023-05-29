// made by recanman
const TTLCache = require("@isaacs/ttlcache")
const cache = new TTLCache({max: 100, ttl: 15 * 1000})

const GetThreadsForBoard = async (board_code, page = 1) => {
    const cacheKey = `board:${board_code}:threads`

    return new Promise((resolve, reject) => {
        const cachedThreads = cache.get(cacheKey)
        if (cachedThreads) {
            const pageInfo = cachedThreads[page - 1]
            return resolve(pageInfo.threads)
        }

        fetch(`${process.env.API_BASE_URL}${board_code}/${process.env.API_CATALOG_ENDPOINT}`).then(result => {
            result.json().then(json => {
                cache.set(cacheKey, json)

                const pageInfo = json[page - 1]
                if (!pageInfo) {
                    return reject()
                }

                resolve(pageInfo.threads)
            }).catch(reject)
        }).catch(reject)
    })
}

module.exports = {
    GetThreadsForBoard
}