// made by recanman
const MATCH_REPLIES_REGEX=new RegExp(/(?<=&gt;&gt;)\d+/gm)

const TTLCache = require("@isaacs/ttlcache")
const cache = new TTLCache({max: 100, ttl: 15 * 1000})

const SortByTimestamp = (object, field, reverse = false) => {
    return object.sort((a, b) => {
        const result = new Date(a[field]) < new Date(b[field])
        
        if (reverse) {
            return result ? -1 : 1
        } else {
            return result ? 1 : -1
        }
    })
}

const SortThreads = threads => {
    threads = SortByTimestamp(threads, "last_modified")

    threads = threads.sort((a, b) => {
        if (a.sticky && b.sticky) {
            return new Date(a.last_modified) < new Date(b.last_modified) ? 1 : -1
        } else if (a.sticky) {
            return -1
        } else if (b.sticky) {
            return 1
        }
    })

    let index = 0
    for (const thread of threads) {
        if (!thread.last_replies) {continue}
        threads[index].last_replies = SortByTimestamp(thread.last_replies, "time")

        index += 1
    }

    return threads
}

const OrganizeRepliesForThread = posts => {
    let replies = {}
    let thread = posts

    for (const post of posts) {
        const matchedReplies = MATCH_REPLIES_REGEX.exec(post.com)
        if (!matchedReplies) {continue}

        if (!replies[matchedReplies[0]]) {
            replies[matchedReplies[0]] = []
        }

        replies[matchedReplies[0]].push(post.no)
    }

    let index = 0
    for (const postReply of thread) {
        const postReplies = replies[postReply.no]
        if (!postReplies) {
            index += 1
            continue
        }

        thread[index].replies = postReplies
        index += 1
    }

    return thread
}

const GetThreadsForBoard = async (board_code, page = 1) => {
    const cacheKey = `board:${board_code}:threads`

    return new Promise((resolve, reject) => {
        const cachedThreads = cache.get(cacheKey)
        if (cachedThreads) {
            const pageInfo = cachedThreads[page - 1]
            if (!pageInfo) {
                cache.delete(cacheKey)
                return reject()
            }

            return resolve(SortThreads(pageInfo.threads))
        }

        fetch(`${process.env.API_BASE_URL}${board_code}/${process.env.API_CATALOG_ENDPOINT}`).then(result => {
            result.json().then(json => {
                const pageInfo = json[page - 1]
                if (!pageInfo) {
                    return reject()
                }

                cache.set(cacheKey, json)
                resolve(SortThreads(pageInfo.threads))
            }).catch(reject)
        }).catch(reject)
    })
}

const GetThreadForBoard = async (board_code, thread_id) => {
    const cacheKey = `board:${board_code}:thread:${thread_id}:info`

    return new Promise((resolve, reject) => {
        const cachedThread = cache.get(cacheKey)
        if (cachedThread) {
            return resolve(cachedThread)
        }

        fetch(`${process.env.API_BASE_URL}${board_code}/thread/${thread_id}.json`).then(result => {
            if (result.status == 404) {return reject()}

            result.json().then(json => {
                const thread = OrganizeRepliesForThread(SortByTimestamp(json.posts, "time", true))
                cache.set(cacheKey, thread)

                resolve(thread)
            }).catch(reject)
        })
    })
}

module.exports = {
    GetThreadsForBoard,
    GetThreadForBoard
}