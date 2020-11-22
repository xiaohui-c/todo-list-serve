const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const models = require('../db/models')
const cors=require('cors')


const port = 3000
app.use(express.json());

// 解决跨域问题
app.use(cors({
    origin: "*",
    credentials:true
}))

app.use(bodyParser.json()); 
app.use(express.urlencoded());
app.use(bodyParser.urlencoded({
    extended: true
}));


/**新增todo**/
app.post('/create', async (req, res, next) => {
    try {
        let {
            name,
            deadline,
            content
        } = req.body;
        /**数据持久化到数据库**/
        let todo = await models.Todo.create({
            name,
            deadline,
            content
        })
        res.json({
            todo,
            message: '任务创建成功'
        })
    } catch (error) {
        next(error)
    }
})

/**修改todo**/
app.post('/update', async (req, res, next) => {
    try {
        let {
            name,
            deadline,
            content,
            id
        } = req.body;
        let todo = await models.Todo.findOne({
            where: {
                id
            }
        })
        if (todo) {
            // 执行更新
            todo = await todo.update({
                name,
                deadline,
                content,
            })
        }
        res.json({
            todo,
            message:'任务修改成功'
        })
    } catch (error) {
        next(error)
    }

})

/**修改，删除一个todo状态**/
app.post('/update_status', async (req, res, next) => {
    try {
        let {
            id,
            status
        } = req.body;
        let todo = await models.Todo.findOne({
            where: {
                id
            }
        })
        if (todo && status != todo.status) {
            // 执行更新
            todo = await todo.update({
                status
            })
        }
        res.json({
            todo,
            message:'任务状态修改成功'
        })
    } catch (error) {
        next(error)
    }
})

/**
 * 删除
 * **/
app.get('/delete/:id', async (req, res) => {
    let { id } = req.params;
    await models.Todo.destroy({
        where: {
          id
        }
    })
    res.json({
        message:'删除成功'
    })
})

/**查询用户列表**/
app.get('/list/:status/:page', async (req, res, next) => {
    let {
        status,
        page
    } = req.params;
    let limit = 3;
    let offset = (page - 1) * limit;
    let where = {};
    if (status != -1) {//如果前台传入-1,那么后台就不用筛选，直接查全部数据
        where.status = status;
    }
    // 1.状态 1：表示待办  2：完成   3：删除  -1:查全部
    // 2.分页的处理

    // 查询并汇集总数
    let list = await models.Todo.findAndCountAll({
        where,
        offset,
        limit
    })
    res.json({
        list,
        message: '列表查询成功'
    })
})

/**全局异常处理**/
app.use((err, req, res, next) => {
    if (err) {
        res.status(500).json({
            message: err.message
        })
    }
})

app.listen(port, () => {
    console.log('服务器启动成功');

})