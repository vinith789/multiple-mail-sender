let emailCount = 0;

    function addEmail() {
        emailCount++;
        const emailContainer = document.getElementById("email-container");

        const emailCard = document.createElement("div");
        emailCard.className = "email-card";
        emailCard.id = `email-card-${emailCount}`;

        emailCard.innerHTML = `
            <h3>Email ${emailCount}</h3>
            <input type="email" class="email-input"  placeholder="Enter Email">
            <button onclick="addRole(${emailCount})">+ Add Role</button>
            <div class="roles-container"></div>
            <div class="message-preview"></div>
        `;

        emailContainer.appendChild(emailCard);
        addRole(emailCount); // Add the first role by default
    }

    function addRole(emailId) {
        const rolesContainer = document.querySelector(`#email-card-${emailId} .roles-container`);
        const roleCount = rolesContainer.children.length + 1;

        const roleInput = document.createElement("input");
        roleInput.type = "text";
        roleInput.className = "role-input";
        roleInput.placeholder = `Role ${roleCount}`;
        roleInput.dataset.roleNumber = roleCount;
        roleInput.oninput = updatePreview;

        rolesContainer.appendChild(roleInput);
        updatePreview();
    }

    function updatePreview() {
        const emailCards = document.querySelectorAll(".email-card");
        const messageTemplate = document.getElementById("message").value;

        emailCards.forEach(card => {
            const roles = Array.from(card.querySelectorAll(".role-input"))
                               .map((input, index) => ({ key: `{role${index + 1}}`, value: input.value.trim() }))
                               .filter(role => role.value);

            let finalMessage = messageTemplate;
            roles.forEach(role => {
                finalMessage = finalMessage.replace(new RegExp(role.key, 'g'), role.value);
            });

            const previewDiv = card.querySelector(".message-preview");
            previewDiv.innerHTML = `<p>${finalMessage}</p>`;
        });
    }

    async function sendEmails() {
        const statusDiv = document.getElementById("status");
        statusDiv.style.display = "block";
        statusDiv.className = "status-message loading";
        statusDiv.textContent = "Sending emails, please wait...";

        const emailsData = [];
        const emailCards = document.querySelectorAll(".email-card");
        const subject = document.getElementById("subject").value;

        emailCards.forEach(card => {
            const email = card.querySelector(".email-input").value.trim();
            const roles = Array.from(card.querySelectorAll(".role-input"))
                              .map(input => input.value.trim())
                              .filter(role => role);

            if (email && roles.length > 0) {
                emailsData.push({ email, roles });
            }
        });

        const message = document.getElementById("message").value;

        if (emailsData.length === 0 || !subject || !message) {
            statusDiv.className = "status-message error";
            statusDiv.textContent = "Please fill in all fields.";
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailsData, subject, message })
            });

            const result = await response.json();

            if (response.ok) {
                statusDiv.className = "status-message success";
                statusDiv.textContent = result.message;

                // Reset everything after success
                resetForm();
            } else {
                statusDiv.className = "status-message error";
                statusDiv.textContent = result.message || "Failed to send emails Please Check the Mail Correctly.";
            }
        } catch (error) {
            statusDiv.className = "status-message error";
            statusDiv.textContent = "Error: Unable to connect to the server.";
        }
    }

    function resetForm() {
        document.getElementById("email-container").innerHTML = "";
        document.getElementById("subject").value = "";
        document.getElementById("message").value = "";
        emailCount = 0;
        setTimeout(() => {
            document.getElementById("status").style.display = "none";
        }, 3000);
    }