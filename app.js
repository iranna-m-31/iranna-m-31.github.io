// --- 1. Utility function to read the CSRF Token from the cookie ---
function getCsrfTokenFromCookie() {
    const name = "XSRF-TOKEN=";
    const decodedCookie = decodeURIComponent(document.cookie);
    console.log("decodedCookie.   ", decodedCookie.toString());
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

// // --- CONFIGURATION ---
// const TARGET_API_URL = 'https://zequre-dev.mitsogo.com/configs';
// const PARENT_ORIGIN = 'https:/zequre-dev.mitsogo.com'; // CRITICAL: Must be the exact origin of the parent host
// const REQUEST_TYPE_GET = 'GET_CSRF_TOKEN_REQUEST';
// const RESPONSE_TYPE_GET = 'GET_CSRF_TOKEN_RESPONSE';

// // Note: getCsrfTokenFromCookie() is typically NOT used here, as the goal is to get the token 
// // via the parent's privileged access. We rely on the parent to return the status.

// async function fetchCsrfToken() {
//     const responseElement = document.getElementById('response');
//     responseElement.textContent = "Requesting GET token operation from parent...";

//     // 1. Prepare the message to send to the parent window
//     const message = {
//         type: REQUEST_TYPE_GET,
//         url: TARGET_API_URL,
//         method: 'GET'
//     };
    
//     // 2. Send the message to the PARENT window
//     window.parent.postMessage(message, PARENT_ORIGIN);
    
//     // 3. Set up a one-time listener to wait for the response from the parent
//     return new Promise((resolve) => {
//         const listener = (event) => {
//             // SECURITY CHECK: Always verify the origin and message type!
//             if (event.origin !== PARENT_ORIGIN || event.data.type !== RESPONSE_TYPE_GET) {
//                 return; 
//             }

//             const data = event.data;
            
//             // Remove listener to prevent memory leak and unexpected calls
//             window.removeEventListener('message', listener); 
            
//             // 4. Handle the response from the parent
//             if (data.success) {
//                 // The parent successfully made the GET and confirmed the token was set/found
//                 responseElement.textContent = `GET successful via Parent! Status: ${data.status}. Token status: ${data.tokenFound ? 'FOUND' : 'NOT FOUND'}.`;
//                 document.getElementById('postButton').disabled = data.tokenFound ? false : true;
//             } else {
//                 // The parent reported an error (network error or API failure)
//                 responseElement.textContent = `GET Failure via Parent! Status: ${data.status}. Error: ${data.error || 'Check browser console.'}`;
//             }
//             resolve();
//         };

//         window.addEventListener('message', listener);
        
//         // Optional: Add a timeout to handle unresponsive parent pages
//         setTimeout(() => {
//             window.removeEventListener('message', listener);
//             responseElement.textContent = "Error: Parent host did not respond within timeout.";
//             resolve();
//         }, 10000); 
//     });
// }

// --- 2. Function to perform the initial GET request ---
async function fetchCsrfToken() {
    const immUrl = 'https://zequre-dev.mitsogo.com/configs'; 
    const responseElement = document.getElementById('response');
    
    try {
        responseElement.textContent = "Sending GET request to /configs...";
        const response = await fetch(immUrl, {
            method: 'GET',
            // IMPORTANT: This tells the browser to include cookies for this cross-origin request
            credentials: 'include',
            // referrerPolicy: 'unsafe-url'
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
    const postUrl = 'https://zequre-dev.mitsogo.com/api/publish?portal_id=100'; 
    
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
