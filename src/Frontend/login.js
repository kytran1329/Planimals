const APILINK = 'https://y0f0mbqsf6.execute-api.us-east-1.amazonaws.com/Paw-Stage';

const logInButton = document.querySelector("#signInButton");
const signUpButton = document.querySelector("#signUpButton")


// Assigning a function reference to onclick, not calling the function immediately
logInButton.onclick = function() {
    // Get values when the button is clicked
    const user = document.getElementById("new_user").value;
    const pass = document.getElementById("password").value;
    signIn(user, pass);
};

signUpButton.onclick = goToSignInPage = () => {window.location.href = 'signup.html'}


function signIn(user, pass) {
    console.log("entered");

    if (!user || !pass) {
        console.log("No username/password was input. Please input a valid username/password.");
        return;
    }
        //user/validate?username=jakeLong&password=54321
    fetch(APILINK + "/user/validate?username=" + user + "&password=" + pass,
    {method: 'GET'}).then(res=>res.json())
    .then(res=>
        {
            if(res.isLoggedIn){
                sessionStorage.setItem("user", user.toString());

                {window.location.href = 'index.html';
            }
    }else{
        console.log("THERE IS NO " + user);
    }});


}
