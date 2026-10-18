You need Node.js on your computer, then four commands.

1. Install Node.js (once)
Download the LTS version from https://nodejs.org and install it with the default options. To check it worked, open a terminal (Command Prompt or PowerShell on Windows, Terminal on Mac) and run:

node -v

It should print a version number, 18 or newer.

2. Unzip the project
Extract usaran-lms.zip. You’ll get a folder called usaran.

3. Open a terminal in that folder

Windows: open the usaran folder, click the address bar, type cmd and press Enter.
Mac: right-click the folder and choose “New Terminal at Folder”.

4. Install and run

npm install
npm run dev

npm install downloads the libraries. It takes a minute and only needs to be done once. npm run dev prints an address like http://localhost:5173/. Open it in your browser to see the site.

While it’s running, any change you save in the src files updates the browser automatically. Press Ctrl + C in the terminal to stop it.

To make the final compiled version

npm run build
npm run preview

npm run build compiles everything into a dist folder, which holds the real website files. npm run preview serves that folder at http://localhost:4173 so you can check it.

To put it online
The simplest way is https://app.netlify.com/drop: drag the dist folder onto the page and it gives you a public link.

Opening a page like /student/dashboard directly needs one small fix on Netlify. Create a file public/_redirects containing this line, then run npm run build again:

/*  /index.html  200
