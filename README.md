# Device Management System

A real-time system monitoring dashboard built with Node.js and Next.js, featuring WebSocket communication for live updates.

![Dashboard Screenshot](dashboard-screenshot.png)

## Features

- **Real-time System Monitoring**: Continuously monitors and displays key system metrics.
- **WebSocket Communication**: Instant data updates without page refreshes.
- **Comprehensive System Information**:
  - CPU usage and details
  - RAM usage with visual indicators
  - Storage space and utilization
  - Network traffic statistics
  - Connected displays and resolution info
  - Operating system details
- **Modern Responsive UI**: Clean interface built with Tailwind CSS.
- **Automated Testing**: API tests and UI tests using Selenium.

## Tech Stack

- **Backend**: Node.js, Express, WebSocket (ws)
- **Frontend**: Next.js, React, Tailwind CSS
- **Testing**: Jest, Supertest, Selenium WebDriver
- **System Info**: systeminformation library

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Chrome browser (for UI tests)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd device-management
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend application (in a new terminal):
   ```
   cd frontend
   npm run dev
   ```

3. Access the dashboard at http://localhost:3001

### Running Tests

1. Backend API and WebSocket tests:
   ```
   cd backend
   npm test
   ```

2. UI tests:
   ```
   cd backend
   npm test -- tests/ui.test.js
   ```

## Project Structure

```
device-management/
│
├── backend/
│   ├── controller/
│   │   └── deviceController.js
│   ├── router/
│   │   └── deviceRoutes.js
│   ├── server/
│   │   └── server.js
│   ├── service/
│   │   └── systemService.js
│   ├── tests/
│   │   ├── api.test.js
│   │   └── ui.test.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── pages/
│   │   └── index.js
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## API Endpoints

- `GET /api/device` - Get complete system information
- `GET /api/device/metrics/:metric` - Get specific metrics (cpu, ram, disk, etc.)

## WebSocket Connection

Connect to `ws://localhost:3000` to receive real-time system information updates every 3 seconds.

## Deployment Options

The application can be deployed to various cloud platforms:

- **AWS EC2**: Traditional VM-based hosting
- **Docker**: Containerized deployment
- **Vercel/Netlify**: Frontend hosting with serverless backend

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgements

- [systeminformation](https://www.npmjs.com/package/systeminformation) - For providing detailed hardware and system information
- [Tailwind CSS](https://tailwindcss.com/) - For the UI framework
- [Next.js](https://nextjs.org/) - For the frontend framework
- [WebSocket](https://github.com/websockets/ws) - For real-time communication 