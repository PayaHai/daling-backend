/**
 * 事件管理器
 */
class Event {
    protected _eventList : Map<string, Function[]> = new Map()

    /**
     * 创建事件
     * @param name 事件名称
     */
    public create (name : string) : void {
        if ( !this._eventList.has(name) ) {
            this._eventList.set(name, [])
        }
    }

    /**
     * 触发事件
     * @param name 事件名称
     * @param args 参数
     */
    public trigger (name : string, ...args : any[]) : void {
        if ( this._eventList.has(name) ) {
            this._eventList.get(name).forEach(func => {
                func(...args)
            })
        }
    }

    /**
     * 监听事件
     * @param name 事件名称
     * @param func 回调函数
     */
    public listen (name : string, func : Function) : void {
        if ( this._eventList.has(name) ) {
            this._eventList.get(name).push(func)
        }
    }
}

export default Event