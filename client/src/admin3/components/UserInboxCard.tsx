import React from "react";

interface Props {
  message: {
    id: string;
    userName: string;
    email: string;
    subject: string;
    content: string;
    createdAt: string;
  };
}

const UserInboxCard: React.FC<Props> = ({ message }) => {
  return (
    <div className="border rounded shadow p-4 hover:shadow-lg transition flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">{message.subject}</h2>
        <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</span>
      </div>
      <div className="text-sm text-gray-600">
        <p><strong>From:</strong> {message.userName} ({message.email})</p>
        <p>{message.content}</p>
      </div>
      <div className="flex justify-end space-x-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Reply</button>
        <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">Delete</button>
      </div>
    </div>
  );
};

export default UserInboxCard;
