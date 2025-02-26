'use client';

export default function DiscoverInterface() {
  return (
    <div className="discover-interface">
      <div className="discover-header">
        <h2>Discover</h2>
      </div>
      
      <div className="discover-content">
        <div className="card">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5" width="24" height="24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"></path>
            </svg>
          </div>
          <h3>Learn Together</h3>
          <p>Explore new topics and learn with your AI companion</p>
        </div>
        
        <div className="card">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5" width="24" height="24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"></path>
            </svg>
          </div>
          <h3>Get Answers</h3>
          <p>Ask questions and receive helpful explanations</p>
        </div>
        
        <div className="card">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5" width="24" height="24">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path>
            </svg>
          </div>
          <h3>Daily Check-ins</h3>
          <p>Build a routine with regular conversations</p>
        </div>
      </div>
    </div>
  );
} 