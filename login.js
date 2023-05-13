const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  // sophie.bluel@test.tld
  // S0phie
  e.preventDefault();

  const user = {
    email: document.querySelector("#emailField").value,
    password: document.querySelector("#passwordField").value,
  };

  let response = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (response.ok) {
    let result = await response.json();
    document.cookie = `access_token=${result.token}`;
    window.location.href = "/client/index.html";
  } else {
    if (document.querySelector("#errorMsg")) return;
    let errorMsg = document.createElement("div");
    errorMsg.id = "errorMsg";
    errorMsg.className = "login-error-msg-container";
    errorMsg.innerHTML =
      "<span class='login-error-msg'>Adresse mail ou mot de passe incorrect</span>";
    document.querySelector(".login-form-container").append(errorMsg);
    setTimeout(() => {
      errorMsg.remove();
    }, 5000);
  }
});
