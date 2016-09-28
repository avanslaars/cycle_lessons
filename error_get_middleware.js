'use strict'

module.exports = function (req, res, next) {
    if(req.method == 'DELETE' && req.url.match(/\d/)[0] == 5){
        res.status(500).send('Error deleting stuff')
    } else {
        next()
    }
    // if(req.method === 'DELETE') {
    //     res.status(500).send('Error deleting stuff')
    // } else {
    //     next()
    // }
}
