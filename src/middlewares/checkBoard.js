// made by recanman
const {boardCodes} = require("../helpers/getBoards").GetBoards()

module.exports = (req, res, next) => {
    const {board_code} = req.params
    if (!board_code) {
        return res.sendStatus(400)
    }

    if (!boardCodes[board_code]) {
        res.sendStatus(400)
    } else {
        next()
    }
}