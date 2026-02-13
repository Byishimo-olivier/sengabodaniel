import axios from "axios";
import { Link, Navigate } from "react-router-dom";
// import store from "../store/Store";
function SignUp(){
    async function signUp(){
        var login=await axios.post('http://localhost:5050/api/sign-up',{
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            name: document.getElementById('name').value
        }).then(response=>{
            alert(response.data.message);
            window.location.href='/login';
        }).catch(err=>{
            alert('connection failed');
            console.log(err);
        });
    }
    return(
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10  shadow-lg sm:rounded-3xl sm:p-20">
                <h1 className="text-center text-2xl font-bold text-gray-900">
                    register Your Account
                </h1>
                <div className="mt-6">
                    <div method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                        </label>
                        <div className="mt-1">
                        <input id="email" name="email" type="email" autoComplete="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        names
                        </label>
                        <div className="mt-1">
                        <input id="name" name="name" type="text" autoComplete="name" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                        </label>
                        <div className="mt-1">
                        <input id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                        {/* <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/> */}
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            arleady have account?
                        </label>
                        </div>

                        <div className="text-sm">
                        <Link to="/login" className="font-medium text-black hover:text-gray-500">
                            login
                        </Link>
                        </div>
                    </div>

                    <div>
                        <button type="submit" onClick={()=>signUp()} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Sign up
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}
export default SignUp;