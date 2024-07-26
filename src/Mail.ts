import nodemailer from "nodemailer"

import fs from "fs"

import Logger from "./Logger.js"
import Config from "./Config.js"

const logger = new Logger("Mail")

const conf : Config = new Config("Mail")
const _host : string = conf.init("host", "smtpdm.aliyun.com", () => logger.warn("初始化 host 配置：smtpdm.aliyun.com"))
const _port : number = conf.init("port", 465, () => logger.warn("初始化 port 配置：465"))
const _secure : boolean = conf.init("secure", true, () => logger.warn("初始化 secure 配置：true"))
const _user : string = conf.init("user", "notify@daling.ac.cn", () => logger.warn("初始化 user 配置：notify@daling.ac.cn"))
const _pass : string = conf.init("pass", "***", () => logger.warn("初始化 pass 配置：***"))

export default class Mail {
    protected _transporter : nodemailer.Transporter
    protected _cache : Map<string, string> = new Map()

    /**
     * 创建邮件发送器
     */
    public constructor () {
        // 缓存 HTML 模板
        try {
            // 同步读取
            let templateFiles = fs.readdirSync("../../template")
        
            for (let file of templateFiles) {
                // 读取文件
                let data = fs.readFileSync(`../../template/${file}`, "utf8")
        
                // 缓存
                this._cache.set(file.split(".")[0], data)
                logger.debug(`读取模板文件：${file.split(".")[0]}`)
            }
        } catch (err) {
            logger.fatal(`读取模板文件时出现错误:${err}`)
        }

        // 创建邮件发送器
        this._transporter = nodemailer.createTransport({
            host: _host,
            port: _port,
            secure: _secure,
            auth: {
                user: _user,
                pass: _pass
            }
        })
    }

    /**
     * 发送验证码
     */
    public async sendVerificationCode (to : string, userName : string, operate : string, code : string) : Promise<void> {
        // 读取模板
        let html = this._cache.get("VerificationCode")

        // 替换模板
        html = html.replace(/{{name}}/g, userName)
        html = html.replace(/{{operate}}/g, operate)
        html = html.replace(/{{code}}/g, code)

        // 发送邮件
        await this._transporter.sendMail({
            from: `DalingAC 动漫 - 验证码<${_user}>`,
            to: to,
            subject: "DalingAC 动漫 - 验证码",
            html: html
        })
    }
}