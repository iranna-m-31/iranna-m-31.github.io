// --- 1. Utility function to read the CSRF Token from the cookie ---
function getCsrfTokenFromCookie() {
    const name = "XSRF-TOKEN=";
    // Get all cookies as a string and split them into an array
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    // Iterate through the cookies to find the one named "XSRF-TOKEN"
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            // Return the value part of the cookie
            return c.substring(name.length, c.length);
        }
    }
    return null; // Token not found
}

// --- 2. Function to handle the POST request ---
async function sendPostRequest() {
    const token = getCsrfTokenFromCookie();
    const url = 'http://localhost:8080/api/your-protected-endpoint'; // **CHANGE THIS URL** to your Spring Boot server endpoint
    
    const responseElement = document.getElementById('response');
    
    if (!token) {
        responseElement.textContent = "Error: XSRF-TOKEN cookie not found. Did you make an initial GET request to set the cookie?";
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // IMPORTANT: This is the core of the CSRF defense for SPAs
                'X-XSRF-TOKEN': token, 
                'Content-Type': 'application/json'
            },
            // Example body payload
            body: JSON.stringify({ message: "Hello from the SPA client!" })
        });

        const data = await response.text();
        
        if (response.ok) {
            responseElement.textContent = `Success! Status: ${response.status}\nResponse: ${data}`;
        } else {
            responseElement.textContent = `Failure! Status: ${response.status}\nError: ${data}`;
        }

    } catch (error) {
        responseElement.textContent = `Network Error: ${error.message}`;
    }
}

// --- 3. Attach event listener ---
document.getElementById('postButton').addEventListener('click', sendPostRequest);

console.log("Client script loaded. XSRF-TOKEN read:", getCsrfTokenFromCookie());
