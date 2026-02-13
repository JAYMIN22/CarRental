import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY
    const ACTIVE_ROLE_KEY = 'carrental_activeRole'

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false) // legacy flag, mapped to client role
    const [roles, setRoles] = useState([])
    const [activeRole, setActiveRoleState] = useState(() => {
        try {
            const stored = localStorage.getItem(ACTIVE_ROLE_KEY)
            if (['renter','client','driver','admin'].includes(stored)) return stored
        } catch (_) {}
        return null
    })

    const setActiveRole = (role) => {
        setActiveRoleState(role)
        try {
            if (role) localStorage.setItem(ACTIVE_ROLE_KEY, role)
            else localStorage.removeItem(ACTIVE_ROLE_KEY)
        } catch (_) {}
    }
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const [cars, setCars] = useState([])

    // Function to check if user is logged in
    const fetchUser = async ()=>{
        try {
           const {data} = await axios.get('/api/user/data')
           if (data.success) {
            setUser(data.user)
            const primaryRole = data.user.role
            const backendRoles = Array.isArray(data.user.roles) && data.user.roles.length
              ? data.user.roles
              : (primaryRole ? [primaryRole] : [])

            setRoles(backendRoles)

            // Treat legacy roles and new roles consistently for legacy isOwner
            const isClient = primaryRole === 'client' || primaryRole === 'owner' || backendRoles.includes('client') || backendRoles.includes('owner')
            setIsOwner(isClient)

            // Choose an active role: prefer persisted/current if valid for this user
            const normalizedRoles = backendRoles.map(r => r === 'user' ? 'renter' : r === 'owner' ? 'client' : r)
            let chosenRole = activeRole && normalizedRoles.includes(activeRole) ? activeRole : null
            if (!chosenRole) {
              if (normalizedRoles.includes('client')) chosenRole = 'client'
              else if (normalizedRoles.includes('driver')) chosenRole = 'driver'
              else if (normalizedRoles.includes('renter')) chosenRole = 'renter'
              else if (normalizedRoles.length > 0) chosenRole = normalizedRoles[0]
            }
            if (chosenRole && chosenRole !== activeRole) {
              setActiveRole(chosenRole)
            }
           }else{
            navigate('/')
           }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // Function to fetch all cars from the server

    const fetchCars = async () =>{
        try {
            const {data} = await axios.get('/api/user/cars')
            data.success ? setCars(data.cars) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to log out the user (silent, message handled elsewhere)
    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        setActiveRole(null)
        axios.defaults.headers.common['Authorization'] = ''
    }


    // Axios global response interceptor for unauthorized access
    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
            setShowLogin(true);
            navigate('/');
        };

        const interceptorId = axios.interceptors.response.use(
            (response) => {
                const message = response?.data?.message;
                const success = response?.data?.success;

                if (success === false && (message === 'not authorized' || message === 'Unauthorized' || message === 'Please login first')) {
                    handleUnauthorized();
                    return Promise.reject(new Error('Please login to continue'));
                }

                return response;
            },
            (error) => {
                const status = error?.response?.status;
                const message = error?.response?.data?.message;

                if (status === 401 || message === 'not authorized' || message === 'Unauthorized' || message === 'Please login first') {
                    handleUnauthorized();
                    return Promise.reject(new Error('Please login to continue'));
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptorId);
        };
    }, [logout, navigate, setShowLogin]);

    // useEffect to retrieve the token from localStorage
    useEffect(()=>{
        const token = localStorage.getItem('token')
        setToken(token)
        fetchCars()
    },[])

    // useEffect to fetch user data when token is available
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser()
        }
    },[token])

    // Derived role helpers
    const primaryRole = user?.role || null;
    const normalizedPrimary = primaryRole === 'user' ? 'renter' : primaryRole === 'owner' ? 'client' : primaryRole;
    const effectiveRole = activeRole || normalizedPrimary || null;

    const isRenter = effectiveRole === 'renter';
    const isClient = effectiveRole === 'client';
    const isDriver = effectiveRole === 'driver';
    const isAdmin = effectiveRole === 'admin';

    const value = {
        navigate, currency, axios, user, setUser,
        token, setToken,
        role: normalizedPrimary, roles, activeRole, setActiveRole,
        isRenter, isClient, isDriver, isAdmin,
        isOwner, setIsOwner, // keep legacy for now
        fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars, 
        pickupDate, setPickupDate, returnDate, setReturnDate
    }

    return (
    <AppContext.Provider value={value}>
        { children }
    </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}