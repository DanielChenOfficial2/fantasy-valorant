window.addEventListener('load', () => {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const loginUsername = document.getElementById('loginUsername');
    console.log(loginUsername.value);

    const loginPassword = document.getElementById('loginPassword');
    console.log(loginPassword.value)
  })
  
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const registerUsername = document.getElementById('registerUsername');
    console.log(registerUsername.value);

    const registerPassword = document.getElementById('registerPassword');
    console.log(registerPassword.value)
  })
});