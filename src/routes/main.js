// made by recanman
const {Router} = require("express")
const router = Router()

const {boards, boardList} = require("../helpers/getBoards").GetBoards()
const CheckBoard = require("../middlewares/checkBoard")
const CheckPage = require("../middlewares/checkPage")

const BoardsController = require("../controllers/boards")

router.get("/", (req, res) => res.render("index", {boards: boards}))

router.get("/search", (req, res) => res.render("search"))
router.post("/search", async (req, res, next) => {
    const {query} = req.body
    if (typeof(query) != "string") {return next("Query must be a string.")}

    BoardsController.Search(query).then(result => {
        res.render("search", {search: {count: result.nhits || 0, threads: result.threads, query}})
    }).catch(err => next(err))
})

router.get("/:board_code/", CheckBoard, async (req, res, next) => {
    const {board_code} = req.params

    BoardsController.GetThreadsForBoard(board_code, 1).then(result => {
        res.render("board", {board: boardList[board_code], current_page: 1, threads: result})
    }).catch(err => next(err))
})

router.get("/:board_code/search", CheckBoard, (req, res) => {
    const {board_code} = req.params
    res.render("board_search", {board: boardList[board_code]})
})
router.post("/:board_code/search", CheckBoard, async (req, res, next) => {
    const {board_code} = req.params
    const {query} = req.body

    if (typeof(query) != "string") {return next("Query must be a string.")}
    BoardsController.Search(query, board_code).then(result => {
        res.render("board_search", {board: boardList[board_code], search: {count: result.nhits || 0, threads: result.threads, query}})
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