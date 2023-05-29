// made by recanman
const dotenv = require("dotenv")
const express = require("express")
const {join, extname} = require("path")
const {readdirSync} = require("fs")
const nunjucks = require("nunjucks")
const moment = require("moment")
const cookieParser = require("cookie-parser")
dotenv.config()

const app = express()
app.disable("x-powered-by")

if (process.env.TRUST_PROXY) {
    app.set("trust proxy", process.env.TRUST_PROXY)
}

app.use(express.static(join(__dirname, "views/assets")))
app.set("view engine", "njk")

app.use((req, res, next) => {
    const render = res.render

    res.render = (view, options = {}, callback) => {
        options.site = options.site || {}
        options.site.APP_NAME = process.env.APP_NAME
        render.call(res, view, options, callback)
    }

    next()
})

const nunjucksEnv = nunjucks.configure(join(__dirname, "views"), {
    autoescape: false,
    express: app,
    watch: true
})

nunjucksEnv.addFilter("formatDate", date => {
    return moment.unix(date).fromNow()
})

nunjucksEnv.addFilter("split", (string, separator) => {
    return string[0].split(separator)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(cookieParser())

const routeFiles = readdirSync("src/routes").filter(file => {
    return extname(file).toLowerCase() == ".js"
})

require("./helpers/getBoards").RunGetBoards().then(() => {
    routeFiles.forEach(file => {
        const splitName = file.split(".")
        const routeName = splitName[0]
        if (routeName == "main") {return}
    
        console.log(`Loading route ${routeName}...`)
        app.use(`/${routeName}`, require(`./routes/${routeName}`))
        console.log("\tDone.")
    })
    
    console.log("Loading main route...")
    app.use("/", require("./routes/main"))
    console.log("\tDone.")

    app.listen(process.env.PORT, () => {
        console.log(`Server is listening on port ${process.env.PORT}`)
    })
})

module.exports = app