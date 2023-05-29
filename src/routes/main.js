// made by recanman
const {Router} = require("express")
const router = Router()

const {boards, boardList} = require("../helpers/getBoards").GetBoards()
const CheckBoard = require("../middlewares/checkBoard")

const BoardsController = require("../controllers/boards")

router.get("/", (req, res) => res.render("index", {boards: boards}))

router.get("/:board_code/", CheckBoard, async (req, res, next) => {
    const {board_code} = req.params

    BoardsController.GetThreadsForBoard(board_code, 1).then(result => {
        res.render("board", {board: boardList[board_code], page: 1, threads: result})
    }).catch(err => next(err))
})


router.get("/:board_code/:index", CheckBoard, async (req, res) => {
    const {board_code, index} = req.params
    res.sendStatus(200)
})

router.get("/:board_code/:thread_id", CheckBoard, (req, res) => {
    const {board_code, thread_id} = req.params
    res.sendStatus(200)
})

router.get("/threads/:thread_id", CheckBoard, (req, res) => {
    const {board_code, thread_id} = req.params
    res.sendStatus(200)
})

module.exports = router