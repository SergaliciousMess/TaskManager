import 'reactjs-popup/dist/index.css'
import './index.css'
import { useState, useEffect } from 'react'
import {supabase, domain, serverError} from "./constants.jsx"
import {TaskManager} from './TaskManager.jsx'

const home = "home"
const login = "login"
const register = "register"
const taskmanager = "taskmanager"
const changepw = "changepw"


async function signUp({email, password}) {
    return await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo: domain,
        },
    })
}

async function logIn({email, password}) {
    return await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })
}


async function changePassword({old_password, new_password}) {
    return await supabase.auth.updateUser({
        password: new_password,
        current_password: old_password,
    })
}


const Home = ({setScene}) => {
    return (
        <>
            <h1>Task Manager</h1>
            <div>
                <button className={"button"} id="task_button" onClick={() => setScene(login)}>Log in</button>
                <button className={"button"} id="task_button" onClick={() => setScene(register)}>Register</button>
            </div>
        </>
    )
}

const Login = ({setScene, logIn}) => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    return (
        <>
            <h3>Email:</h3>
            <div>
                <input id="input" type={"email"} disabled={loading} placeholder="Please enter your email" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <h3>Password:</h3>
            <div>
                <input id="input" type={"password"} disabled={loading} placeholder="Please enter your password" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
                <h4 id="error">{error}</h4>
            </div>
            <button className={"button"} id="task_button" disabled={loading} onClick={() => setScene(home)}>Go back</button>
            <button className={"button"} id="task_button" disabled={loading || email==='' || password ===''} onClick={() => {
                setLoading(true)
                setError('')
                logIn({email: email, password: password}).then((result) => {
                    if (result.error) {
                        setError('Invalid email or password')
                    }
                    setLoading(false)
                }, (error) => {
                    console.log(error)
                    setLoading(false)
                    setError('An error has occurred: Try again')
                })
            }
            }>Log in</button>
            {loading ? <div>Loading...</div> : null}
        </>
    )
}

const Register = ({setScene, signUp}) => {
    const [email, setEmail] = useState('')
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const checkPassword = () => {
        if (password1 === password2) {
            setError('')
            setLoading(true)
            let p = signUp({email:email, password:password1})
            p.then((result) => {
                if (result.error) {
                    setError('Something went wrong')
                } else {
                    alert("Check your email for a verification code!")
                }
                setLoading(false)
            }, (error) => {
                setError("An error has occurred: Try again")
                console.log(error)
            })
        } else {
            setError('Passwords do not match')
        }
    }
    return (
        <>
            <h3>Email:</h3>
            <div>
                <input id="input" type={"email"} disabled={loading} placeholder="Please enter your email" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <h3>Password:</h3>
            <div>
                <input id="input" type={"password"} disabled={loading} placeholder="Please enter your password" onChange={(e) => setPassword1(e.target.value)} />
            </div>
            <h3>Re-Enter Password:</h3>
            <div>
                <input id="input" type={"password"} disabled={loading} placeholder="Please enter your password" onChange={(e) => setPassword2(e.target.value)} />
            </div>
            <div>
                <h4 id="error">{error}</h4>
            </div>
            <button className={"button"} id="task_button" disabled={loading} onClick={() => setScene(home)}>Go back</button>
            <button className={"button"} id="task_button" disabled={loading || password1 === '' || password2 === '' || email === ''} onClick={checkPassword}>Create account</button>
            {loading ? <div>Loading...</div> : null}
        </>
    )
}

const ChangePassword = ({setScene, changePassword}) => {
    const [loading, setLoading] = useState(false)
    const [oldPassword, setOldPassword] = useState('')
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')
    const [error, setError] = useState('')
    function checkPassword() {
        if (password1 === password2) {
            setError('')
            setLoading(true)
            let p = changePassword({old_password: oldPassword, new_password:password1})
            p.then((result) => {
                if (result.error) {
                    setError('An error occurred:\n' + result.error.message)
                } else {
                    alert("Password changed!")
                    setLoading(false)
                }
            }, (error) => {
                setError(serverError)
                console.log(error)
            })
        } else {
            setError('Passwords do not match')
        }
    }
    return (
        <>
            <h3>Old Password:</h3>
            <div>
                <input id="input" type={"password"} placeholder="Please enter your password" onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <h3>New Password:</h3>
            <div>
                <input id="input" type={"password"} placeholder="Please enter your password" onChange={(e) => setPassword1(e.target.value)} />
            </div>
            <h3>Re-Enter New Password:</h3>
            <div>
                <input id="input" type={"password"}  placeholder="Please enter your password" onChange={(e) => setPassword2(e.target.value)} />
            </div>

            <div>
                <h4 id="error">{error}</h4>
            </div>
            <button className={"button"} id="task_button" onClick={() => setScene(taskmanager)}>Go back</button>
            <button className={"button"} id="task_button" disabled={loading || oldPassword === '' || password1 === '' || password2 === ''} onClick={checkPassword}>Change Password</button>
        </>
    )
}


const App = () => {
    const [scene, setScene] = useState(home)
    const [claims, setClaims] = useState(null)

    useEffect(() => {
        // Check for existing session using getClaims
        supabase.auth.getClaims().then(({ data: { claims } }) => {
            setClaims(claims)
            setScene(taskmanager)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            supabase.auth.getClaims().then(({ data: { claims } }) => {
                setClaims(claims)
                setScene(taskmanager)
            })
        })

        return () => subscription.unsubscribe()
    }, [])

    async function logOut() {
        setClaims(null)
        setScene(home)
        await supabase.auth.signOut()
    }

    return (
        <>
            {scene === home && <Home setScene={setScene}/>}
            {scene === changepw && <ChangePassword setScene={setScene} changePassword={changePassword}/>}
            {scene === register && <Register setScene={setScene} signUp={signUp}/>}
            {scene === login && <Login setScene={setScene} logIn={logIn}/>}
            {scene === taskmanager &&
                <>
                    <div>
                        <h1>Welcome to Task Manager</h1>
                    </div>
                    <div id={'account_header'}>
                        <button className='button' id='account_header' onClick={logOut}>Sign Out</button>
                        <button className='button' id='account_header' onClick={() =>{setScene(changepw)}}>Change Password</button>
                    </div>
                    {claims ? <TaskManager/> : <h3>Loading...</h3>}
                </>}
        </>
    )
}

export default App
