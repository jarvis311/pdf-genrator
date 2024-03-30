const { genratePdf } = require('../controller/Pdf.controller')

const router = require('express').Router()




router.post('/genrate-pdf', genratePdf)

module.exports = router