import fetch from 'node-fetch'

const args = {method: 'POST',}

export async function isValidToken (token) {
  const data = {
    valid: false,
    message: '',
  }

  if (!token) {
    data.message = 'Recaptcha token not found'
    return data
  }
  const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`, args)
  const recaptchaData = await recaptchaResponse.json();

  data.valid = recaptchaData && recaptchaData.success;
  if (!data.valid) {
    data.message = 'Invalid recaptcha token found';
  }
  return data;
}
