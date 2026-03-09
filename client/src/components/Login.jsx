import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const {setShowLogin, axios, setToken, navigate, setActiveRole} = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [roles, setRoles] = React.useState(["renter"]); // for register: can select multiple
    const [sessionRole, setSessionRole] = React.useState("renter"); // for login UI role

    const toggleRegisterRole = (r) => {
        setRoles(prev => {
            if (prev.includes(r)) {
                const next = prev.filter(x => x !== r);
                const nextRoles = next.length ? next : [r];
                setSessionRole(s => nextRoles.includes(s) ? s : nextRoles[0]);
                return nextRoles;
            }
            // Adding role: default "Go to" to the new role
            setSessionRole(r);
            return [...prev, r];
        });
    };

    const onSubmitHandler = async (event)=>{
        try {
            event.preventDefault();

            const payload = state === "register"
                ? {name, email, password, roles: roles.length ? roles : ["renter"]}
                : {email, password};

            const {data} = await axios.post(`/api/user/${state}`, payload)

            if (data.success) {
                if (data.message) toast.success(data.message)
                // Set token in header & storage for fetch - don't update context yet
                // so fetchUser won't run and overwrite activeRole before we set it
                try {
                    sessionStorage.setItem('token', data.token)
                } catch (_) {}
                axios.defaults.headers.common['Authorization'] = data.token

                const { data: userData } = await axios.get('/api/user/data')
                if (userData?.success) {
                    const u = userData.user
                    const primaryRole = u.role
                    const backendRoles = Array.isArray(u.roles) && u.roles.length
                      ? u.roles
                      : (primaryRole ? [primaryRole] : [])

                    const normalize = (r) => r === 'user' ? 'renter' : r === 'owner' ? 'client' : r
                    const normalized = backendRoles.map(normalize)

                    let chosen = sessionRole
                    if (!normalized.includes(chosen)) {
                        if (normalized.includes('client')) chosen = 'client'
                        else if (normalized.includes('driver')) chosen = 'driver'
                        else if (normalized.includes('renter')) chosen = 'renter'
                        else chosen = normalized[0] || 'renter'
                    }

                    setActiveRole(chosen)
                    setToken(data.token)
                    setShowLogin(false)

                    if (chosen === 'client') navigate('/owner')
                    else if (chosen === 'driver') navigate('/driver')
                    else navigate('/')
                } else {
                    setToken(data.token)
                    setShowLogin(false)
                    navigate('/')
                }
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
        
    }

  return (
    <div onClick={()=> setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50'>

      <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
            </p>

            {state === "register" && (
                <>
                    <div className="w-full">
                        <p>Name</p>
                        <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
                    </div>

                    <div className="w-full">
                        <p>Register as (select one or more)</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                            <button
                                type="button"
                                onClick={() => toggleRegisterRole("renter")}
                                className={`px-3 py-1 rounded-full border text-xs ${roles.includes("renter") ? "bg-primary text-white border-primary" : "border-gray-200"}`}
                            >
                                Renter
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleRegisterRole("client")}
                                className={`px-3 py-1 rounded-full border text-xs ${roles.includes("client") ? "bg-primary text-white border-primary" : "border-gray-200"}`}
                            >
                                Client
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleRegisterRole("driver")}
                                className={`px-3 py-1 rounded-full border text-xs ${roles.includes("driver") ? "bg-primary text-white border-primary" : "border-gray-200"}`}
                            >
                                Driver
                            </button>
                        </div>
                    </div>
                    <div className="w-full">
                        <p>Go to after signup</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                            <button
                                type="button"
                                onClick={() => roles.includes("renter") && setSessionRole("renter")}
                                disabled={!roles.includes("renter")}
                                className={`px-3 py-1 rounded-full border text-xs ${sessionRole === "renter" ? "bg-primary text-white border-primary" : "border-gray-200"} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                Renter
                            </button>
                            <button
                                type="button"
                                onClick={() => roles.includes("client") && setSessionRole("client")}
                                disabled={!roles.includes("client")}
                                className={`px-3 py-1 rounded-full border text-xs ${sessionRole === "client" ? "bg-primary text-white border-primary" : "border-gray-200"} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                Client
                            </button>
                            <button
                                type="button"
                                onClick={() => roles.includes("driver") && setSessionRole("driver")}
                                disabled={!roles.includes("driver")}
                                className={`px-3 py-1 rounded-full border text-xs ${sessionRole === "driver" ? "bg-primary text-white border-primary" : "border-gray-200"} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                Driver
                            </button>
                        </div>
                    </div>
                </>
            )}

            {state === "login" && (
                <div className="w-full">
                    <p>Use as</p>
                    <div className="flex gap-2 mt-1">
                        <button
                            type="button"
                            onClick={() => setSessionRole("renter")}
                            className={`px-3 py-1 rounded-full border text-xs ${sessionRole === "renter" ? "bg-primary text-white border-primary" : "border-gray-200"}`}
                        >
                            Renter
                        </button>
                        <button
                            type="button"
                            onClick={() => setSessionRole("client")}
                            className={`px-3 py-1 rounded-full border text-xs ${sessionRole === "client" ? "bg-primary text-white border-primary" : "border-gray-200"}`}
                        >
                            Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setSessionRole("driver")}
                            className={`px-3 py-1 rounded-full border text-xs ${sessionRole === "driver" ? "bg-primary text-white border-primary" : "border-gray-200"}`}
                        >
                            Driver
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
            </div>
            {state === "register" ? (
                <p>
                    Already have account? <span onClick={() => setState("login")} className="text-primary cursor-pointer">click here</span>
                </p>
            ) : (
                <p>
                    Create an account? <span onClick={() => setState("register")} className="text-primary cursor-pointer">click here</span>
                </p>
            )}
            <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                {state === "register" ? "Create Account" : "Login"}
            </button>
        </form>
    </div>
  )
}

export default Login
