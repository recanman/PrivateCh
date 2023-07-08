// made by recanman
const {Router} = require("express")
const router = Router()

const {boards, boardList} = require("../helpers/getBoards").GetBoards()
const CheckBoard = require("../middlewares/checkBoard")
const CheckPage = require("../middlewares/checkPage")

const BoardsController = require("../controllers/boards")

router.get("/", (req, res) => res.render("index", {boards: boardList}))

router.get("/:board_code/", CheckBoard, async (req, res, next) => {
    const {board_code} = req.params

    BoardsController.GetThreadsForBoard(board_code, 1).then(result => {
        res.render("board", {board: boardList[board_code], current_page: 1, threads: result})
    }).catch(err => next(err))
})

router.get("/:board_code/:index", CheckBoard, CheckPage, async (req, res, next) => {
    const {board_code, index} = req.params

    BoardsController.GetThreadsForBoard(board_code, index).then(result => {
        res.render("board", {board: boardList[board_code], current_page: index, threads: result})
    }).catch(err => next(err))
})

router.get("/:board_code/thread/:thread_id", CheckBoard, async (req, res, next) => {
    const {board_code, thread_id} = req.params

    BoardsController.GetThreadForBoard(board_code, thread_id).then(result => {
        res.render("thread", {board: boardList[board_code], posts: result})
    }).catch(err => next(err))
})

module.exports = router