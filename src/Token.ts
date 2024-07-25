import jwt from "jsonwebtoken"

import Config from "./Config.js"

const tokenConf : Config = new Config("Token")
const tokenSecret : string = tokenConf.init("tokenSecret", "114514")

export default class Token {
    public sign (uid : number, sessionID : string) : string {
        return jwt.sign({
            uid: uid
        }, tokenSecret, {
            expiresIn: "30d"
        })
    }
}