import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { Eye, EyeOff } from "lucide-react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  // PASSWORD EMPTY CHECK
  if (!password.trim()) {
    alert("Please enter new password");
    return;
  }

  // PASSWORD LENGTH CHECK
  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {

    await API.put(
      `/auth/reset-password/${token}`,
      { password }
    );

    alert("Password reset successful");

    navigate("/");

  } catch (err) {

    alert("Invalid or expired token");

  }
};

  return (
    <div className="flex justify-center items-center h-screen">

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded">

        <h2 className="text-xl mb-4">Reset Password</h2>

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            className="border p-2 w-full pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2">
          Reset Password
        </button>

      </form>
    </div>
  );
}

export default ResetPassword;