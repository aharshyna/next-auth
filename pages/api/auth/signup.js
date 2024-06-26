import { hashPassword } from '../../../lib/auth'
import { connectToDatabase } from '../../../lib/db'

async function handler(req, res) {
  if (req.method !== 'POST') return

  const data = req.body

  const { email, password } = data

  if (
    !email ||
    !email.includes('@') ||
    !password ||
    password.trim().length < 7
  ) {
    res.status(422).json({ message: 'Invalid input' })
  }

  const client = await connectToDatabase()

  const db = client.db() // getting access to a db

  const existingUser = await db.collection('users').findOne({ email: email })

  if (existingUser) {
    res.status(422).json({ message: 'User already exists' })
    client.close() // closing db connection
    return
  }

  const hashedPassword = await hashPassword(password)

  const result = await db
    .collection('users')
    .insertOne({ email: email, password: hashedPassword })

  res.status(201).json({ message: 'User created' })
  client.close()
}

export default handler
