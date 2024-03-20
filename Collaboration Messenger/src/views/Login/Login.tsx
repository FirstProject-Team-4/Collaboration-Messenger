import './Login.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from '../../context/appContext';
import { loginUser } from '../../service/auth';
import { User } from '../../context/appContext';

/**
 * Represents the login component.
 * @component
 */
const Login = () => {
  const navigate = useNavigate();
  const { setContext } = useAppContext();
  const [error, setError] = useState(false);
  const [form, setForrm] = useState({
    email: '',
    password: ''
  })

  /**
   * Logs in the user.
   * @returns A Promise that resolves to void.
   */
  const login = async (): Promise<void> => {
    try {
      const response = await loginUser(form.email, form.password)
      setContext({ user: response.user as User | any, userData: null })
      navigate('/home')
    } catch (error: Error | any) {
      setError(true)
    }
  }

  return (
    <div className="login-view-img">
      <div className="login-view">
        <div className="login-form">
          <h2 id='login-h1'>Login</h2>
          <NavLink to='/register' id='register-link'>Register</NavLink>
          <br />
          {/* <NavLink to='/about' id='about-link'>About</NavLink> */}
          <label htmlFor="email" className='label-login'>✉ Email:</label><br />
          <input type="text" name='email' id='email' autoComplete='email' placeholder="✉ email..." value={form.email} onChange={(e) => { setForrm({ ...form, email: e.target.value }) }} /><br />
          <label htmlFor="password" className='label-login'>Password: </label><br />
          <input name='password' type="password" id='password' placeholder="🗝 password..." value={form.password} onChange={(e) => { setForrm({ ...form, password: e.target.value }) }} />
          {error && <p style={{ color: 'red' }}>Invalid email or password</p>}
          <div id='login-btn'>
            <button onClick={login} >Login</button>
          </div>
        </div>
      </div>
    </div>

  )
}
export default Login
