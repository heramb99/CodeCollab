import React, { useState } from 'react'

function AddCommentModal({handleDialogVisibility,client,roomId,selectedCode,username,useremail}) {

    const [comment, setComment] = useState('');

    const handleChange = (e) => {
        setComment(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setComment('');
        client.emit("addComment", {
            roomId: roomId,
            username: username,
            useremail: useremail,
            codeContent: selectedCode,
            comment: comment
        });
        handleDialogVisibility();
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
                        className=" text-lg font-semibold leading-6 text-primary"
                        id="modal-title"
                      >
                        {"Add Comment"}
                      </h3>
                      <div className="mt-2 w-full border border-blue-600 rounded-lg overflow-hidden caret-white">
                        <input
                          className="w-full bg-background px-3 py-2 text-sm outline-none text-white focus:ring-2 focus:ring-blue-700"
                          type="text"
                          name="username"
                          placeholder="Enter your comment"
                          onChange={handleChange}
                        ></input>
                      </div>
                        <p className='my-2 text-sm font-semibold text-primary'>{"Selected Code Content"}</p>
                      <div className="mt-2 w-full border border-blue-600 rounded-lg overflow-hidden caret-white focus:ring-2 focus:ring-blue-700">
                    <textarea
                      className="w-full bg-background px-3 py-2 text-sm outline-none text-white h-40"
                      disabled
                      name="useremail"
                      value={selectedCode}
                    ></textarea>
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
                    {"Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDialogVisibility}
                    className="mt-3 inline-flex w-full justify-center rounded-md text-white bg-secondary px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-foreground hover:text-background sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

export default AddCommentModal