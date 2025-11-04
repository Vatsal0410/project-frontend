import React, { useEffect, useState } from "react";
import {
  Loader,
  X,
  User,
  Mail,
  Shield,
  UserPlus,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { type IUser } from "../../../../types/User";

interface UserFormModalProps {
  user: IUser | null;
  onClose: () => void;
  onSave: (userData: any) => void;
}

interface FormData {
  fname: string;
  lname: string;
  email: string;
  is_admin: boolean;
}

interface FormErrors {
  fname?: string;
  lname?: string;
  email?: string;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<FormData>({
    fname: user?.fname || "",
    lname: user?.lname || "",
    email: user?.email || "",
    is_admin: user?.is_admin || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, loading]);

  const validateName = (name: string): boolean => {
    const nameRegex = /^[A-Za-z]+$/;
    return nameRegex.test(name);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.fname.trim()) {
      errors.fname = "First name is required";
    } else if (formData.fname.trim().length < 2) {
      errors.fname = "First name must be at least 2 characters";
    } else if (!validateName(formData.fname)) {
      errors.fname = "Please enter a valid first name";
    }

    if (!formData.lname.trim()) {
      errors.lname = "Last name is required";
    } else if (formData.lname.trim().length < 2) {
      errors.lname = "Last name must be at least 2 characters";
    } else if (!validateName(formData.lname)) {
      errors.lname = "Please enter a valid last name";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
        is_admin: formData.is_admin,
      };

      onSave(userData);
    } catch (err: any) {
      console.error("Error saving user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user ? "Edit User" : "Add User"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {user ? "Update user details" : "Invite new team member"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            type="button"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.fname}
                  onChange={(e) => handleInputChange("fname", e.target.value)}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm placeholder:text-gray-400 ${
                    formErrors.fname
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="John"
                />
              </div>
              {formErrors.fname && (
                <p className="text-xs text-red-600 mt-1">{formErrors.fname}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.lname}
                  onChange={(e) => handleInputChange("lname", e.target.value)}
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm placeholder:text-gray-400 ${
                    formErrors.lname
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200"
                  }`}
                  placeholder="Doe"
                />
              </div>
              {formErrors.lname && (
                <p className="text-xs text-red-600 mt-1">{formErrors.lname}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:bg-gray-50 text-sm placeholder:text-gray-400 ${
                  formErrors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200"
                }`}
                placeholder="john.doe@company.com"
              />
            </div>
            {formErrors.email && (
              <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Admin Toggle - Only for new users */}
          {!user && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Admin Privileges
              </label>
              <div className="relative">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500">
                      Grant administrator privileges
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange("is_admin", !formData.is_admin)
                    }
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_admin ? "bg-blue-600" : "bg-gray-200"
                    } ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_admin ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || user?.is_admin}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center shadow-sm hover:shadow-md ${
                loading || user?.is_admin
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {user ? "Saving..." : "Adding..."}
                </>
              ) : user?.is_admin ? (
                "Cannot Edit Admin"
              ) : user ? (
                "Save Changes"
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            {!user ? (
              <>
                <Mail className="w-3 h-3" />
                <span>User will receive an invitation email</span>
              </>
            ) : (
              <>
                <RefreshCcw className="w-3 h-3" />
                <span>User information will be updated</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
