import express from 'express'
import scheduleRoutes from './routes/schedule.js'

const app = express()
app.use(express.json())

// Mount the scheduling engine route
app.use('/api', scheduleRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

export default app 