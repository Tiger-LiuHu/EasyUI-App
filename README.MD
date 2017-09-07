# 目录结构说明

------


```
├── APP-DEMO （项目名字）
    ├── common (公共模板)
        ├── layout
            ├── header.html
            ├── footer.html
        ....
    ├── Index （模块名）
        ├── index（功能）
            ├── index.html（模板）
        ....
    ├── assets （资源目录）
        ├── css
            ├── common.css （项目私有公共css）
            ├── module
                ├── home.css
        ├── img
            ├── home （模块名）
               ....
        ├── js
            ├── components
                ├── home （模块名）
                    ├── indexHome.js (模块业务逻辑)
                    ....
            ├── libs （第三方库）
            ├── util （私有库）
            ├── common.js （公共文件）
            ├── config.js （配置文件）
            ├── app.js （公共入口文件）
├── public（公共资源目录，不允许修改）
```         
