document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("emailForm").addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent page refresh

      const emailInputs = document.querySelectorAll(".email-input");
      const emails = Array.from(emailInputs).map(input => input.value.trim()).filter(email => email);
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      if (emails.length === 0) {
          showToast("❌ Please enter at least one email!", "error");
          return;
      }

      try {
          const response = await fetch("http://localhost:5000/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ emails, subject, message }),
          });

          const data = await response.json();

          if (response.ok) {
              showToast("✅ Emails sent successfully!", "success");
              document.getElementById("emailForm").reset();
          } else {
              showToast("❌ Failed to send email: " + data.error, "error");
          }
      } catch (error) {
          showToast("❌ Error sending email: " + error.message, "error");
      }
  });
});

// Function to generate email input fields
function generateFields() {
  const numEmails = parseInt(document.getElementById("numEmails").value);
  const emailFields = document.getElementById("emailFields");
  const emailForm = document.getElementById("emailForm");

  emailFields.innerHTML = "";
  if (numEmails > 0) {
      for (let i = 0; i < numEmails; i++) {
          const input = document.createElement("input");
          input.type = "email";
          input.placeholder = `Enter Email ${i + 1}`;
          input.className = "email-input";
          input.required = true;
          emailFields.appendChild(input);
      }
      emailForm.style.display = "block";
  } else {
      emailForm.style.display = "none";
  }
}

// Function to show toast notifications
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
  }, 3000);
}
