const auth_routing = require('./auth_routing');
const act_router = require('./action_routing');

const router = require('express').Router()

//merge and export router;
router.use("/", auth_routing);
router.use("/", act_router);

module.exports = router;

