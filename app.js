// --- 1. Utility function to read the CSRF Token from the cookie ---
function getCsrfTokenFromCookie() {
    const name = "XSRF-TOKEN=";
    const decodedCookie = decodeURIComponent(document.cookie);
    console.log("decodedCookie.   ", decodedCookie);
    const ca = decodedCookie.split(';');

    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null; // Token not found
}

// --- 2. Function to perform the initial GET request ---
async function fetchCsrfToken() {
    const immUrl = 'http://localhost:8080/configs'; 
    const responseElement = document.getElementById('response');
    
    try {
        responseElement.textContent = "Sending GET request to /configs...";
        const response = await fetch(immUrl, {
            method: 'GET',
            // IMPORTANT: This tells the browser to include cookies for this cross-origin request
            credentials: 'include' 
            // The browser automatically adds the Origin header (e.g., Origin: http://localhost:5173)
        });

        const token = getCsrfTokenFromCookie();

        if (token) {
            responseElement.textContent = `GET successful! Status: ${response.status}. XSRF-TOKEN found and stored: ${token}`;
            document.getElementById('postButton').disabled = false;
        } else {
            responseElement.textContent = `GET successful, but XSRF-TOKEN cookie was NOT set. Check your Spring Security configuration. Status: ${response.status}`;
        }
        
    } catch (error) {
        responseElement.textContent = `Network Error during GET: ${error.message}. Ensure your Spring server is running on localhost:8080.`;
    }
}


// --- 3. Function to handle the POST request ---
async function sendPostRequest() {
    const token = getCsrfTokenFromCookie();
    const postUrl = 'http://localhost:8080/api/publish?portal_id=100'; 
    
    const responseElement = document.getElementById('response');
    
    // if (!token) {
    //     responseElement.textContent = "Error: XSRF-TOKEN cookie not found. Please click a 'Fetch CSRF Token' button first.";
    //     return;
    // }

    try {
        const response = await fetch(postUrl, {
            method: 'POST',
            // IMPORTANT: Include credentials to send the XSRF-TOKEN cookie
            credentials: 'include', 
            headers: {
                // This is the core CSRF defense
                'X-XSRF-TOKEN': token, 
                'Content-Type': 'application/vnd.api+json'
                // The browser automatically adds the Origin header
            },
            body: JSON.stringify({ message: "Hello from the secured client!" })
        });

        const data = await response.text();
        
        if (response.ok) {
            responseElement.textContent = `POST Success! Status: ${response.status}\nResponse: ${data}`;
        } else {
            responseElement.textContent = `POST Failure! Status: ${response.status}\nError: ${data}`;
        }

    } catch (error) {
        responseElement.textContent = `POST Network Error: ${error.message}`;
    }
}

// --- 4. Attach event listeners ---
document.getElementById('getTokenButton1').addEventListener('click', fetchCsrfToken);
document.getElementById('getTokenButton2').addEventListener('click', fetchCsrfToken);
document.getElementById('postButton').addEventListener('click', sendPostRequest);
