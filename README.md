

# 🎞️ Lightweight Video Storage Service

A minimal, scalable video storage platform for authenticated users to upload, manage, and securely share short-form videos with custom link options and thumbnail previews.

---

## ✨ Features

### 📤 Upload

* Drag-and-drop support for **signed-in users**.
* Accepts **single video files up to 500 MB**.
* **Real-time progress tracking** during upload (bytes & percentage).
* Automatically generates a **1280×720 JPG thumbnail** (first frame).
* After upload: `PROCESSING → READY` status indicator.

### ☁️ Storage

* Raw video files are stored in **object storage (e.g., AWS S3, GCS, etc.)**.
* Thumbnails are extracted server-side using **FFmpeg** and stored alongside video metadata.

### 📊 Dashboard

* Displays **user's uploaded videos**, ordered by **most recent first**.
* Each row includes:

  * Video title
  * Upload status (e.g., `PROCESSING`, `READY`)
  * Thumbnail preview
  * Download button
* Clicking a row navigates to the **Video Player Page**.

### 🎬 Video Player Page

* Embedded video player for the selected file.
* Metadata display:

  * Filename
  * File size
  * Upload timestamp
* Table listing all **share links** created for that video.

### 🔗 Share Links

Users can create multiple links per video with customizable options:

* **Visibility:**

  * `PUBLIC` – Anyone with the link can access.
  * `PRIVATE` – Only **whitelisted emails** can access.
* **Expiry presets:**

  * `1 hour`, `12 hours`, `1 day`, `30 days`, or `forever`.
* **Last viewed timestamp** (`last_viewed_at`) is recorded every time a link is accessed.
* For `PRIVATE` links:

  * If a whitelisted e-mail belongs to a registered user, the system sends them a **real-time notification** via email.
* Users can view all links they've created, along with:

  * Status (`active` / `expired`)
  * Visibility type
  * `last_viewed_at` info

---

## 🧱 Tech Stack

| Layer        | Tech Choices                                                 |
| ------------ | ------------------------------------------------------------ |
| Frontend     | React / Next.js (drag-drop, dashboard, player)               |
| Backend      | Node.js / Express / Fastify                                  |
| Video Engine | FFmpeg (thumbnail extraction)                                |
| Auth         | ClerkAuth                          |
| Storage      | AWS S3 / Google Cloud Storage / MinIO                        |
| DB           | PostgreSQL / MongoDB (metadata, share links)                 |
| Email        | SendGrid / Resend / Nodemailer                               |
| Realtime     | Socket.IO / WebSockets for progress                          |
| Cache        | Redis (optional, for signed URL caching or link rate limits) |
