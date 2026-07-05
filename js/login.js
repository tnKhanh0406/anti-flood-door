import { supabase } from './supabase.js';

const form = document.getElementById('loginForm');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      return;
    }

    location.href = 'dashboard.html';
  });
}