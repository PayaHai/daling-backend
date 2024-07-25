import { MongoClient } from "mongodb"
import Logger from "./Logger.js"

const logger : Logger = new Logger("MongoDB")

class MongoDB {
    protected _MongoDB : MongoClient

    /**
     * 连接 MongoDB
     * @param url 连接 URI
     * @param maxPoolSize 最大连接池大小
     * @param minPoolSize 最小连接池大小
     */
    public constructor (url : string, maxPoolSize : number = 20, minPoolSize : number = 3) {
        this._MongoDB = new MongoClient(url, { maxPoolSize , minPoolSize })

        this._MongoDB.connect().catch(err => {
            logger.fatal(`连接 MongoDB 时出现错误:${err}`)
        })
    }

    /**
     * 添加数据
     * @param collectionName 集合名称
     * @param data 数据
     * @returns Promise<void>
     */
    public async add (collectionName : string, data : Object | Array<Object>) : Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (Array.isArray(data)) {
                    await this._MongoDB.db().collection(collectionName).insertMany(data)
                } else {
                    await this._MongoDB.db().collection(collectionName).insertOne(data)
                }

                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

    /**
     * 查找数据
     * @param collectionName 集合名称
     * @param query 查询条件
     * @param limit 限制数量
     * @returns Promise<Array<Object>>
     */
    public async get (collectionName : string, query : Object, limit : number = 0) : Promise<Array<Object>> {
        return new Promise(async (resolve, reject) => {
            try {
                if (limit > 0) {
                    const result = await this._MongoDB.db().collection(collectionName).find(query).limit(limit).toArray()

                    resolve(result)
                } else {
                    const result = await this._MongoDB.db().collection(collectionName).find(query).toArray()

                    resolve(result)
                }
            } catch (err) {
                reject(err)
            }
        })
    }

    /**
     * 更新数据
     * @param collectionName 集合名称
     * @param query 查询条件
     * @param data 更新数据
     * @returns Promise<void>
     */
    public async set (collectionName : string, query : Object | Array<Object>, data : Object) : Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (Array.isArray(query)) {
                    await this._MongoDB.db().collection(collectionName).updateMany(query, { $set: data })
                } else {
                    await this._MongoDB.db().collection(collectionName).updateOne(query, { $set: data })
                }

                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

    /**
     * 删除数据
     * @param collectionName 集合名称
     * @param query 查询条件
     * @returns Promise<void>
     */
    public async remove (collectionName : string, query : Object | Array<Object>) : Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (Array.isArray(query)) {
                    await this._MongoDB.db().collection(collectionName).deleteMany(query)
                } else {
                    await this._MongoDB.db().collection(collectionName).deleteOne(query)
                }

                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }
}

export default MongoDB