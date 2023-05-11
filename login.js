const email = document.querySelector("#emailField").value;

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  // sophie.bluel@test.tld
  // S0phie
  e.preventDefault();
  const password = document.querySelector("#passwordField").value;
  const email = document.querySelector("#emailField").value;
  let user = {
    email: email,
    password: password,
  };

  let response = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(user),
  });
  let result = await response.json();
  if (response.ok) {
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
