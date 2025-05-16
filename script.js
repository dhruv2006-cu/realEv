// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const faqQuestions = document.querySelectorAll('.faq-question');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}

if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
        button.addEventListener('click', switchTabs);
    });
}

if (faqQuestions.length > 0) {
    faqQuestions.forEach(question => {
        question.addEventListener('click', toggleFAQ);
    });
}

// Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // In a real app, you would send this to your backend
    console.log('Login attempt with:', { email, password });
    
    // Redirect to home page after "successful" login
    window.location.href = 'index.html';
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const terms = document.getElementById('terms').checked;
    
    // Validation
    if (!name || !email || !studentId || !password || !confirmPassword || !role) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!terms) {
        alert('You must agree to the terms and conditions');
        return;
    }
    
    // In a real app, you would send this to your backend
    console.log('Registration data:', { name, email, studentId, password, role });
    
    // Redirect to login page after "successful" registration
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

function switchTabs(e) {
    // Remove active class from all buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Add active class to clicked button
    e.target.classList.add('active');
    
    // Hide all content sections
    document.querySelectorAll('.events-grid').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the selected content section
    const tabName = e.target.dataset.tab;
    document.getElementById(`${tabName}-events`).classList.remove('hidden');
}

function toggleFAQ(e) {
    // Toggle active class on question
    e.target.classList.toggle('active');
    
    // Toggle answer visibility
    const answer = e.target.nextElementSibling;
    if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
    } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}

// Check if user is logged in (simulated)
function checkAuth() {
    // In a real app, you would check for a token or session
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
    
    if (isLoggedIn && window.location.pathname.includes('register.html')) {
        window.location.href = 'index.html';
    }
}

// Initialize
checkAuth();
// --------------------------------------------
// Stripe Payment Integration
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the membership page
    if (document.getElementById('payment-modal')) {
      // Initialize Stripe (replace with your publishable key)
      const stripe = Stripe('pk_test_your_publishable_key_here');
      const elements = stripe.elements();
      const cardElement = elements.create('card');
      cardElement.mount('#card-element');
      
      // Modal elements
      const modal = document.getElementById('payment-modal');
      const closeModal = document.querySelector('.close-modal');
      const upgradeButtons = document.querySelectorAll('.upgrade-btn');
      const paymentForm = document.getElementById('payment-form');
      const paymentSuccess = document.getElementById('payment-success');
      
      // Open modal when upgrade button is clicked
      upgradeButtons.forEach(button => {
        button.addEventListener('click', function() {
          const planName = this.dataset.plan === 'student' ? 'Student Organizer' : 'Department Pro';
          const amount = this.dataset.plan === 'student' ? '10' : '50';
          
          document.getElementById('selected-plan').textContent = planName;
          document.getElementById('payment-amount').textContent = amount;
          document.getElementById('payment-amount-btn').textContent = amount;
          
          modal.style.display = 'block';
        });
      });
      
      // Close modal
      closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', function(event) {
        if (event.target === modal) {
          modal.style.display = 'none';
        }
      });
      
      // Handle form submission
      paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show spinner and disable button
        document.getElementById('payment-text').style.display = 'none';
        document.getElementById('payment-spinner').style.display = 'inline-block';
        document.getElementById('submit-payment').disabled = true;
        
        // Get the plan from the button that opened the modal
        const activeButton = Array.from(upgradeButtons).find(btn => 
          btn.textContent.includes(document.getElementById('selected-plan').textContent.split(' ')[0])
        );
        const planId = activeButton.dataset.plan;
        
        // Create payment intent on your server
        try {
          const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              plan: planId,
              amount: activeButton.dataset.amount // amount in cents
            })
          });
          
          const { clientSecret } = await response.json();
          
          // Confirm the payment
          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            }
          });
          
          if (error) {
            showError(error.message);
          } else if (paymentIntent.status === 'succeeded') {
            showSuccess();
            // In a real app, you would save the membership upgrade to your database here
          }
        } catch (err) {
          showError(err.message);
        }
      });
      
      // Show error message
      function showError(message) {
        document.getElementById('card-errors').textContent = message;
        document.getElementById('payment-text').style.display = 'inline';
        document.getElementById('payment-spinner').style.display = 'none';
        document.getElementById('submit-payment').disabled = false;
      }
      
      // Show success message
      function showSuccess() {
        paymentForm.style.display = 'none';
        paymentSuccess.style.display = 'block';
        
        // Continue button
        document.getElementById('success-continue').addEventListener('click', function() {
          modal.style.display = 'none';
          paymentForm.style.display = 'block';
          paymentSuccess.style.display = 'none';
          // Reset form
          cardElement.clear();
          document.getElementById('payment-text').style.display = 'inline';
          document.getElementById('payment-spinner').style.display = 'none';
          document.getElementById('submit-payment').disabled = false;
        });
      }
    }
  });
  // -----------------------------------------------------------
  // Calculate and display "time ago" for past events
function updateEventDates() {
  const pastEvents = document.querySelectorAll('#past-events .date-location span:first-child');
  
  pastEvents.forEach(dateElement => {
    const dateText = dateElement.textContent.match(/([A-Za-z]+\s\d{1,2},\s\d{4})/)[0];
    const eventDate = new Date(dateText);
    const timeDiff = calculateTimeAgo(eventDate);
    
    dateElement.textContent = `${dateText} (${timeDiff})`;
  });
}

function calculateTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('past-events')) {
    updateEventDates();
  }
});
// ------------------------------------------------------------
// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Hide all content sections
        document.querySelectorAll('.events-grid').forEach(section => {
          section.classList.add('hidden');
        });
        
        // Show the selected content section
        const tabName = this.dataset.tab;
        document.getElementById(`${tabName}-events`).classList.remove('hidden');
      });
    });
  }

  // Calculate and display "time ago" for past events
  function updateEventDates() {
    const pastEvents = document.querySelectorAll('#past-events .date-location span:first-child');
    
    pastEvents.forEach(dateElement => {
      const dateText = dateElement.textContent.match(/([A-Za-z]+\s\d{1,2},\s\d{4})/)[0];
      const eventDate = new Date(dateText);
      const timeDiff = calculateTimeAgo(eventDate);
      
      dateElement.textContent = `${dateText} (${timeDiff})`;
    });
  }

  function calculateTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  }

  // Update past event dates if on events page
  if (document.getElementById('past-events')) {
    updateEventDates();
  }
});

// ---------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember');
  const errorAlert = document.getElementById('errorAlert');
  const successAlert = document.getElementById('successAlert');
  
  // Check for saved credentials
  if (localStorage.getItem('rememberedEmail')) {
      emailInput.value = localStorage.getItem('rememberedEmail');
      rememberCheckbox.checked = true;
  }
  
  loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Reset alerts
      errorAlert.style.display = 'none';
      successAlert.style.display = 'none';
      
      // Get form values
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const remember = rememberCheckbox.checked;
      
      // Simple validation
      if (!email || !password) {
          showError('Please fill in all fields');
          return;
      }
      
      if (password.length < 6) {
          showError('Password must be at least 6 characters');
          return;
      }
      
      // Simulate authentication (in a real app, this would be an API call)
      simulateLogin(email, password, remember);
  });
  
  function simulateLogin(email, password, remember) {
      // Show loading state
      const loginBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = loginBtn.textContent;
      loginBtn.textContent = 'Authenticating...';
      loginBtn.disabled = true;
      
      // Simulate API delay
      setTimeout(() => {
          // Mock users - in a real app, this would be server-side validation
          const validUsers = [
              { email: 'dhruv1191.be24@chitkarauniversity.edu.in', password: 'DhruV06@', name: 'Dhruv' },
              { email: 'deshna1182.be24@chitkarauniversity.edu.in', password: 'Deshna1182', name: 'Deshna' },
              { email: 'divyanshi1200.be24@chitkarauniversity.edu.in', password: 'Divyanshi1200', name: 'Divyanshi' },
              { email: 'dilpreet1196.be24@chitkarauniversity.edu.in', password: 'Dilpreet1196', name: 'Dilpreet' }
          ];
          
          const user = validUsers.find(u => u.email === email && u.password === password);
          
          if (user) {
              // Save to session storage
              sessionStorage.setItem('currentUser', JSON.stringify({
                  email: user.email,
                  name: user.name
              }));
              
              // Remember email if checked
              if (remember) {
                  localStorage.setItem('rememberedEmail', user.email);
              } else {
                  localStorage.removeItem('rememberedEmail');
              }
              
              // Show success and redirect
              showSuccess(`Welcome back, ${user.name}! Redirecting...`);
              
              // Redirect to dashboard after 1.5 seconds
              setTimeout(() => {
                  window.location.href ='sdg-dashboard.html';
              }, 1500);
          } else {
              showError('Invalid email or password');
              loginBtn.textContent = originalText;
              loginBtn.disabled = false;
          }
      }, 1000);
  }
  
  function showError(message) {
      errorAlert.textContent = message;
      errorAlert.style.display = 'block';
  }
  
  function showSuccess(message) {
      successAlert.textContent = message;
      successAlert.style.display = 'block';
  }
});