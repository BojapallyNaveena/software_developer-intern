const express = require('express');
const router = express.Router();
const { loginUser, getUsers } = require('../controllers/authController');

router.post('/login', loginUser);
router.get('/users', getUsers);

module.exports = router;
