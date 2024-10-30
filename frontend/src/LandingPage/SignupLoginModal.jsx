import React,{ useState } from "react";
import { useNavigate } from 'react-router-dom';


function SignupLoginModal({ handleSigUpModal, handleLogInModal, type , handleSignUpRequest, handleLoginRequest}) {

  const tempformData={
    password:"",
    useremail:"",
  }

  const [formData, setFormData] = useState(tempformData);
  const navigate = useNavigate();

  const showDialog = () => {
    if (type === "signup") {
      handleSigUpModal();
    } else if (type === "login") {
      handleLogInModal();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "signup") {
        handleSignUpRequest(formData);
    } else if (type === "login") {
        handleLoginRequest(formData);
    }
  };


  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-background text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-background px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3
                    className="text-base font-semibold leading-6 text-primary"
                    id="modal-title"
                  >
                    {type === "signup" ? "Sign Up" : "Login"}
                  </h3>
                  
                  <div className="mt-2 w-full border border-blue-600 rounded-lg overflow-hidden caret-white focus:ring-2 focus:ring-blue-700">
                    <input
                      className="w-full bg-background px-3 py-2 text-sm outline-none text-white"
                      type="email"
                      name="useremail"
                      placeholder="Enter email id"
                      onChange={handleChange}
                    ></input>
                  </div>
                  <div className="mt-2 w-full border border-blue-600 rounded-lg overflow-hidden caret-white">
                    <input
                      className="w-full bg-background px-3 py-2 text-sm outline-none text-white focus:ring-2 focus:ring-blue-700"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      onChange={handleChange}
                    ></input>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-foreground hover:text-background sm:ml-3 sm:w-auto"
              >
                {type==="signup"?"Create Account":"Login"}
              </button>
              <button
                type="button"
                onClick={showDialog}
                className="mt-3 inline-flex w-full justify-center rounded-md text-white bg-secondary px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-foreground hover:text-background sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupLoginModal;
