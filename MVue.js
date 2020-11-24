/*
 * @Description: 解析指令
 * @Author: wangyang
 * @Date: 2020-11-16 21:28:34
 * @LastEditors: wangyang
 * @LastEditTime: 2020-11-24 14:20:20
 */
const compileUtil = {
    //对表达式的处理 expr：msg（表达式）/person.fav 这两种情况都要处理
    /**
      expr：msg（表达式） 这种简单的 可以用 vm.$data[expr]
      expr：person.fav   这种较复杂  也要兼顾，所以用reduce 来处理
     */
    getVal(expr, vm) {
        return expr.split('.').reduce((data, currentVal) => {
            return data[currentVal]
        }, vm.$data)
    },
    setVal(expr, vm, inputVal) {
        return expr.split('.').reduce((data, currentVal) => {
            //将input中的值直接赋值给旧值
            data[currentVal] = inputVal
        }, vm.$data)
    },
    getContent(expr, vm) {
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getVal(args[1], vm)
        })
    },
    text(node, expr, vm) {
        let value;
        if (expr.indexOf('{{') !== -1) {
            /**
            node:当前为文本节点 {{}}
             */
            value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                //绑定观察者，将来数据发生变化 触发这里的回回调函数 从而更新页面
                new Watcher(vm, args[1], (newVal) => {
                    this.updater.textUpdater(node, this.getContent(expr, vm))
                })
                return this.getVal(args[1], vm)
            })
        } else {
            /**
             node:当前为元素节点 expr：msg（表达式）
                获取当前实例中的数据 vm.$data['msg']
                const value = vm.$data[expr] 不兼容 person.fav  弃用
             */
            value = this.getVal(expr, vm)

        }
        this.updater.textUpdater(node, value)
    },

    html(node, expr, vm) {
        const value = this.getVal(expr, vm)
        new Watcher(vm, expr, (newVal) => {
            this.updater.htmlUpdater(node, newVal)
        })
        this.updater.htmlUpdater(node, value)
    },
    model(node, expr, vm) {
        const value = this.getVal(expr, vm)
        //绑定更新函数 数据驱动视图  数据===>视图
        new Watcher(vm, expr, (newVal) => {
            this.updater.modelUpdater(node, newVal)
        })
        //  视图=>数据=>视图  input的数据双向邦定
        node.addEventListener('input', e => {
            //设置值
            console.log(' e.target.value', e.target.value);
            this.setVal(expr, vm, e.target.value)
        })
        this.updater.modelUpdater(node, value)
    },
    //处理事件
    on(node, expr, vm, eventName) {
        //从当前vue实例中获取对应的方法
        let fn = vm.$option.methods && vm.$option.methods[eventName]
        //这里的bind是将这个方法绑定到当前的vue实例上，就没有this的问题
        node.addEventListener(eventName, fn.bind(vm), false)
    },

    //updater 更新节点的函数
    updater: {
        textUpdater(node, value) {
            node.textContent = value
        },
        htmlUpdater(node, value) {
            node.innerHTML = value
        },
        modelUpdater(node, value) {
            node.value = value
        }
    }


}
class Compile {
    constructor(el, vm) {
        //判断传进来的el是一个元素节点对象还是字符串
        //如果是元素节点，把传进来的el赋值给Compile类的el，如果不是则找到这个了对应的元素节点赋值给Compile类的el
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm

        //1 获取文档碎片对象，放入内存中会减少页面的回流和重绘
        let fragment = this.node2Fragment(this.el)
        //2 编译模板
        this.compile(fragment)
        //3 追加子元素到根元素中
        this.el.append(fragment)
    }
    //编译模板
    compile(fragment) {
        //获取到每一个子节点
        let childNodes = fragment.childNodes;
        [...childNodes].forEach(child => {
            if (this.isElementNode(child)) {
                //是元素节点
                //编译元素节点
                this.compileElement(child)

            } else {
                //是文本节点
                //编译文本节点
                this.compileText(child)

            }
            //递归：如果子节点还有子元素，继续递归
            if (child.childNodes && child.childNodes.length) {
                this.compile(child)
            }

        })
    }
    //编译元素节点
    compileElement(node) {
        //获取的节点类似这种 <div v-text='msg'></div>
        //获取元素节点的属性
        let attributes = node.attributes;
        //获取到的attributes 是一个对象，强制转换成一个数
        [...attributes].forEach(attr => {
            //节点的属性名和属性值从属性中结构出来
            let {
                name,
                value
            } = attr
            //判断属性名是否是指令
            if (this.isDirective(name)) { //是一个指令v-text v-model v-on:click
                //将指令分割 逗号前面'v-'不要，只要后面的文本
                // let [, directive] = name.split('-')
                let directive = name.replace("v-", "") // text model on:click
                //dirName:指令名称 eventName：时间名称
                let [dirName, eventName] = directive.split(":") //text model on
                //更新数据  数据驱动视图
                compileUtil[dirName](node, value, this.vm, eventName)
                //删除有指令的标签上的属性 ===>控制台上就看不到这写指令v-text......
                node.removeAttribute('v-' + directive)

            } else if (this.isEventName(name)) {
                let eventName = name.replace('@', '')
                compileUtil['on'](node, value, this.vm, eventName)
            }
        })
    }
    //编译文本节点
    compileText(node) {
        const content = node.textContent
        //正则 匹配 {{ }}
        if (/\{\{(.+?)\}\}/.test(content)) {
            compileUtil['text'](node, content, this.vm)
        }
    }
    //判断属性名是否是指令
    isDirective(attrName) {
        //判断属性名是否是以'v-'开头
        return attrName.startsWith('v-')
    }
    //判断属性是否是事件
    isEventName(attrName) {
        return attrName.startsWith('@')
    }

    //将元素节点转换成文档碎片对象
    node2Fragment(el) {
        //创建文档碎片
        const f = document.createDocumentFragment()
        let firstChild;
        while (firstChild = el.firstChild) {
            f.append(firstChild)
        }
        return f
    }

    //用来判断参数是不是一个元素节点
    isElementNode(node) {
        /**
        nodeType 属性返回以数字值返回指定节点的节点类型。
        如果节点是元素节点， 则 nodeType 属性将返回 1。
        如果节点是属性节点， 则 nodeType 属性将返回 2
        */
        return node.nodeType === 1
    }
}

class MVue {
    constructor(options) {
        //构造函数，传递的参数（el/data/options）
        this.$el = options.el;
        this.$data = options.data;
        this.$option = options
        //判断传递过来的el是字符串还是节点
        if (this.$el) {
            //1.实现一个数据的观察者
            new Observer(this.$data)
            //2.实现一个指令的解析器
            //2.1 Compile传递当前的节点还有当前的实例
            new Compile(this.$el, this)
            this.proxyData(this.$data)
        }
    }
    proxyData(data) {
        for (let key in data) {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newVal) {
                    data[key] = newVal
                }
            })
        }
    }
}