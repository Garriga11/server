const http = require('http'); 
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// Store "emails" in memory for now
const emails = [];

// Helper function to serve files
function serveFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('Server Error');
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(data);
    }
  });
}

// Create the server
const server = http.createServer((req, res) => {
  // Serve the index.html file (email form)
  if (req.method === 'GET' && req.url === '/') {
    serveFile(path.join(__dirname, 'views', 'index.html'), 'text/html', res);
  }

  // Serve the inbox.html file (display emails)
  else if (req.method === 'GET' && req.url === '/inbox') {
    // Simple way to inject email data into HTML
    let inboxPage = fs.readFileSync(path.join(__dirname, 'views', 'inbox.html'), 'utf8');
    const emailItems = emails.map(email => 
      `<li><strong>To:</strong> ${email.to} <br>
      <strong>Subject:</strong> ${email.subject} <br>
      <strong>Message:</strong> ${email.message}</li><br>`).join('');
    
    inboxPage = inboxPage.replace('<ul id="emails">', `<ul id="emails">${emailItems}`);
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(inboxPage);
  }

  // Handle form submission (POST request)
  else if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // Convert buffer to string
    });

    req.on('end', () => {
      const postData = querystring.parse(body);

      // Save the email to the array
      emails.push({
        to: postData.to,
        subject: postData.subject,
        message: postData.message
      });

      // Redirect to inbox after sending email
      res.statusCode = 302;
      res.setHeader('Location', '/inbox');
      res.end();
    });
  }

  // Handle 404 errors
  else {
    res.statusCode = 404;
    res.end('Page Not Found');
  }
});

// Start the server on port 3000
server.listen(3000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3000/');
});


