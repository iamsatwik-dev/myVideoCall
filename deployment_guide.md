# 🚀 Deployment Guide - Cosmic Video Call App

This guide will walk you through deploying your fully optimized, cosmic-themed MERN video call application using **Render** (for the Backend Socket/API Server) and **Vercel** (for the React Frontend).

We have already pushed the absolute latest codebase—including dynamic production-ready CORS origin configs—to your GitHub repository:
👉 [https://github.com/iamsatwik-dev/myVideoCall](https://github.com/iamsatwik-dev/myVideoCall)

---

## 🛰️ Architecture Overview

To ensure high-performance video signaling and real-time operations, the application is divided into two parts:
1. **Backend Server (in `backened/`)**: A Node.js and Socket.io server. We deploy this on **Render** because Render fully supports WebSockets out of the box (unlike serverless functions, which drop persistent Socket connections).
2. **Frontend React SPA (in `frontened/`)**: A client application with our customized cosmic lobby and WebRTC components. We deploy this on **Vercel** for lightning-fast edge network delivery and automatic routing.

---

## 📦 Phase 1: Deploy Backend to Render

Follow these exact steps to launch your backend server:

### Step 1: Sign Up and Create a Web Service
1. Go to [Render.com](https://render.com/) and click **Sign Up** (use your **GitHub Account** for instant setup).
2. On your Render dashboard, click the blue **New +** button in the top right corner, and select **Web Service**.
3. Under "Connect a repository", search for and click **Connect** next to `myVideoCall`.

### Step 2: Configure Web Service Parameters
Fill out the creation form exactly as follows:
* **Name**: `myvideocall`
* **Region**: `Singapore` or `Oregon` (choose the one closest to you)
* **Branch**: `main`
* **Root Directory**: `backened` ⚠️ **(CRITICAL: This tells Render to isolate the backend folder)**
* **Runtime**: `Node`
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* **Instance Type**: `Free`

### Step 3: Add Environment Variables
Scroll down to the **Environment Variables** section and click **Add Environment Variable** to add these two entries:
1. `MONGO_URL` = `mongodb+srv://admin:myVideoCall@myvideocall.bymbd9s.mongodb.net/?appName=myvideocall`
2. `PORT` = `10000`

### Step 4: Click Deploy!
1. Click **Deploy Web Service** at the bottom of the page.
2. Render will build and deploy your Node.js application.
3. Once active, your **Live Web Service URL** is:
   `https://myvideocall.onrender.com`

---

## 🎨 Phase 2: Deploy Frontend to Vercel

With your backend live, follow these steps to host your frontend client:

### Step 1: Import Project to Vercel
1. Go to [Vercel.com](https://vercel.com/) and sign in using your **GitHub Account**.
2. Click **Add New...** and select **Project**.
3. Under "Import Git Repository", find `myVideoCall` and click **Import**.

### Step 2: Configure Vercel Project Settings
On the project configuration page, set these properties:
* **Project Name**: `my-video-call`
* **Framework Preset**: `Create React App`
* **Root Directory**: Click the **Edit** button next to Root Directory, select **`frontened`**, and click **Continue**.
* **Build and Output Settings**: Keep all defaults (Vercel will run `npm run build` and output the production bundle automatically).

### Step 3: Set Backend Environment Variable
Open the **Environment Variables** accordion and add your backend connection URL:
* **Key**: `REACT_APP_BACKEND_URL`
* **Value**: `https://myvideocall.onrender.com`

### Step 4: Deploy!
1. Click **Deploy**.
2. Vercel will compile your React app and build the production assets.
3. Within 1 minute, your video calling application will be completely live!

---

## 🧪 Phase 3: Final Verification

Once both platforms are deployed:
1. Open your Vercel frontend URL in a browser (e.g., `https://my-video-call.vercel.app`).
2. Log in or create an account to view the gorgeous cosmic dashboard.
3. Click **Host Meeting** to enter a room, customize your camera and microphone status in the **mirrored Glassmorphic Lobby**, and hit **Join Meeting**.
4. Share the URL with a friend, test the chat, and enjoy completely seamless WebRTC video streams with zero resizing stutters!
