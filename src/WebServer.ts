import Koa from "koa"
import cors from "@koa/cors"
import Router from "koa-router"
import bodyParser from "koa-bodyparser"
import Logger from "./Logger.js"

const logger = new Logger("WebServer")

/**
 * Web服务器
 */
class WebServer {
    protected _app : any;
    protected _router : any;

    /**
     * 创建Web服务器
     */
    public constructor () {
        this._app = new Koa()
        this._router = new Router()

        // 代理/CDN
        this._app.proxy = true

        // 监听所有请求
        this._app.use(async (ctx : any, next : Function) => {
            ctx.set("Content-Type", "application/json")

            logger.info(`${ctx.ip} ${ctx.method} ${ctx.url}`)

            await next()
        })
    }

    /**
     * 获取路由
     * @returns 路由
     */
    public getRouter () : any {
        return this._router
    }

    /**
     * 绑定中间件
     * @param middleware 中间件
     */
    public use (middleware : Function) : void {
        this._app.use(middleware)
    }

    /**
     * 监听端口
     * @param port 端口
     * @param hostname 主机名
     */
    public listen (port : number, hostname : string) : void {
        // 跨域
        this._app.use(cors({
            origin: '*', // 允许所有域名跨域访问
            allowMethods: "*", // 允许的 HTTP 请求方法
            allowHeaders: "*" // 允许的请求头
        }))

        // Post参数获取
        this._app.use(bodyParser())

        // 路由
        this._app.use(this._router.routes())

        // 404
        this._app.use(async (ctx : any, next : Function) => {
            ctx.status = 404
            ctx.body = {
                code: 404,
                msg: "接口不存在！"
            }
            await next()
        })

        // 启动
        this._app.listen(port, hostname)
        logger.info(`Web服务器已绑定端口：${port}`)
    }
}
export default WebServer