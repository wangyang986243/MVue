/*
 * @Description: 劫持监听所有属性
 * @Author: wangyang
 * @Date: 2020-11-19 10:23:15
 * @LastEditors: wangyang
 * @LastEditTime: 2020-11-19 16:55:08
 */

class Observer {
	constructor(data) {
		//观察数据
		this.observe(data)
	}
	observe(data) { //这里观察的数据仅仅是一个对象
		/**
		 {
			 person:{
				 name:'好好先生'，
				 fav:{
					 a:'看书'，
					 b:'其他'
				 }
			 }
		 }
		 */
		if (data && typeof data == 'object' && !Array.isArray(data)) {
			Object.keys(data).forEach(key => {
				//响应方法
				this.defineReactive(data, key, data[key])
			})
		}

	}
	//响应方法
	defineReactive(obj, key, value) {
		// 这里的value可能还是一个对象,所以还是需要递归遍历
		this.observe(value)
		//开始劫持数据
		Object.defineProperty(obj, key, {
			enumerable: true, //是否可枚举
			configurable: false,
			get() {
				//订阅数据变化时，往Dep（订阅器）中添加观察者/订阅者 观察数据是否发生变化，如果发生变化，回调相应的函数，去更新视图
				return value
			},
			// set(newVal){
			set: (newVal) => {
				//如果在某一时间点更改数据之前，更改了data对象，更改了某个属性，就无法监听到这个新值。 这个时候就要对更改的新值重新监听一下
				//这里的this指向还有问题 这里是普通的函数，所以this指向object，但是当前函数中没有observe的方法，所以我们要将set方法改写成箭头函数,箭头函数没有this，所以this就会往上找
				this.observe(newVal)
				if (newVal !== value) {
					value = newVal
				}
			}
		})

	}
}