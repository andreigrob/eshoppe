import session from 'express-session'
import sqlite from 'better-sqlite3'
import sqlSession from 'better-sqlite3-session-store'

const Session = sqlSession(session)

const db = new sqlite(process.env.SQLITE_DB)

const store = new Session({
  client: db,
})

const sqliteSessionProvider = session({
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
})

export default sqliteSessionProvider
