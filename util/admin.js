import { createInterface } from 'readline';
import promptSync from 'prompt-sync';

const prompt = promptSync({
  autocomplete: undefined,
  sigint: true, // Exits the terminal command execution if prompt receives CTRL + C,
  history: undefined,
});
import { addAdminUser, getUserBySearchParam, deleteAdminUser } from '../database/sqlite.js';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const passwordRequirements = [
  'Must be at least 8 characters long',
  'Must contain at least one lowercase letter',
  'Must contain at least one uppercase letter',
  'Must contain at least one number',
  'Must contain at least one special character (!@#$%^&*)'
];

const emailregex = /^[a-zA-Z0-9.!#$%&'*+\=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const emailMeetsRequirements = (value) => {
  return emailregex.test(value);
}

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
const passwordMeetsRequirements = (value) => {
  return passwordRegex.test(value);
}

export async function createAdministratorUser () {
  console.log("\x1b[36m Welcome to administrator user creation process! \x1b[0m")
  console.groupEnd();
  console.log(`\x1b[36m Password requirements: \x1b[0m`)
  console.group();
  for (const requirement of passwordRequirements) {
    console.log(`\x1b[36m ${requirement}. \x1b[0m`);
  }
  console.groupEnd();
  const userEmail = await prompt("\x1b[33m Enter your email: \x1b[0m");
  if (!emailMeetsRequirements(userEmail)) {
    console.log(`\x1b[31m Email does not meet the requirements. \x1b[0m`);
    return rl.close();
  }

  const user = await getUserBySearchParam({email: userEmail});
  if (user !== undefined) {
    console.log(`\x1b[31m User with email ${userEmail} already exists. \x1b[0m`);
    return rl.close();
  }

  const userPassword = await prompt.hide("\x1b[33m Enter your password: \x1b[0m");
  /*if (!passwordMeetsRequirements(userPassword)) {
    console.log(`\x1b[31m Password does not meet the requirements. \x1b[0m`);
    return rl.close();
  }*/

  const confirmPassword = await prompt.hide("\x1b[33m Confirm your password: \x1b[0m");
  if (userPassword !== confirmPassword) {
    console.log(`\x1b[31m Password and Confirm Password inputs do not match. \x1b[0m`);
    return rl.close();
  }

  const newUser = addAdminUser({email: userEmail, password: userPassword, role: 'admin'});
  if (!newUser) {
    console.log(`\x1b[31m Could not create a new admin user. \x1b[0m`);
    return rl.close();
  }

  console.log(`\x1b[32m User created successfully. \x1b[0m`);
  return rl.close();
};

export async function deleteAdministratorUser () {
  console.log("\x1b[36m Welcome to deletion of administrator user process! \x1b[0m");

  const userEmail = await prompt("\x1b[33m Enter your email: \x1b[0m");
  const user = await getUserBySearchParam({email: userEmail});
  if (user === undefined) {
    console.log(`\x1b[31m User with email ${userEmail} does not exist. \x1b[0m`);
    return rl.close();
  }

  console.log(`\x1b[35m You are about to delete a user: ${userEmail} \x1b[0m`);
  console.log("\x1b[35m Deleting a user is considered a dangerous action! \x1b[0m");
  const confirmationValue = await prompt("\x1b[33m Do you want to proceed? (To proceed, write yes)\x1b[0m");

  if (confirmationValue === 'yes') {
    const result = deleteAdminUser(userEmail);
    if (!result) {
      console.log(`\x1b[31m Could not delete user. \x1b[0m`);
      return rl.close();
    }
  
    console.log(`\x1b[32m User deleted successfully. \x1b[0m`);
    return rl.close();
  }
  return rl.close();
}
