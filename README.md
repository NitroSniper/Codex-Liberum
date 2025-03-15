# Quick Start Guide

## Running the Application with Docker Desktop

### Prerequisites
- Install **Docker Desktop** from [Docker’s official website](https://www.docker.com/products/docker-desktop/).
- Ensure Docker Desktop is running.

### Steps to Run the Application
1. **Open Docker Desktop** and ensure it is running.
2. **Navigate to the project folder** in your terminal or command prompt.
3. **Start the services** by running:
   ```sh
   docker-compose up -d
   ```
   - The `-d` flag runs the containers in the background.
   - This will start the Node.js application (`codex`), PostgreSQL database (`db`), and Adminer (`adminer`).

4. **Access the application:**
   - The Node app should be accessible on `http://localhost:3000` (if port 3000 is used).
   - The Adminer database management tool is accessible at `http://localhost:8080`.

5. **To stop the application**, run:
   ```sh
   docker-compose down
   ```
   This stops and removes the running containers but **does not delete the database data**.

## Accessing Adminer and Database Credentials
- **URL:** `http://localhost:8080`
- **Database System:** PostgreSQL
- **Server:** `db` (this is the service name in Docker Compose)
- **Username:** `admin`
- **Password:** `example`
- **Database Name:** You can leave this empty

## Notes
- If you need to **restart the database without losing data**, use:
  ```sh
  docker-compose restart db
  ```
- To delete the database and start fresh, remove the volume with:
  ```sh
  docker volume rm pg_data
  ```
- Ignore any nix flakes files. These are used for my system since I use NixOS

For further assistance, refer to the official Docker documentation or reach out to me

