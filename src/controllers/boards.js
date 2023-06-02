// made by recanman
const MATCH_REPLIES_REGEX=new RegExp(/(?<=&gt;&gt;)\d+/g)
const MATCH_REPLY_LINK_REGEX=new RegExp(/"#p\d+"/, "g")

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

const SortThreads = (threads, board_code) => {
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

        let replyIndex = -1
        for (const reply of threads[index].last_replies) {
            replyIndex += 1
            if (!reply.com) {continue}

            const linkMatches = reply.com.match(MATCH_REPLY_LINK_REGEX)
            if (!linkMatches) {continue}

            let newReplyCom = reply.com.replace(MATCH_REPLY_LINK_REGEX, val => {
                return `"/${board_code}/thread/${thread.no}${val.replace('"', "")}"`
            })

            threads[index].last_replies[replyIndex].com = newReplyCom

            const replaceReplyRegex = new RegExp(`(?<=&gt;&gt;)${thread.no}`, "g")
            newReplyCom = reply.com.replace(replaceReplyRegex, `${thread.no} (OP)`)
            threads[index].last_replies[replyIndex].com = newReplyCom
        }

        index += 1
    }

    return threads
}

const OrganizeRepliesForThread = posts => {
    let replies = {}
    let thread = posts
    let mentions = {}

    let index = -1
    for (const post of posts) {
        index += 1
        if (!post.com) {continue}
        const matchedReplies = post.com.match(MATCH_REPLIES_REGEX)
        if (!matchedReplies) {continue}
        mentions[post.no] = matchedReplies

        const replaceReplyRegex = new RegExp(`(?<=&gt;&gt;)${post.resto}`, "g")
        thread[index].com = post.com.replace(replaceReplyRegex, `${post.resto} (OP)`)

        for (const replyNo of matchedReplies) {
            thread[index].com = post.com.replace(MATCH_REPLY_LINK_REGEX, val => {
                return `${val} id="link-mention-${val.replace("#p", "").replace('"', "")}"`
            })

            if (!replies[replyNo]) {
                replies[replyNo] = [post.no]
            } else {
                replies[replyNo].push(post.no)
            }
        }
    }

    index = 0
    for (const postReply of thread) {
        const postReplies = replies[postReply.no]
        const postMentions = mentions[postReply.no]

        thread[index].replies = postReplies
        thread[index].mentions = postMentions
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

            return resolve(SortThreads(pageInfo.threads, board_code))
        }

        fetch(`${process.env.API_BASE_URL}${board_code}/${process.env.API_CATALOG_ENDPOINT}`).then(result => {
            result.json().then(json => {
                const pageInfo = json[page - 1]
                if (!pageInfo) {
                    return reject()
                }

                cache.set(cacheKey, json)
                resolve(SortThreads(pageInfo.threads, board_code))
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