import editDocIcon from "../assets/icons/edit-document-icon.json";
import shareIcon from "../assets/icons/wireless-connection-icon.json";
import { Player } from "@lordicon/react";
import React, { useEffect, useRef, useState } from "react";
import JoinModal from "../LandingPage/JoinModal";
import SignupLoginModal from "../LandingPage/SignupLoginModal";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Landing() {
  const editIconTopLeftRef = useRef(null);
  const editIconTopRightRef = useRef(null);
  const editIconBottomRightRef = useRef(null);
  const editIconBottomLeftRef = useRef(null);
  const codingIconRef = useRef(null);
  const [nextSequence, setNextSequence] = useState("first");
  const [createModal, setCreateModal] = useState(false);
  const [joinModal, setJoinModal] = useState(false);
  const [sigUpModal, setSigUpModal] = useState(false);
  const [logInModal, setLogInModal] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const handleCreateModal = () => {
    setCreateModal(!createModal);
  };
  const handleJoinModal = () => {
    setJoinModal(!joinModal);
  };

  const handleSigUpModal = () => {
    setSigUpModal(!sigUpModal);
  };
  const handleLogInModal = () => {
    setLogInModal(!logInModal);
  };

  useEffect(() => {
    if (nextSequence === "first") {
      editIconTopLeftRef.current?.playFromBeginning();
    } else if (nextSequence === "second") {
      codingIconRef.current?.playFromBeginning();
    } else if (nextSequence === "third") {
      editIconTopRightRef.current?.playFromBeginning();
      editIconBottomLeftRef.current?.playFromBeginning();
      editIconBottomRightRef.current?.playFromBeginning();
    }
  }, [nextSequence]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUserLoggedIn(true);
    }
  }, []);

  const handleSignUpRequest = (data) => {
    // console.log("data:", data);
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/signup", {
        email: data["useremail"],
        password: data["password"],
      })
      .then((response) => {
        // console.log("Signup Response:", response.data);
        if (response.data.result === "success") {
          toast.success("Signup successful. Please login to continue");
          // setUserLoggedIn(true);
          handleSigUpModal();
        } else {
          // console.log("data error:", response?.data?.error);
          toast.error(response.data?.error);
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Login failed. Please try again!");
        // console.error("Error Data:", error.response?.data?.error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("useremail");
    setUserLoggedIn(false);
  };

  const handleLoginRequest = (data) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/login", {
        email: data["useremail"],
        password: data["password"],
      })
      .then((response) => {
        // console.log("Login Response", response.data);
        if (response.data.result === "success") {
          // console.log("data:", response?.data?.body);
          localStorage.setItem("token", response?.data?.token);
          localStorage.setItem("useremail", data["useremail"]);
          toast.success("Login successful. You can create or join a room now");
          setUserLoggedIn(true);
          handleLogInModal();
        } else {
          toast.error("Login failed. Please try again");
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Login failed. Please try again!");
        console.error("Error:", error);
      });
  };

  return (
    <div className=" w-screen h-screen bg-background flex flex-col items-center">
      {userLoggedIn && (
        <div className="flex w-full justify-end mt-6 mr-6">
          <div className=" bg-white h-fit  p-[2px] rounded-xl bg-gradient-to-r from-blue-700 to-primary hover:scale-105 transition duration-200">
            <button
              className=" w-full rounded-[10px] text-white p-2 text-base bg-background hover:bg-secondary"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
      <section className=" overflow-hidden px-4 py-20 sm:px-6 sm:flex sm:flex-col gap-4 md:justify-center md:items-center">
        <section className="flex flex-col gap-4 justify-center items-start md:items-center">
          <article className=" rounded-full p-[2px] text-sm bg-gradient-to-r from-blue-700 to-primary">
            <div className=" rounded-full text-lg px-3 py-1 bg-black text-white">
              {"✨ Your Coding Google Docs Workspace ✨"}
            </div>
          </article>
          <>
            <h2 className=" text-left text-3xl sm:text-5xl sm:max-w-[750px] md:text-center font-semibold text-purple-400">
              {"All-In-One Collaborative Coding Platform"}
            </h2>
            <p className=" text-2xl font-semibold text-purple-300 sm: max-w-[450px] md:text-center">
              {"Create Room and Start Collaborating!"}
            </p>
          </>
          <div className=" flex mt-6 gap-6 w-full p-2 justify-center">
            {userLoggedIn ? (
              <>
                <div className=" bg-white  h-fit  p-[2px] rounded-xl bg-gradient-to-r from-blue-700 to-primary w-44 hover:scale-105 transition duration-200">
                  <button
                    className=" w-full rounded-[10px] text-white p-2 text-xl bg-background hover:bg-secondary"
                    onClick={handleCreateModal}
                  >
                    Create Room 🖥️
                  </button>
                </div>
                <div className=" bg-white h-fit  p-[2px] rounded-xl bg-gradient-to-r from-blue-700 to-primary w-44 hover:scale-105 transition duration-200">
                  <button
                    className=" w-full rounded-[10px] text-white p-2 text-xl bg-background hover:bg-secondary"
                    onClick={handleJoinModal}
                  >
                    Join Room 🚪
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className=" bg-white  h-fit  p-[2px] rounded-xl bg-gradient-to-r from-blue-700 to-primary w-44 hover:scale-105 transition duration-200">
                  <button
                    className=" w-full rounded-[10px] text-white p-2 text-xl bg-background hover:bg-secondary"
                    onClick={handleSigUpModal}
                  >
                    Sign Up ⬆️
                  </button>
                </div>
                <div className=" bg-white h-fit  p-[2px] rounded-xl bg-gradient-to-r from-blue-700 to-primary w-44 hover:scale-105 transition duration-200">
                  <button
                    className=" w-full rounded-[10px] text-white p-2 text-xl bg-background hover:bg-secondary"
                    onClick={handleLogInModal}
                  >
                    Login 🔐
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </section>
      {createModal && (
        <JoinModal
          handleCreateModal={handleCreateModal}
          handleJoinModal={handleJoinModal}
          type={"create"}
        />
      )}
      {joinModal && (
        <JoinModal
          handleCreateModal={handleCreateModal}
          handleJoinModal={handleJoinModal}
          type={"join"}
        />
      )}
      {sigUpModal && (
        <SignupLoginModal
          handleLogInModal={handleLogInModal}
          handleSigUpModal={handleSigUpModal}
          type={"signup"}
          handleSignUpRequest={handleSignUpRequest}
        />
      )}
      {logInModal && (
        <SignupLoginModal
          handleLogInModal={handleLogInModal}
          handleSigUpModal={handleSigUpModal}
          type={"login"}
          handleLoginRequest={handleLoginRequest}
        />
      )}
      <div className=" border w-[550px] h-[550px] border-blue-700 rounded-full bg-background flex flex-col items-center justify-center ">
        <div className=" flex justify-between gap-48">
          <Player
            icon={editDocIcon}
            size={120}
            ref={editIconTopLeftRef}
            onComplete={() => {
              setNextSequence("second");
            }}
          />
          <Player
            icon={editDocIcon}
            size={120}
            ref={editIconTopRightRef}
            onComplete={() => {
              setNextSequence("first");
            }}
          />
        </div>
        <div className="text-center">
          <Player
            icon={shareIcon}
            size={100}
            ref={codingIconRef}
            onComplete={() => {
              setNextSequence("third");
            }}
          />
        </div>
        <div className=" flex justify-between gap-48">
          <Player
            icon={editDocIcon}
            size={120}
            ref={editIconBottomLeftRef}
            onComplete={() => {
              //   setNextSequence("second");
            }}
          />
          <Player
            icon={editDocIcon}
            size={120}
            ref={editIconBottomRightRef}
            onComplete={() => {
              //   setNextSequence("second");
            }}
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Landing;
