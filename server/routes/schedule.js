import express from 'express'
import { scheduleForUser } from '../controllers/scheduleController.js'

const router = express.Router()

// POST /api/schedule/:userId
router.post('/schedule/:userId', scheduleForUser)

export default router 