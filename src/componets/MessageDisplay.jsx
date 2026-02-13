import React from 'react';

// This component is designed to display temporary success or error messages.
// It uses Tailwind CSS for styling and includes animations for a smoother user experience.
const MessageDisplay = ({ message }) => {
  // Only render the message div if there is message text
  if (!message.text) {
    return null;
  }

  // Determine the background and text color based on the message type
  const bgColorClass = message.type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const textColorClass = 'text-white'; // Text color is consistently white for better contrast

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg z-50
                  flex items-center justify-center space-x-3
                  ${bgColorClass} ${textColorClass}
                  animate-fade-in-down`}
      role="alert" // ARIA role for accessibility
    >
      {/* Icon based on message type */}
      {message.type === 'success' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      
      {/* Message text */}
      <span className="font-semibold text-lg">{message.text}</span>
    </div>
  );
};

export default MessageDisplay;