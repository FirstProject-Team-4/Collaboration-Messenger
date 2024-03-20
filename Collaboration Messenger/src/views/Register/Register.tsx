import { useState } from 'react';
import Button from '../../components/button/Button';
import { NavLink, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../service/auth';
import { createUserUsername } from '../../service/user';
import { CheckRegister } from '../../validations/register';
import './Register.css';
/**
 * Renders the RegisterView component.
 * 
 * @returns The JSX element representing the RegisterView component.
 */
export default function Register() {

  const nav = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState({
    username: '',
    email: '',
    password: ''

  });



  /**
   * Submits the registration form.
   * 
   * @returns A Promise that resolves to void.
   */
  const submit = async (): Promise<void> => {
    const { username, email, password } = await CheckRegister(form.username, form.email, form.password);
    console.log(username, email, password);

    if (username !== 'valid' || email !== 'valid' || password !== 'valid') {
      setError({ username: username, email: email, password: password });
      return;
    }

    try {
      console.log(form);
      const response = await registerUser(form.email, form.password);
      createUserUsername(form.username, response.user.uid, form.email);
      loginUser(form.email, form.password);
      nav('/home');
    } catch (error: any) {
      console.log(error);
      setError({ username: 'valid', password: 'valid', email: 'Email is already in use' });
      return;
    }
  };

  /**
   * Determines the color of the username/email/password based on the error state.
   * @returns The color as a string ('green', 'red', or 'black').
   */
  const errorColor = (property: string): string => {
    if (error[property as keyof typeof error] === 'valid') {
      return 'green';
    }
    if (error[property as keyof typeof error] !== '') {
      return 'red';
    }
    return 'black';
  };

  return (
    <div className="register-view">
      <div className="register-form">
        {/* <NavLink to='/about' id='about-link'>About</NavLink> */}
        <h2 id='register-h1'>Register</h2>
        <NavLink to='/login' id='login-link'>Login</NavLink>
        <label htmlFor="username">Username: </label><br />
        <input style={{ border: `1px solid ${errorColor(`username`)}` }} type="text" name='username' id='username' placeholder="☺ Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /><br />
        {error.username && error.username !== 'valid' && <h5 style={{ color: 'red' }}>{error.username}</h5>}
        <label htmlFor="email">Email: </label><br />
        <input style={{ border: `1px solid ${errorColor(`email`)}` }} type="text" name='email' id='email' placeholder="✉ email..." value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><br />
        {error.email && error.email !== 'valid' && <h5 style={{ color: 'red' }}>{error.email}</h5>}
        <label htmlFor="password">Password: </label><br />
        <input style={{ border: `1px solid ${errorColor(`password`)}` }} name='password' type="password" id='password' placeholder="🗝 password..." value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error.password && error.password !== 'valid' && <h5 style={{ color: 'red' }}>{error.password}</h5>}
        <div className='register-btn'>
          <Button onClick={submit} >Register</Button>
        </div>
      </div>
    </div>
  );

}