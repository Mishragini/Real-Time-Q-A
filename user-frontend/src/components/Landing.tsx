import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      {/* Left half */}
      <div className="flex-1 bg-green-400 flex items-center justify-center">
        <p className="text-white font-bold text-3xl text-center">
          Welcome to User Dashboard of Interacto.
        </p>
      </div>

      {/* Right half */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-4 text-center">
          <p className="text-m text-gray-600">
            Don't have an account?
          </p>
          <button
            className="bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:shadow-outline-gray"
            onClick={() => {
              navigate('/signup');
            }}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center">
          <p className="text-m text-gray-600">Already a User?</p>
          <button
            className="bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:shadow-outline-gray"
            onClick={() => {
              navigate('/signin');
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
