// made by recanman
const {Router} = require("express")
const router = Router()

const CheckBoard = require("../middlewares/checkBoard")

const StaticAssetsController = require("../controllers/static")

router.get("/", (req, res) => res.render("index", {boards: boards}))

router.get("/:board_code/:file_name", CheckBoard, async (req, res, next) => {
    const {board_code, file_name} = req.params

    StaticAssetsController.GetStaticAsset(res, `${process.env.CDN_BASE_URL}${board_code}/${file_name}`).catch(err => next(err))
})

router.get("/asset/:asset_type/:file_name(*)", async (req, res, next) => {
    const {file_name, asset_type} = req.params
    StaticAssetsController.GetStaticAsset(res, `${process.env.STATIC_CDN_BASE_URL}${asset_type}/${file_name}`).catch(err => next(err))
})

module.exports = router