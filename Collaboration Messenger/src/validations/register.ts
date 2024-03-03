import { getUserByUsername } from "../service/user";

export const CheckRegister = async(username:string ,email: string, password: string) => {
    const error = {
        username: '',
        email: '',
        password: ''
    };
    try {
        const checkUser = await getUserByUsername(username)
        
        if (username.length < 3 || username.length > 16) {
            error.username = 'Username must be between 4 and 16 symbols.';
        }
       else if (checkUser.exists()) {
          error.username = 'Username is already taken'
        }
        else {
          error.username = 'valid';
        }
      } catch (error) {
      }
      if (!email.includes('@')) {
       error.email = 'Email must be a valid email.';
      }
      else {
        error.email = 'valid';
      }
  
      if (password.length < 8 || password.length > 20) {
        error.password = 'Password must be between 6 and 20 symbols.';
      }
      else if (!/[A-Z]/.test(password)) {
        error.password = 'Password must contain at least one uppercase letter.';
      }
      else if (!/\d/.test(password)) {
        error.password = 'Password must contain at least one number.';
      }
      else {
        error.password = 'valid';
      }
      
      return error;
}
