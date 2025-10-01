let emailCount = 0;
let senderEmail = "";
let senderPassword = "";

// Step 1: Proceed to Form
function proceedToEmailForm() {
    senderEmail = document.getElementById("senderEmail").value.trim();
    senderPassword = document.getElementById("senderPassword").value.trim();

    if (!senderEmail || !senderPassword) {
        alert("Please enter both email and password.");
        return;
    }

    // Show form
    document.getElementById("login-section").style.display = "none";
    document.getElementById("email-form-section").style.display = "block";
}

function addEmail() {
    emailCount++;
    const emailContainer = document.getElementById("email-container");

    const emailCard = document.createElement("div");
    emailCard.className = "email-card";
    emailCard.id = `email-card-${emailCount}`;

    emailCard.innerHTML = `
        <h3>Email ${emailCount}</h3>
        <input type="email" class="email-input" placeholder="Enter Email">
        <button onclick="addRole(${emailCount})">+ Add Role</button>
        <div class="roles-container"></div>
        <div class="message-preview"></div>
    `;

    emailContainer.appendChild(emailCard);
    addRole(emailCount); // Add one role by default
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
    const messageTemplate = document.getElementById("message").value;
    const emailCards = document.querySelectorAll(".email-card");

    emailCards.forEach(card => {
        let finalMessage = messageTemplate;

        const roleInputs = card.querySelectorAll(".role-input");
        roleInputs.forEach((roleInput, index) => {
            const roleNumber = index + 1;
            const rolePlaceholder = `{role${roleNumber}}`;

            if (finalMessage.includes(rolePlaceholder)) {
                finalMessage = finalMessage.replaceAll(rolePlaceholder, roleInput.value || "");
            }
        });

        // 🔥 Very important: Remove any unused {roleX}
        finalMessage = finalMessage.replace(/{role\d+}/g, "");

        const previewDiv = card.querySelector(".message-preview");
        previewDiv.innerHTML = `<strong>Preview:</strong> <br> ${finalMessage}`;
    });
}

async function sendEmails() {
    const statusDiv = document.getElementById("status");
    statusDiv.style.display = "block";
    statusDiv.className = "status-message loading";
    statusDiv.textContent = "Sending emails, please wait...";

    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const emailsData = [];
    const emailCards = document.querySelectorAll(".email-card");

    emailCards.forEach(card => {
        const email = card.querySelector(".email-input").value.trim();
        const roles = Array.from(card.querySelectorAll(".role-input"))
                          .map(input => input.value.trim())
                          .filter(role => role);

        if (email && roles.length > 0) {
            emailsData.push({ email, roles });
        }
    });

    if (!subject || !message || emailsData.length === 0) {
        statusDiv.className = "status-message error";
        statusDiv.textContent = "Please fill in all fields.";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senderEmail,
                senderPassword,
                subject,
                message,
                emailsData
            })
        });

        const result = await response.json();

        if (response.ok) {
            statusDiv.className = "status-message success";
            statusDiv.textContent = result.message;
            resetForm();
        } else {
            statusDiv.className = "status-message error";
            statusDiv.textContent = result.message || "Failed to send emails.";
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

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (['txt', 'csv', 'json'].includes(ext)) {
        reader.onload = function (e) {
            const content = e.target.result;

            if (ext === 'json') {
                const data = JSON.parse(content);
                data.forEach(d => createEmailCard([d.email, ...(d.roles || [])]));
            } else {
                const lines = content.trim().split(/\r?\n/);
                lines.forEach(line => {
                    const values = line.split(',').map(v => v.trim());
                    createEmailCard(values);
                });
            }
        };
        reader.readAsText(file);

    } else if (ext === 'xlsx') {
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            rows.forEach(row => {
                if (row.length > 0) {
                    const email = row[0];
                    const roles = row.slice(1).filter(r => r); // skip empty
                    createEmailCard([email, ...roles]);
                }
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Unsupported file type");
    }
}

document.getElementById("fileInput").addEventListener("change", handleFileUpload);

function createEmailCard(values) {
    console.log("Email:", values[0]);
    console.log("Roles:", values.slice(1));

    emailCount++;
    const emailContainer = document.getElementById("email-container");

    const emailCard = document.createElement("div");
    emailCard.className = "email-card";
    emailCard.id = `email-card-${emailCount}`;

    let rolesHTML = '';
    values.slice(1).forEach((roleValue, roleIndex) => {
        rolesHTML += `<input type="text" class="role-input" value="${roleValue}" placeholder="Role ${roleIndex + 1}" data-role-number="${roleIndex + 1}" oninput="updatePreview()">`;
    });

    emailCard.innerHTML = `
        <h3>Email ${emailCount}</h3>
        <input type="email" class="email-input" value="${values[0]}" placeholder="Enter Email">
        <button onclick="addRole(${emailCount})">+ Add Role</button>
        <div class="roles-container">${rolesHTML}</div>
        <div class="message-preview"></div>
    `;

    emailContainer.appendChild(emailCard);
}

