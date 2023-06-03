// made by recanman
const {boardCodes} = require("../helpers/getBoards").GetBoards()

module.exports = (req, res, next) => {
    const {board_code} = req.params
    if (!board_code) {
        throw new Error("Board code is required.")
    }

    if (!boardCodes[board_code]) {
        throw new Error("Board does not exist.")
    } else {
        next()
    }
}