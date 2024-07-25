/**
 * 请注意，此接口已废弃！
 */
import mysql from "mysql2"


/**
 * MySQL数据库
 */
class MySQL {
    protected _MySQL_Config : Object
    protected _MySQL : any

    /**
     * 创建MySQL数据库
     * @param host 主机地址
     * @param user 用户名
     * @param password 密码
     * @param database 数据库名称
     * @param connectionLimit 连接限制
     */
    public constructor (host : string, user : string, password : string, database : string, connectionLimit : number) {
        this._MySQL_Config = {
            host: host,
            user: user,
            password: password,
            database: database,
            connectionLimit: connectionLimit
        }

        this._MySQL = mysql.createPool(this._MySQL_Config)
    }

    /**
     * 执行SQL语句
     * @param sql SQL语句
     * @param params 参数
     */
    public executeSQL (sql : string, params? : any[]) {
        return new Promise((resolve, reject) => {
            this._MySQL.query(sql, params, (err: any, results: unknown) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            })
        })
    }
}
export default MySQL