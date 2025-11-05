import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import { authService } from "../../services/authService";
import { toastSuccess } from "../../utils/toasts";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const userId = await authService.forgotPassword(email);
      toastSuccess("Password reset instructions sent to your email");
      setEmail("");
      setIsNavigating(true);
      setMessage("Navigating to login page...");
      navigate("/reset-password", {
        state: { userId: userId},
      }); 
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-1/3 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-20 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {isNavigating ? (
        <div className="absolute inset-0 bg-black/40 backdrop-blur z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl border border-gray-200 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-800 font-medium">{message}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md relative z-50 bg-white/80 rounded-2xl backdrop-blur-xl shadow-lg shadow-blue-500/10 transform p-8">
          {/* Header */}
          <div className="text-center my-8 transition ease-in duration-75">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">
              Enter your email to receive reset instructions
            </p>
          </div>

          {/* Forgot Password Card */}
          <div className=" border border-white/20">
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 animate-shake">
                <p className="text-red-700 text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                <p className="text-green-700 text-sm text-center font-medium">
                  {message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                      focusedField === "email" ? "scale-110" : ""
                    }`}
                  >
                    <Mail
                      className={`h-5 w-5 transition-colors ${
                        focusedField === "email"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm bg-white/50 hover:bg-white/80 placeholder:text-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-75 justify-content-center inline-flex items-center justify-center px-3 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Mail size={18} className="mr-2" />
                      Send Reset Instructions
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors group"
              >
                <ArrowLeft
                  size={16}
                  className="mr-2 group-hover:-translate-x-1 transition-transform"
                />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6"></div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
