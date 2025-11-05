import { useState, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Shield, Key, Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/authService";
const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.otp) {
      setError("OTP code is required");
      return false;
    }

    if (!formData.newPassword) {
      setError("New password is required");
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleNavigateToLogin = () => {
    setShowSuccessModal(false)
    setIsNavigating(true)
    setTimeout(() => {
      navigate("/login");
    }, 2000)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!userId) {
      setError("Invalid reset session. Please start over.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.resetPassword(
        userId,
        formData.otp,
        formData.newPassword
      );
      setFormData({
        otp: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/80 rounded-2xl backdrop-blur-xl shadow-lg shadow-blue-500/10 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Session
          </h2>
          <p className="text-gray-600 mb-6">
            Please start the password reset process again from the login page.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

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
              <span className="text-gray-800 font-medium">
                Redirecting to login...
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md relative z-50 bg-white/80 rounded-2xl backdrop-blur-xl shadow-lg shadow-blue-500/10 transform p-8">
          {/* Header */}
          <div className="text-center my-8 transition ease-in duration-75">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <Key className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">Enter OTP and your new password</p>
          </div>

          {/* Reset Password Card */}
          <div className="border border-white/20">
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 animate-shake">
                <p className="text-red-700 text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Field */}
              <div>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                      focusedField === "otp" ? "scale-110" : ""
                    }`}
                  >
                    <Shield
                      className={`h-5 w-5 transition-colors ${
                        focusedField === "otp"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    id="otp"
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm bg-white/50 hover:bg-white/80 placeholder:text-gray-400"
                    value={formData.otp}
                    onChange={(e) => handleChange("otp", e.target.value)}
                    onFocus={() => setFocusedField("otp")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Enter OTP code"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* New Password Field */}
              <div>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                      focusedField === "newPassword" ? "scale-110" : ""
                    }`}
                  >
                    <Key
                      className={`h-5 w-5 transition-colors ${
                        focusedField === "newPassword"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className="block w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm bg-white/50 hover:bg-white/80 placeholder:text-gray-400"
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleChange("newPassword", e.target.value)
                    }
                    onFocus={() => setFocusedField("newPassword")}
                    onBlur={() => setFocusedField("")}
                    placeholder="New password (min. 6 characters)"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                      focusedField === "confirmPassword" ? "scale-110" : ""
                    }`}
                  >
                    <Key
                      className={`h-5 w-5 transition-colors ${
                        focusedField === "confirmPassword"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="block w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm bg-white/50 hover:bg-white/80 placeholder:text-gray-400"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-75 justify-content-center inline-flex items-center justify-center px-3 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Key size={18} className="mr-2" />
                      Reset Password
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
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Check your email for the OTP code we sent you
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl border border-gray-200">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={32} />
              </div>

              {/* Success Message */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">
                Your password has been reset successfully.
              </p>

              {/* Login Button */}
              <button
                onClick={handleNavigateToLogin}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/25 font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
