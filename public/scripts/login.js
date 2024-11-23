async function loginUser(event) {
    event.preventDefault();
    const email = document.querySelector('#floatingInput').value;
    const password = document.querySelector('#floatingPassword').value;
  
    const response = await fetch('https://comp-4537-server-side-863fa8c790dd.herokuapp.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  
    const payload = await response.json();
    if (response.ok) {
      alert('Login successful!');
      window.location.href = 'adminDashboard.html'; // Redirect on success
    } else {
      alert(payload.error);
    }
  }
  
  // document.querySelector('#loginForm').addEventListener('submit', loginUser);
  