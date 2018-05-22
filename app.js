const express = require('express')
const app = express()

app.use('/static', express.static('assets'))

app.get('/', (req, res) => res.sendFile('/Users/macbook/Documents/Work/Phaser/index.html'))

app.listen(8080, () => console.log('Example app listening on port 3000!'))
