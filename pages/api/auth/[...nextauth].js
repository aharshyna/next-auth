import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '../../../lib/db'
import { verifyPassword } from '../../../lib/auth'

export default NextAuth({
  session: { jwt: true },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const client = await connectToDatabase()

        const usersCollection = client.db().collection('users')
        console.log(usersCollection)
        const user = await usersCollection.findOne({ email: credentials.email })

        if (!user) {
          client.close()
          throw new Error('No user found!')
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        )

        if (!isValid) {
          client.close()
          throw new Error('Couldn`t log you in')
        }

        client.close()

        return { email: user.email }
      },
    }),
  ],
})