import Logger from "./Logger.js"
import Event from "./Event.js"
import MongoDB from "./MongoDB.js"
import WebServer from "./WebServer.js"
import fs from "fs"

async function main() {
    console.log(`Daling 后端开始加载...`)

    const logger : Logger = new Logger("Main")

    logger.info(`正在加载事件管理器...`)
    const en : Event = new Event()
    en.create("system.start")

    logger.info(`正在加载 MongoDB 数据库...`)
    const MongoDB_DB : MongoDB = new MongoDB()

    logger.info(`正在加载数Web服务器...`)
    const _WebServer : WebServer = new WebServer()

    logger.info(`正在加载路由...`)
    // 获取./router 文件夹下所有 ts 文件
    const files = fs.readdirSync("./router")
    let routerFiles = []
    for (let i = 0; i < files.length; i++) {
        if (files[i].endsWith(".js")) {
            routerFiles.push(files[i])
        }
    }

    // 添加路由
    let router = _WebServer.getRouter()
    routerFiles.forEach(async routerFile => {
        const router_module = await import("./router/" + routerFile)
        router_module.default(router, en, MongoDB_DB)
        logger.info(`加载路由：${routerFile}`)
    })

    en.trigger("system.start")

    logger.info(`Daling 后端加载完成！`)
}

await main().catch(err => {
    console.error(err)
})