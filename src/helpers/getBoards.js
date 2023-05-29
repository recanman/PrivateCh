// made by recanman
let boards
const boardCategories = require("../../config/boards.json")

let boardCodes = {}
let boardList = {}

Object.keys(boardCategories).forEach(category => {
    boardCategories[category].boards.forEach(board => {
        boardCodes[board.code] = category
    })
})

const GetBoards = async () => {
    console.log("Getting boards...")

    return new Promise(resolve => {
        fetch(`${process.env.API_BASE_URL}${process.env.API_BOARDS_ENDPOINT}`).then(res => {
            res.json().then(json => {
                console.log("\tDone.")
                boards = {}

                Object.keys(boardCategories).forEach(category => {
                    boards[category] = []
                })

                Object.keys(json.boards).forEach(board => {
                    board = json.boards[board]
                    boardList[board.board] = board

                    const category = boardCodes[board.board]
                    if (!category) {
                        console.error(`\tThe board ${board.board} is not categorized! Adding to uncategorized category.`)
                        boards.Uncategorized = boards.Uncategorized || [board]
                    } else {
                        console.log(`\tBoard ${board.board} is in category ${category}.`)
                        boards[category].push(board)
                    }
                })
                
                resolve()
            })
        }).catch(() => {
            console.error("Failed to get boards, trying again...")
            GetBoards()
        })
    })
}

module.exports = {
    RunGetBoards: GetBoards,
    GetBoards: () => {
        if (!boards) {
            throw new Error("Tried to access boards before it is fetched.")
        }

        return {boards, boardList, boardCodes}
    }
}