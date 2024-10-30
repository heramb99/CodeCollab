import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useLocation, useParams } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { FaCopy } from "react-icons/fa";
import AddCommentModal from "./AddCommentModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import AddUserModal from "./AddUserModal";

let currCode = "";

function CodeEditor() {
  const { roomId } = useParams();
  const location = useLocation();
  const formData = location?.state?.data;

  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [code, setCode] = useState("# start your coding");
  const [result, setResult] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currLang, setCurrLang] = useState("Python");
  const [currentUsers, setCurrentUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [editor, setEditor] = useState(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addUserModalShow, setAddUserModalShow] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const handleAddUserModal = () => {
    setAddUserModalShow(!addUserModalShow);
  };

  const handleDialogVisibility = () => {
    setShowDialog(!showDialog);
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SERVER_URL);
    setClient(socket);

    return () => {
      if (socket) {
        console.log("disconnecting from room", formData.roomId, code);
        socket.emit("leaveRoom", {
          roomId: formData.roomId,
          codeContent: currCode,
        });
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (client) {
      console.log("joining room", formData.roomId);
      client.emit("joinRoom", {
        username: formData.username,
        useremail: formData.useremail,
        roomId: formData.roomId,
      });

      client.on("codeUpdate", (data) => {
        const receivedCode = data.codeContent.replace(/\\"/g, '"');
        currCode = receivedCode;
        setCode(receivedCode);
      });

      client.on("userJoin", (data) => {
        setCurrentUsers(data.userslist);
      });

      client.on("commentsUpdate", (data) => {
        console.log("commentsUpdate", data);
        setComments(data.commentslist);
      });

      client.on("commentsUpdate", (data) => {
        setComments(data.commentslist);
      });

      client.on("error", (error) => {
        console.error("Socket error:", error);
      });
    }
  }, [client]);

  const handleLeaveRoom = () => {
    client.emit("leaveRoom", {
      roomId: formData.roomId,
      codeContent: currCode,
    });
    client.disconnect();
    navigate("/");
  };

  const handleMenuClick = () => {
    setShowLangMenu(!showLangMenu);
  };

  const handleLangChange = (e, langSelected) => {
    e.preventDefault();
    setCurrLang(langSelected);
    setShowLangMenu(false);
  };

  function debounce(func, delay) {
    let timerId;
    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const handleCodeChange = debounce((changedCode) => {
    const newCode = changedCode.replace(/"/g, '\\"');
    currCode = newCode;
    setCode(changedCode);
    client.emit("sendCode", {
      useremail: formData.useremail,
      codeContent: newCode,
      roomId: formData.roomId,
    });
  }, 800);

  useEffect(() => {
    if (editor) {
      editor.onDidChangeCursorSelection(handleSelectionChange);
    }
  }, [editor]);

  const handleSelectionChange = debounce(() => {
    const selection = editor.getSelection();
    if (selection && !selection.isEmpty()) {
      const selectedText = editor.getModel().getValueInRange(selection);
      setSelectedCode(selectedText);
      setShowDialog(true);
    } else {
      setSelectedCode("");
      setShowDialog(false);
    }
  }, 800);

  const handleSubscribeClick = (e) => {
    e.preventDefault();
    client.emit("subscribeToComments", {
      roomId: formData.roomId,
      useremail: formData.useremail,
    });
    toast.success(
      "Subscribed to comments for this room. Please check your email to confirm your subscription."
    );
  };

  const handleExecuteClick = () => {
    let lambdaFunction = "";
    if (currLang === "Python") {
      lambdaFunction = "execpy";
    } else if (currLang === "Javascript") {
      lambdaFunction = "execjs";
    }

    axios
      .post(import.meta.env.VITE_API_GATEWAY_URL + lambdaFunction, 
        {
          code: code,
        }
      ).then((response) => {
        console.log("Response:", response);
        setResult(response.data);
        if (response.status === 200) {
          toast.success("Code executed successfully");
        } else {
          toast.error("Code execution failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="w-screen h-screen bg-background">
      <div className=" w-full h-full flex p-4">
        <div className=" flex flex-col w-4/5 pr-4">
          <div className="flex justify-between my-2">
            <div className="flex gap-2">
              <h1 className="text-3xl text-blue-500">{"Room ID:"}</h1>
              <h1 className="text-3xl fon-semibold text-blue-500">
                {formData.roomId}
              </h1>
              <button
                className="text-sm font-medium text-blue-500"
                onClick={handleCopyToClipboard}
              >
                <FaCopy size={20} />
              </button>
            </div>
            <div>
              <div className="relative inline-block text-left">
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold bg-background hover:bg-secondary text-blue-500 shadow-sm ring-1 ring-inset ring-blue-500"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => handleMenuClick()}
                  >
                    {currLang}
                    <svg
                      className="-mr-1 h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        // fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        // clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="flex text-nowrap rounded-md px-3 py-2 text-sm font-semibold bg-background hover:bg-secondary text-blue-500 shadow-sm ring-1 ring-inset ring-blue-500"
                    onClick={(e) => handleAddUserModal(e)}
                  >
                   Invite to Room
                  </button>
                  <button
                    type="button"
                    className="flex text-nowrap rounded-md px-3 py-2 text-sm font-semibold bg-background hover:bg-secondary text-blue-500 shadow-sm ring-1 ring-inset ring-blue-500"
                    onClick={(e) => handleSubscribeClick(e)}
                  >
                    Subscribe to Notifications
                  </button>

                  <button
                    type="button"
                    className="flex text-nowrap rounded-md px-3 py-2 text-sm font-semibold bg-background hover:bg-secondary text-blue-500 shadow-sm ring-1 ring-inset ring-blue-500"
                    onClick={() => handleLeaveRoom()}
                  >
                    ◀︎ Leave Room
                  </button>
                </div>
                <ToastContainer />
                {showLangMenu ? (
                  <div
                    className="absolute right-96 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-white"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                  >
                    <div className="py-1 bg-background" role="none">
                      <a
                        href="#"
                        className=" block px-4 py-2 text-sm hover:bg-accent"
                        role="menuitem"
                        id="menu-item-0"
                        onClick={(e) => handleLangChange(e, "Python")}
                      >
                        Python
                      </a>
                      <a
                        href="#"
                        className=" block px-4 py-2 text-sm hover:bg-accent"
                        role="menuitem"
                        tabindex="-1"
                        id="menu-item-2"
                        onClick={(e) => handleLangChange(e, "Javascript")}
                      >
                        Javascript
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {showDialog && (
            <AddCommentModal
              handleDialogVisibility={handleDialogVisibility}
              roomId={roomId}
              useremail={formData.useremail}
              username={formData.username}
              selectedCode={selectedCode}
              client={client}
            />
          )}
          {addUserModalShow && (
            <AddUserModal
              handleAddUserModal={handleAddUserModal}
              roomId={roomId}
            />
          )}
          <div className=" flex-1 border rounded-lg border-blue-600 overflow-hidden">
            <Editor
              className=" w-full h-full"
              language={currLang.toLowerCase()}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              onMount={setEditor}
            />
          </div>
          <div className=" h-40 w-full flex flex-col">
            <div className=" flex justify-between p-2">
              <h2 className=" text-2xl text-blue-500 my-2">Output</h2>
              <div className=" bg-white  h-fit  p-[2px] rounded-xl bg-gradient-to-r from-blue-700 to-primary w-44 hover:scale-105 transition duration-200">
                <button
                  onClick={() => handleExecuteClick()}
                  className=" w-full rounded-[10px] text-blue-500 p-1 text-xl bg-background hover:bg-secondary"
                >
                  Execute Code ▶️
                </button>
              </div>
            </div>

            <textarea
              disabled
              defaultValue={result}
              className=" flex-1 bg-background outline-none border border-blue-600 text-white p-2 rounded-lg overflow-y-auto"
            ></textarea>
          </div>
        </div>
        <div className=" w-1/5 flex flex-col h-full p-2">
          <h2 className=" text-xl text-blue-500 my-2 border-b border-blue-500">
            Joined Members
          </h2>
          <div className=" h-fit max-h-96 overflow-y-auto">
            {currentUsers.map((user, index) => (
              <div
                className=" text-gray-200 border-b border-gray-600 text-md p-1 text-wrap truncate hover:bg-secondary hover:cursor-pointer"
                key={index}
              >
                {user.username}
              </div>
            ))}
          </div>
          <h2 className=" text-xl text-blue-500 my-3 border-b border-blue-500">
            Comments
          </h2>
          <div className=" flex-1 overflow-y-auto">
            {comments.map((commentObj, index) => (
              <div
                key={index}
                className=" flex flex-col border-b border-gray-600 text-gray-200 hover:bg-secondary hover:cursor-pointer"
              >
                <div className=" text-md text-wrap truncate">
                  {commentObj.username}
                </div>
                <div className=" text-sm text-gray-400 text-wrap truncate">
                  {commentObj.useremail}
                </div>
                <div className=" text-sm text-gray-400 text-wrap truncate">
                  {commentObj.comment}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
