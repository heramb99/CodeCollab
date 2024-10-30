import React,{ useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";


function AddUserModal({ handleAddUserModal, roomId }) {

  const tempformData={
    useremail:"",
    roomId:"",
  }

  const [formData, setFormData] = useState(tempformData);

  const showDialog = () => {
    handleAddUserModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/addUser", {
        email: formData["useremail"],
        roomId: roomId,
      })
      .then((response) => {
        // console.log("Add user Response:", response.data);
        if (response.data.result === "success") {
          toast.success("User added successfully");
          handleAddUserModal();
        } else {
        //   console.log("data error:", response?.data?.message);
          toast.error(response.data?.message || "Failed to add user. Please try again!");
        }
      })
      .catch((error) => {
        toast.error(error.response?.message || "Failed to add user. Please try again!");
      });
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
                    {"Add New User"}
                  </h3>
                  <div className="mt-2 w-full border border-blue-600 rounded-lg overflow-hidden caret-white">
                    <input
                      className="w-full bg-background px-3 py-2 text-sm outline-none text-white focus:ring-2 focus:ring-blue-700"
                      type="email"
                      name="useremail"
                      placeholder="Enter email id of user"
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
                Add User
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

export default AddUserModal;
