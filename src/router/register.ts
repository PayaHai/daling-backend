import axios from "axios"
import crypto from "crypto"

import Event from "../Event.js"
import MongoDB from "../MongoDB.js"
import Logger from "../Logger.js"
import Config from "../Config.js"

const logger : Logger = new Logger("Register")
const RegisterConf : Config = new Config("Register")

let CFToken_Key = RegisterConf.init("CFToken_Key", "***", () => logger.warn("初始化 CFToken_Key 配置：***"))
let useIP = RegisterConf.init("useIP", false, () => logger.warn("初始化 useIP 配置：false"))

/**
 * 生成哈西 512 字符串
 * @param data 数据
 * @returns 哈西 512 字符串
 */
function getHash (data : string) : string {
    const hash = crypto.createHash("sha512")
    hash.update(data)
    return hash.digest('hex')
}

/**
 * 人机验证
 * @param CFToken CloudflareToken
 * @param ip IP
 */
function robotVerify (CFToken : string, ip : string) : Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            let data = {
                secret: CFToken_Key,
                response: CFToken,
                remoteip: ip
            }
            if (!useIP) {
                delete data.remoteip
            }
            
            const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', data)
        
            const { success, score, error_codes } = response.data
        
            if (success) {
                resolve({
                    success: success,
                    score: score,
                    error_codes: error_codes
                })
            } else {
                resolve({
                    success: success,
                    score: score,
                    error_codes: error_codes
                })
            }
        } catch (err) {
            reject(err)
        }
    })
}

export default async (router : any, en : Event, MongoDB_DB : MongoDB) => {
    router.post("/register", async (ctx : any) => {
        // 获取 post 参数
        let name = ctx.request.body.name
        let mail = ctx.request.body.mail
        let pwd = getHash(ctx.request.body.pwd)
        let CFToken = ctx.request.body.CFToken

        // 缺少参数
        if (!name || !mail || !pwd) {
            ctx.body = {
                code: 400,
                msg: "缺少参数。"
            }
            return
        }

        // 人机验证
        let robotVerifyRes = await robotVerify(CFToken, ctx.ip).catch(err => {
            logger.error("人机验证时出错：" + err)
            ctx.body = {
                code: 400,
                msg: "连接人机验证服务失败！"
            }
            return
        })
        if (!robotVerifyRes.success) {
            ctx.body = {
                code: 400,
                msg: "人机验证失败。"
            }
            return
        }

        // 插入
        await MongoDB_DB.add("users", {
            name: name,
            mail: mail,
            pwd: pwd,
            data: {
                "like": [], // 喜爱
                "history": [], // 历史纪录
                "session": [] // 会话
            }
        }).then(() => {
            ctx.body = {
                code: 200,
                msg: "注册成功。"
            }
        }).catch(err => {
            logger.error("数据库错误：" + err)
            ctx.body = {
                code: 400,
                msg: "数据库错误!"
            }
        })
    })
}