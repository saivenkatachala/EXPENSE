const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwigi6pn3X7EFGugDIGHWsL8I3kxhfhmYb0gMhqYFlNud7IpkhO41YfVbfLET_9n0plVA/exec";

let currentUsername = "";

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => (page.style.display = "none"));
  document.getElementById(pageId).style.display = "block";
}

async function handleRegister() {
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  if (!username || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const url = `${GOOGLE_SCRIPT_URL}?action=register&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.message === "Registration successful.") {
      alert(result.message);
      showPage("login-page");
    } else {
      alert(result.error || result.message);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Registration failed. Check the console for details.");
  }
}

async function handleLogin() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const url = `${GOOGLE_SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.message === "Login successful.") {
      alert(result.message);
      currentUsername = username;
      showPage("expense-page");
      document.getElementById("expenses-list").innerHTML = ""; 
      document.getElementById("total-expense").textContent = "0.00";
      handleGetExpenses();
    } else {
      alert(result.error || result.message);
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed. Check the console for details.");
  }
}

async function handleAddExpense() {
  const date = document.getElementById("expense-date").value;
  const category = document.getElementById("expense-category").value;
  const amount = document.getElementById("expense-amount").value;
  const note = document.getElementById("expense-note").value;

  if (!date || !category || !amount) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const url = `${GOOGLE_SCRIPT_URL}?action=addExpense&username=${encodeURIComponent(currentUsername)}&date=${encodeURIComponent(date)}&category=${encodeURIComponent(category)}&amount=${encodeURIComponent(amount)}&note=${encodeURIComponent(note)}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.message === "Expense added successfully.") {
      alert(result.message);
      document.getElementById("expense-date").value = "";
      document.getElementById("expense-category").value = "";
      document.getElementById("expense-amount").value = "";
      document.getElementById("expense-note").value = "";
      handleGetExpenses();
    } else {
      alert(result.error || result.message);
    }
  } catch (error) {
    console.error("Failed to add expense:", error);
    alert("Failed to add expense. Check the console for details.");
  }
}

async function handleGetExpenses() {
  try {
    const url = `${GOOGLE_SCRIPT_URL}?action=getExpenses&username=${encodeURIComponent(currentUsername)}`;
    const response = await fetch(url);
    const result = await response.json();

    const expensesList = document.getElementById("expenses-list");
    expensesList.innerHTML = "";

    if (!Array.isArray(result) || result.length <= 1) {
      expensesList.innerHTML = "<p>No expenses recorded yet.</p>";
      return;
    }

    const sortedExpenses = result.slice(1).sort((a, b) => new Date(a[0]) - new Date(b[0]));

    sortedExpenses.forEach((expense) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="expense-item">
          <span><strong>Date:</strong> ${expense[0]}</span>
          <span><strong>Category:</strong> ${expense[1]}</span>
          <span><strong>Amount:</strong> ₹<span class="expense-amount">${expense[2]}</span></span>
          <span><strong>Note:</strong> ${expense[3]}</span>
        </div>
      `;
      expensesList.appendChild(li);
    });

    handleTotalExpense();
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    alert("Failed to fetch expenses. Check the console for details.");
  }
}

function handleTotalExpense() {
  let total = 0;
  document.querySelectorAll(".expense-amount").forEach((element) => {
    const amount = parseFloat(element.textContent.replace(/[^\d.-]/g, ""));
    if (!isNaN(amount)) total += amount;
  });
  document.getElementById("total-expense").textContent = `₹${total.toFixed(2)}`;
}

function handleLogout() {
  currentUsername = "";
  document.getElementById("expenses-list").innerHTML = "";
  document.getElementById("total-expense").textContent = "₹0.00";
  showPage("login-page");
}



document.getElementById("register-message").innerHTML = 'Already registered? <a href="#" onclick="showPage(\'login-page\')">Login here</a>';
document.getElementById("login-message").innerHTML = 'New here? <a href="#" onclick="showPage(\'register-page\')">Register here</a>';

showPage("register-page");
