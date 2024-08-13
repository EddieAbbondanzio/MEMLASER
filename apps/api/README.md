# Memlaser API

The backend API ran via a worker process.

## Description

The backend runs on a separate process to avoid any heavy calculations from lagging the app.

A REST API was used for better framework support, and it gives us the option to migrate to a
real server if ever needed.

Port 3475 is used.
