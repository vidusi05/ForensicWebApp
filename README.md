# ForensicWebApp

Made by Team 02 (FourCells) for the CO2050 Database Project in collaboration with the Department of Forensic Medicine, University of Peradeniya.

## Overview

ForensicWebApp is a web-based application developed to support the management and handling of forensic records and related information. The system was designed and implemented as part of the CO2050 Database Project according to the requirements provided by the Department of Forensic Medicine, University of Peradeniya.

## Team

- E/23/001, A.W.A.V.D. Abesekara, [email](mailto:e23001@eng.pdn.ac.lk)
- E/23/182, R.K. Kulasooriya, [email](mailto:e23182@eng.pdn.ac.lk)
- E/23/274, T. Piyathilake, [email](mailto:e23274@eng.pdn.ac.lk)
- E/23/382, P.H.G.L.M. Silva, [email](mailto:e23382@eng.pdn.ac.lk)

## Project Information

- Course: CO2050 – Database Systems
- Project Title: ForensicWebApp
- Team Number: 02
- Team Name: FourCells
- Client: Department of Forensic Medicine, University of Peradeniya

## Prerequisites

Ensure that the following software is installed:

- Node.js
- npm

## Installation

Clone the repository and install the required dependencies:

bash npm install 

## Running the Application

Start the development server using:

bash npm run dev 

For local development with the API, run the backend in a second terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The default seed login users are:

| Role | Email |
| --- | --- |
| Consultant JMO | perera@hospital.gov |
| Medical Officer | silva@hospital.gov |
| Data Entry Operator | operator@hospital.gov |
| System Administrator | admin@hospital.gov |
| Forensic Support Staff | staff@hospital.gov |

All seeded users use the password from `SEED_USER_PASSWORD`; if it is not set before first startup, the fallback is `password123`.

## EC2 + RDS MySQL Deployment

These commands assume Amazon Linux on EC2 and an RDS MySQL database in the same VPC/security group path as the EC2 instance.

1. Install runtime tools:

```bash
sudo dnf update -y
sudo dnf install -y git nodejs npm mysql
sudo npm install -g pm2
```

2. Clone and install dependencies:

```bash
git clone https://github.com/vidusi05/ForensicWebApp.git
cd ForensicWebApp
npm install
cd backend
npm install
cp .env.example .env
```

3. Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=production
CLIENT_ORIGIN=http://YOUR_EC2_PUBLIC_IP
JWT_SECRET=replace_with_a_long_random_secret
SEED_USER_PASSWORD=replace_with_the_login_password_you_want
DB_HOST=forensic-db.xxxxxx.ap-southeast-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_rds_master_password
DB_NAME=forensic_db
```

4. Confirm RDS connectivity from EC2:

```bash
cd ~/ForensicWebApp/backend
set -a
source .env
set +a
mysql -h "$DB_HOST" -P 3306 -u admin -p
```

If this fails, check that the RDS security group allows inbound MySQL `3306` from the EC2 security group, and that EC2 and RDS are in the same VPC.

5. Build and run:

```bash
cd ~/ForensicWebApp
npm run build
pm2 start npm --name forensic-webapp -- start
pm2 save
pm2 startup
```

6. Open the app:

```text
http://YOUR_EC2_PUBLIC_IP:5000
```

For normal HTTP on port 80 without typing `:5000`, add an inbound EC2 security group rule for HTTP `80` and use Nginx as a reverse proxy to `localhost:5000`.

7. Run deployment smoke tests:

```bash
cd ~/ForensicWebApp
BASE_URL=http://127.0.0.1:5000 \
SMOKE_EMAIL=admin@hospital.gov \
SMOKE_PASSWORD='the_password_from_SEED_USER_PASSWORD' \
npm run smoke
```

## Updating EC2 After Local Changes

From your local development machine:

```bash
git status
git add README.md package.json package-lock.json backend src scripts
git commit -m "Improve forensic app deployment and auth integration"
git push origin main
```

If the repository uses `master` instead of `main`, replace `main` with `master`.

On the EC2 server:

```bash
cd ~/ForensicWebApp
git status
git pull origin main
npm install
cd backend
npm install
cd ..
npm run build
pm2 restart forensic-webapp
pm2 logs forensic-webapp --lines 80
```

Then open:

```text
http://YOUR_EC2_PUBLIC_IP:5000
```

## Repository Structure

ForensicWebApp/ ├── backend/ ├── frontend/ ├── package.json ├── README.md └── ...

## Acknowledgement

This project was developed by Team 02 (FourCells) as part of the CO2050 Database Project in accordance with the requirements and guidance provided by the Department of Forensic Medicine, University of Peradeniya.
