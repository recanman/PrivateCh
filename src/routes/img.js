// made by recanman
const {Router} = require("express")
const router = Router()

const CheckBoard = require("../middlewares/checkBoard")

const ImagesController = require("../controllers/img")

router.get("/", (req, res) => res.render("index", {boards: boards}))

router.get("/:board_code/:file_name", CheckBoard, async (req, res, next) => {
    const {board_code, file_name} = req.params

    ImagesController.GetImage(res, board_code, file_name).catch(err => next(err))
})

module.exports = router