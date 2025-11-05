import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { authService } from "../../services/authService"
import { Eye, EyeOff, LogIn, Shield, User } from "lucide-react"
import { toastError } from "../../utils/toasts"

const LoginPage = () => {
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {login} = useAuth()
  const navigate = useNavigate()

  // Handle login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()

    if(!email || !password) {
      setError("All fields are required")
      return
    }
    setLoading(true)
    setError('')

    try {
      const data = await authService.login(email, password)
      
      login(data.token, data.user.is_admin, data.user)
      if (data.user.is_admin) {
        navigate("/admin");
      } else {
        navigate("/app");
      }
      
    } catch (error: any) {
      console.error(error)
      setError(error.message)
      toastError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  // navigate to forgot password page
  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      <div className="w-full max-w-md relative z-50 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-blue-500/10 transform p-8">
        {/* Header */}
        <div className="text-center mb-8 transition ease-in duration-75">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <div className="border border-white/20">
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 animate-shake">
              <p className="text-red-700 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium  ${focusedField === 'email' ? "text-blue-600" : "text-gray-700"} mb-2`}>
                Email Address
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${focusedField === 'email' ? 'scale-110' : ''}`}>
                  <User className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  id="email"
                  className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm bg-white/50 hover:bg-white/80 placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'} mb-2`}>
                Password
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${focusedField === 'password' ? 'scale-110' : ''}`}>
                  <Shield className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="block w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm bg-white/50 hover:bg-white/80 placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-center text-sm my-4">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 hover:scale-[1.02] duration-300 font-medium transition-colors"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <div className="flex justify-center">
              <button
              type="submit"
              disabled={loading}
              className="w-50 justify-content-center inline-flex items-center justify-center px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  Sign In
                </>
              )}
            </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Can't access an account? Contact administrator
          </p>
        </div>
      </div>
    </div>

  )
}

export default LoginPage