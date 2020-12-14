const express = require('express')
const app = express()


const node_admin = require('./app')
const {app_admin, checkAuthenAPI} = node_admin(require('/home/abjb/workspace/configs/node-admin-config.json'), '/ashwin')

app.use('/ashwin', app_admin)


const port = process.env.PORT || 5000;
app.listen(port, () => {
    `Server running on port ${port} 🔥`
});