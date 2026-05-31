# Engineering Notebook

A minimal static single-page engineering notes workspace for firmware analysis and technical documentation review.

## Features

- Pure HTML, CSS, and JavaScript
- Firebase Firestore cloud sync using one shared document: `engineering-notebook/main`
- No backend server, database server to manage, authentication, or build tooling
- Autosaves 1 second after typing stops and syncs changes across desktop and mobile in real time
- Document-style technical notes area for pasted responses or analysis notes
- Netlify-ready static site

## Firebase setup

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a project.
2. In the project overview, add a Web app (`</>`). Firebase's web setup guide explains that a web app registration provides a `firebaseConfig` object for your JavaScript app.
3. Copy the generated config values into `firebase-config.js`.
4. In the Firebase console, open **Build > Firestore Database** and create a Firestore database.
5. Start in production mode if you want to add rules manually, or test mode only while experimenting.
6. For a simple personal notebook with no authentication, add rules that allow read/write access to only this one document. Example:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /engineering-notebook/main {
      allow read, write: if true;
    }
  }
}
```

> Important: without authentication, anyone who has your deployed URL and Firebase project details could read or write this one notebook document. Keep the URL private, or add authentication later if the notes become sensitive.

## Netlify deployment

1. Confirm `firebase-config.js` contains your real Firebase config.
2. Commit and push these static files to your Git provider, or keep them in a local folder for drag-and-drop deploy.
3. In Netlify, create a new project from the repository. Because this is plain static HTML/CSS/JS, no build command is required and the publish directory is the repository root.
4. Alternatively, use Netlify's drag-and-drop deploy with the project folder.
5. Open the Netlify URL on your office PC, type in the notebook, then open the same URL on your phone. Firestore should load and live-sync the shared `engineering-notebook/main` document.

## Local use

For local testing, serve the folder with any static file server. ES modules do not reliably run from `file://`, so prefer a local server such as:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173` in your browser.
