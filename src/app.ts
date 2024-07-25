import Config from "./Config.js"
import Logger from "./Logger.js"
import Event from "./Event.js"
import MongoDB from "./MongoDB.js"
import WebServer from "./WebServer.js"
import fs from "fs"

async function main() {
    console.log(`Daling 后端开始加载...`)

    const mainConf : Config = new Config("Main")
    let LogLevel : number = mainConf.init("LogLevel", 4)

    const logger : Logger = new Logger("Main", LogLevel)

    logger.info(`正在加载事件管理器...`)
    const en : Event = new Event()
    en.create("system.start")

    logger.info(`正在加载 MongoDB 数据库...`)
    const MongoDB_Config : Config = new Config("MongoDB")
    const MongoDB_URL : string = MongoDB_Config.init("URL", "mongodb://mongo:5S8S7P@10.0.0.5:27017/daling", () => logger.warn("初始化 MongoDB URL 配置：mongodb://mongo:5S8S7P@10.0.0.5:27017/daling"))
    const MongoDB_MaxPoolSize : number = MongoDB_Config.init("MaxPoolSize", 20, () => logger.warn("初始化 MongoDB MaxPoolSize 配置：20"))
    const MongoDB_MinPoolSize : number = MongoDB_Config.init("MinPoolSize", 3, () => logger.warn("初始化 MongoDB MinPoolSize 配置：3"))
    const MongoDB_DB : MongoDB = new MongoDB(MongoDB_URL, MongoDB_MaxPoolSize, MongoDB_MinPoolSize)

    logger.info(`正在加载数Web服务器...`)
    const WebServer_Config : Config = new Config("WebServer")
    const WebServer_Port : number = WebServer_Config.init("Port", 8080, () => logger.warn("初始化 WebServer Port 配置：8080"))
    const WebServer_Hostname : string = WebServer_Config.init("Hostname", "0.0.0.0", () => logger.warn("初始化 WebServer Hostname 配置：0.0.0.0"))
    const WebServer_WS : WebServer = new WebServer()

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
    let router = WebServer_WS.getRouter()
    routerFiles.forEach(async routerFile => {
        const router_module = await import("./router/" + routerFile)
        router_module.default(router, en, MongoDB_DB)
        logger.info(`加载路由：${routerFile}`)
    })

    // 绑定 Web 服务器端口
    WebServer_WS.listen(WebServer_Port, WebServer_Hostname)
    en.trigger("system.start")

    logger.info(`Daling 后端加载完成！`)
}

await main().catch(err => {
    console.error(err)
})