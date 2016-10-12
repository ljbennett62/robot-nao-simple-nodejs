var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    req.config.settingsStore.getSettings()
        .then(function (settings) {
            res.render('settings', {settings:JSON.stringify(settings, null, 2)});
        }, function (err) {
            res.render('settings', {settings:JSON.stringify(err)});
        });
});

module.exports = router;
