// made by recanman
const {boardCodes, boardList} = require("../helpers/getBoards").GetBoards()

module.exports = (req, res, next) => {
    let {board_code, index} = req.params
    if (!index) {
        throw new Error("Page number is required.")
    }

    if (!boardCodes[board_code]) {
        throw new Error("Board does not exist.")
    } else {
        index = parseInt(index)

        if (isNaN(index)) {
            throw new Error("Page number must be an integer.")
        } else if (index <= 0) {
            throw new Error("Page number must be bigger than 0.")
        } else if (index > boardList[board_code].pages) {
            throw new Error(`Page number too high. Maximum is ${boardList[board_code].pages}.`)
        } else {
            next()
        }
    }
}