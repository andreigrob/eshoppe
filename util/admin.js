import {createInterface} from 'readline'
import promptSync from 'prompt-sync'
import db from '../database/sqlite.js'
import colour from './colour.js'

const prompt = promptSync({sigint: true,})

const rl = createInterface({input: process.stdin, output: process.stdout,})

const passwordRequirements = [
  'Must be at least 8 characters long',
  'Must contain at least one lowercase letter',
  'Must contain at least one uppercase letter',
  'Must contain at least one number',
  'Must contain at least one special character (!@#$%^&*)',
]

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
function emailMeetsRequirements (value) {
  return emailRegex.test(value)
}

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/
function passwordMeetsRequirements (value) {
  return passwordRegex.test(value)
}

export async function createAdministratorUser () {
  colour.print(colour.darkGreen, "Administrator User Creation:")
  colour.print(colour.darkGreen, "Password requirements:")
  console.group()
  for (const requirement of passwordRequirements) {
    colour.print(colour.darkGreen, requirement + '.')
  }
  console.groupEnd()

  try {
    const userEmail = await prompt(colour.str(colour.orange, "Enter your email: "))
    if (!emailMeetsRequirements(userEmail)) {
      return colour.print(colour.red, "Email does not meet the requirements.")
    }
    const user = await db.getUserBySearchParam({email: userEmail});
    if (user) {
      return colour.print(colour.red, `User with email ${userEmail} already exists.`)
    }
    const userPassword = await prompt.hide(colour.str(colour.orange, "Enter your password:"))
    /*if (!passwordMeetsRequirements(userPassword)) {
      return printColour(red, "Password does not meet the requirements.")
    }*/
    const confirmPassword = await prompt.hide(colour.str(colour.orange, "Confirm your password:"))
    if (userPassword !== confirmPassword) {
      return colour.print(colour.red, "Password and Confirm Password do not match.")
    }
    const newUser = db.addAdminUser({email: userEmail, password: userPassword, role: 'admin',});
    if (!newUser) {
      return colour.print(colour.red, "Could not create new admin user.")
    }
    return colour.print(colour.green, "User created successfully.")
  }
  finally {
    rl.close()
  }
}

export async function deleteAdministratorUser () {
  colour.print(colour.darkGreen, "Deletion of administrator user:")
  const userEmail = await prompt(colour.str(colour.orange, "Enter your email:"))
  const user = await db.getUserBySearchParam({email: userEmail,})
  try {
    if (!user) {
      return colour.print(colour.red, `User with email ${userEmail} does not exist.`)
    }
    colour.print(colour.purple, `You are about to delete user: ${userEmail}`)
    const confirmationValue = await prompt(colour.str(colour.orange, "Do you want to proceed? (y/n)"))
    if (confirmationValue === 'y') {
      const result = db.deleteAdminUser(userEmail);
      if (!result) {
        return colour.print(colour.red, "Could not delete user.")
      }
      return colour.print(colour.green, "User deleted successfully.")
    }
  } finally {
    rl.close()
  }
}
