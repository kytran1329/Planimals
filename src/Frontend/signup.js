const APILINK = 'https://y0f0mbqsf6.execute-api.us-east-1.amazonaws.com/Paw-Stage';

const createButton = document.querySelector("#createButton");

// Assigning a function reference to onclick, not calling the function immediately
createButton.onclick = function() {
    // Get values when the button is clicked
    const user = document.getElementById("new_user").value;
    const pass = document.getElementById("password").value;
    signUp(user, pass);
};

function signUp(user, pass) {
    if (!user || !pass) {
        console.log("No username/password was input. Please input a valid username/password.");
        return;
    }

    console.log("trying to add user");

    fetch(APILINK + "/user", {
        method: 'POST',
        body: JSON.stringify({ "username": user, "password": pass })
    }).then(res => res.json())
      .then(res => {
          console.log(res);
          if (res.statusCode == 401) {
            
              alert("Account creation failure. Please try again later.");
          }
          sessionStorage.setItem("user", user.toString());
          window.location.href = 'index.html'
      });
}
