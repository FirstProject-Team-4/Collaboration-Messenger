import './Login.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from '../../context/appContext';
import { loginUser } from '../../service/auth';
import { User } from '../../context/appContext';


 const Login = () => {
    const navigate = useNavigate();
    const { setContext } = useAppContext();
    const [error, setError] = useState(false);

  const [form, setForrm] = useState({
    email: '',
    password: ''
  })

  const login = async (): Promise<void> => {
    try {
      const response = await loginUser(form.email, form.password)
      setContext({ user: response.user as User | any , userData: null })
      navigate('/about')
    } catch (error: Error | any) {
      setError(true)
    }
  }

  return (

    <div className="login-view">
      <div className="login-form">
        <h2 id='login-h1'>Login</h2>
        <label htmlFor="email" className='label'>Email: </label><br />
        <input type="text" name='email' id='email' autoComplete='email' placeholder="✉ email..." value={form.email} onChange={(e) => { setForrm({ ...form, email: e.target.value }) }} /><br />
        <label htmlFor="password" className='label'>Password: </label><br />
        <input name='password' type="password" id='password' placeholder="🗝 password..." value={form.password} onChange={(e) => { setForrm({ ...form, password: e.target.value }) }} />
        {error && <p style={{ color: 'red' }}>Invalid email or password</p>}
        <div id='login-btn'>
          <button onClick={login} >Login</button>
        </div>
      </div>
    </div>

  )
}
export default Login
