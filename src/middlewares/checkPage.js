// made by recanman
const {boardCodes, boardList} = require("../helpers/getBoards").GetBoards()

module.exports = (req, res, next) => {
    let {board_code, index} = req.params
    if (!index) {
        return res.sendStatus(400)
    }

    if (!boardCodes[board_code]) {
        res.sendStatus(400)
    } else {
        index = parseInt(index)

        if (isNaN(index)) {
            return res.sendStatus(400)
        } else if (index <= 0) {
            return res.sendStatus(400)
        } else if (index > boardList[board_code].pages) {
            return res.sendStatus(400)
        } else {
            next()
        }
    }
}