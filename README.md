Project Setup and Start Guide
This project uses Docker Compose to simplify the setup and running of the application.
Prerequisites

Docker installed on your machine: Get Docker
Docker Compose installed (usually comes with Docker Desktop)

Getting Started

Clone the repository
git clone git@github.com:OtmanFakri/MangamentNotes.git
cd MangamentNotes


Build and start the containers
Run the following command in the project root directory (where docker-compose.yml is located):
docker-compose up --build

This will build the Docker images (if not already built) and start all the services defined in the compose file.

Access the application
Once the containers are running, you can access the application at:
http://localhost:<port>

Replace <port> with the port number exposed by your application (check docker-compose.yml for details).

Stopping the application
To stop the running containers, press Ctrl+C in the terminal where docker-compose is running, or run:
docker-compose down



Additional Notes

To run the containers in detached mode (in the background), use:
docker-compose up -d


To view logs of running containers:
docker-compose logs -f


If you make changes to the code and want to rebuild the images:
docker-compose up --build



Troubleshooting

Make sure Docker daemon is running.
Check for port conflicts on your machine.
Review container logs for errors.

