## 文档碎片的理解与使用

​     [js中文档碎片的理解](https://www.cnblogs.com/suihang/p/9491359.html)

1. 理解：每次对dom的操作都会触发"重排"（重新渲染界面，发生重绘或回流），这严重影响到能耗，一般通常采取的做法是尽可能的减少 dom操作来减少"重排"   
2. 什么是文档碎片：document.createDocumentFragment()   一个容器，用于暂时存放创建的dom元素
3. 文档碎片有什么用？    将需要添加的大量元素  先添加到文档碎片中，再将文档碎片添加到需要插入的位置，大大 减少dom操作，提高性能（IE和火狐比较明显） 

## while(firstChild = el.firstChild)理解

[理解](https://www.cnblogs.com/suihang/p/9491359.html)

如果被插入的节点已经存在于当前文档的文档树中,则那个节点会首先从原先的位置移除,然后再插入到新的位置.

如果你需要保留这个子节点在原先位置的显示,则你需要先用Node.cloneNode方法复制出一个节点的副本,然后在插入到新位置

## textContent /innerText / innerHtml 理解

[textContent和innerText以及innerHTML的区别](https://blog.csdn.net/qq_39207948/article/details/86099905)

1. textContent：通过textContent属性获取可以获取指定节点的文本，以及该指定节点所包含后代节点中文文本内容，也包括<script>和<style>元素中的内容（这里的不是文本而是css样式和js代码）
2. innerText: 会获取指定节点的文本已经后代节点的文本，但不能获取<script>和<style>元素中的内容
3. innerHtml：就是获取指定元素内的HTML内容



textContent /innerText / innerHtml  的区别与差异

1. textContent 属性可以获取指定节点的文本及其后代节点中文本内容，也包括<script>和<style>元素中的内容；

   innerText 也是获取指定节点的文本及其后代节点中文本内容，但是不能获取到<script>和<style>元素中的内容

   innerHTML是获取HTML文本结构内容

2. <font color=#FF0000> textContent 会获取display：none的节点文本；而innerText好像会感知节点是否存在一样，但是不做返回。 也就是说，textContent 能够获取到元素的所有节点上的文本，不管这个节点是否呈现；而innerText只返回呈现到页面上的文本</font>

3. 要注意设置文本是被替换的不仅仅只有文本，这时textContent 、innerText属性相当于innerHTML属性，会把指定节点下的所有子节点一并替换掉

4. 由于innerText 受 CSS样式的影响，它会触发重排（reflow），textContent 不会。

## 深入浅出Object.defineProperty()

[深入浅出Object.defineProperty()](https://www.jianshu.com/p/8fe1382ba135)

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

1. 语法说明

   ​	Object.defineProperty()的作用就是直接在一个对象上定义一个新属性，或者修改一个已经存在的属性

   ```js
   Object.defineProperty(obj,prop,desc)
   ```

   ​	obj：需要定义属性的当前对象

   ​	prop： 当前需要定义的属性名

   ​	desc:	属性描述符

   ​	一般通过为对象的属性赋值的情况下，对象的属性可以修改也可以删除，但是通过Object.defineProperty()定义属性，通过描述符的设置可以进行更精确的控制对象属性。

   

2.  属性的特性已经内部属性

   js有三种类型的熟悉

   a. 命名数据属性：拥有一个确定的值的属性。这也是最常见的属性

   b. 命名访问器属性：通过`getter`和`setter`进行读取和赋值的属性

   c. 内部属性：由JavaScript引擎内部使用的属性，不能通过JavaScript代码直接访问到，不过可以通过一些方法间接的读取和设置。比如，每个对象都有一个内部属性`[[Prototype]]`，你不能直接访问这个属性，但可以通过`Object.getPrototypeOf()`方法间接的读取到它的值。虽然内部属性通常用一个双中括号包围的名称来表示，但实际上这并不是它们的名字，它们是一种抽象操作，是不可见的，根本没有上面两种属性有的那种字符串类型的属性

   

3.  属性描述符

   通过Object.defineProperty()为对象定义属性，有两种形式，且不能混合使用，分别为<font color=#FF0000>数据描述符</font>，<font color='#FF0000'>存取描述符</font>。

   

4. 数据描述符

   特有的属性 value  writable（是否可写入）

   ```js
   let person = {}
   Obejct.defineProperty(Person,'name',{
       value:'张三'，
       writable：true //是否可以改变
   })
   ```

5. 存取描述符 

   特有属性 ：get set 

   get : 一个属性提供 ‘getter’ 的方法，如果没有getter则为undefined。该方法返回值被用作属性值，默认为undefined

   set：一个给属性提供 ‘setter’的方法，如果没有setter则为undefined。该方法将接受唯一参数，并将该参数的新值分配给该属性。默认只是undefined

   ```js
    let Person = {}
    let temp = null
    Object.defineProperty(Person,'name',{
        get:function(){
            return temp
        },
        set:function(val){
            temp = val
        }
    })
   
   Person.name='张三'
   console.log(Person.name)  //张三
   ```

   

6. 数据描述符和存取描述符均具有以下描述符

   configrable ： 描述属性是否可配置 ，以及可否删除

   enumerable： 描述属性是否会出现在for in 或者 Obejct.keys( )的遍历中