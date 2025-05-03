import { runSchedulingEngine } from '../services/engine.js'

export async function scheduleForUser(req, res) {
  const userId = req.params.userId
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' })
  }
  try {
    const result = await runSchedulingEngine(userId)
    if (!result || result.length === 0) {
      return res.status(200).json({ message: 'No study blocks scheduled (no tasks or no availability)' })
    }
    return res.status(200).json({ scheduled: result })
  } catch (err) {
    console.error('Engine error:', err)
    return res.status(500).json({ error: 'Failed to run scheduling engine' })
  }
} 