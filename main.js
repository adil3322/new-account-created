const card =
  document.querySelector(".card");

const forms =
  document.querySelector(".forms");

const hero =
  document.querySelector(".card-hero-inner");

const buttons =
  document.querySelectorAll(
    ".card-nav button"
  );


// ================= VIEW SWITCH =================

function selectView(view) {

  clearMessages();


  if (view === "signin") {

    forms.style.transform =
      "translateY(0%)";

    hero.style.transform =
      "translateY(0%)";

    document
      .querySelector(".card-nav")
      .classList
      .remove("signup-active");

    document
      .getElementById("forgot-password")
      .style.display = "flex";

    document
      .getElementById("reset-section")
      .style.display = "none";

    return;
  }


  if (view === "signup") {

    forms.style.transform =
      "translateY(-33.333333%)";

    hero.style.transform =
      "translateY(-33.333333%)";

    document
      .querySelector(".card-nav")
      .classList
      .add("signup-active");

    document
      .getElementById("forgot-password")
      .style.display = "flex";

    document
      .getElementById("reset-section")
      .style.display = "none";

    return;
  }


  if (view === "forgot") {

    forms.style.transform =
      "translateY(-66.666666%)";

    hero.style.transform =
      "translateY(-66.666666%)";

    document
      .querySelector(".card-nav")
      .classList
      .remove("signup-active");

  }

}


// ================= FORGOT PASSWORD VIEW =================

function showForgotPassword(event) {

  event.preventDefault();

  const email =
    document
      .getElementById("signin-email")
      .value
      .trim();


  document
    .getElementById("forgot-email")
    .value = email;


  selectView("forgot");

}


// ================= BACK TO SIGN IN =================

function showSignIn() {

  selectView("signin");

}


// ================= PASSWORD TOGGLE =================

function togglePassword(
  id,
  button
) {

  const input =
    document.getElementById(id);


  if (
    input.type === "password"
  ) {

    input.type = "text";

    button.textContent =
      "Hide";

  } else {

    input.type = "password";

    button.textContent =
      "Show";

  }

}


// ================= SIGN IN =================

async function handleSignIn(event) {

  event.preventDefault();


  const email =
    document
      .getElementById("signin-email")
      .value
      .trim();


  const password =
    document
      .getElementById("signin-password")
      .value;


  const message =
    document
      .getElementById("signin-message");


  message.textContent =
    "Signing in...";

  message.className =
    "message info";


  try {

    const response =
      await fetch(
        "https://new-account-created-1.onrender.com/api/signin", 
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      showMessage(
        message,
        data.message ||
          "Sign in failed.",
        "error"
      );

      return;

    }


    showMessage(
      message,
      data.message,
      "success"
    );


    localStorage.setItem(
      "user",
      JSON.stringify(
        data.user
      )
    );


  } catch (error) {

    console.error(error);

    showMessage(
      message,
      "Cannot connect to server.",
      "error"
    );

  }

}


// ================= SIGN UP =================

async function handleSignUp(event) {

  event.preventDefault();


  const name =
    document
      .getElementById("signup-name")
      .value
      .trim();


  const email =
    document
      .getElementById("signup-email")
      .value
      .trim();


  const password =
    document
      .getElementById("signup-password")
      .value;


  const message =
    document
      .getElementById("signup-message");


  message.textContent =
    "Creating account...";

  message.className =
    "message info";


  try {

    const response =
      await fetch(
        "https://new-account-created-1.onrender.com/api/signup",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            name,
            email,
            password
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      showMessage(
        message,
        data.message ||
          "Account creation failed.",
        "error"
      );

      return;

    }


    showMessage(
      message,
      data.message,
      "success"
    );


    document
      .getElementById("signup")
      .reset();


    setTimeout(() => {

      selectView("signin");

      document
        .getElementById(
          "signin-email"
        )
        .value = email;

    }, 1500);


  } catch (error) {

    console.error(error);

    showMessage(
      message,
      "Cannot connect to server.",
      "error"
    );

  }

}


// ================= FORGOT PASSWORD =================

async function handleForgotPassword(event) {

  event.preventDefault();


  const email =
    document
      .getElementById("forgot-email")
      .value
      .trim();


  const message =
    document
      .getElementById("forgot-message");


  message.textContent =
    "Checking your account...";

  message.className =
    "message info";


  try {

    const response =
      await fetch(
        "https://new-account-created-1.onrender.com/api/forgot-password",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      showMessage(
        message,
        data.message ||
          "Unable to reset password.",
        "error"
      );

      return;

    }


    showMessage(
      message,
      "Reset token generated. Copy it below.",
      "success"
    );


    // Show reset section
    document
      .getElementById(
        "reset-section"
      )
      .style.display = "block";


    // Put token automatically
    document
      .getElementById(
        "reset-token"
      )
      .value =
        data.resetToken;


  } catch (error) {

    console.error(error);

    showMessage(
      message,
      "Cannot connect to server.",
      "error"
    );

  }

}


// ================= RESET PASSWORD =================

async function handleResetPassword() {

  const token =
    document
      .getElementById("reset-token")
      .value
      .trim();


  const password =
    document
      .getElementById("reset-password")
      .value;


  const message =
    document
      .getElementById("reset-message");


  if (!token || !password) {

    showMessage(
      message,
      "Token and new password are required.",
      "error"
    );

    return;

  }


  if (password.length < 6) {

    showMessage(
      message,
      "Password must be at least 6 characters.",
      "error"
    );

    return;

  }


  message.textContent =
    "Resetting password...";

  message.className =
    "message info";


  try {

    const response =
      await fetch(
        "https://new-account-created-1.onrender.com/api/reset-password",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            token,
            password
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      showMessage(
        message,
        data.message ||
          "Password reset failed.",
        "error"
      );

      return;

    }


    showMessage(
      message,
      data.message,
      "success"
    );


    // Clear reset fields
    document
      .getElementById(
        "reset-token"
      )
      .value = "";


    document
      .getElementById(
        "reset-password"
      )
      .value = "";


    // Go back to sign in
    setTimeout(() => {

      selectView("signin");

    }, 1800);


  } catch (error) {

    console.error(error);

    showMessage(
      message,
      "Cannot connect to server.",
      "error"
    );

  }

}


// ================= MESSAGE =================

function showMessage(
  element,
  text,
  type
) {

  element.textContent =
    text;

  element.className =
    "message " + type;

}


function clearMessages() {

  document
    .querySelectorAll(".message")
    .forEach(
      message => {

        message.textContent =
          "";

        message.className =
          "message";

      }
    );

}


// ================= RESIZE =================

let resizeTimer;


window.addEventListener(
  "resize",
  () => {

    card.classList.add(
      "resizing"
    );


    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        () => {

          card.classList.remove(
            "resizing"
          );

        },
        150
      );

  }
);