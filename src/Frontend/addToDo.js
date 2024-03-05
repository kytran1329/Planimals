const APILINK = 'https://y0f0mbqsf6.execute-api.us-east-1.amazonaws.com/Paw-Stage';

const url = new URL(location.href); //makes object of the url for below to access it
const movieId = url.searchParams.get("id")//gets the ID from the url
const movieTitle = url.searchParams.get("title")//gets titls from url

const main = document.getElementById("section");
const title = document.getElementById("title");

title.innerText = movieTitle


//adds a new element of a palce to enter a new review
const div_new = document.createElement('div');
div_new.innerHTML = `
<div class = "Signup_row" style="width:60%; color:white;  font-family: 'Poppins', sans-serif;">
  <div class="AddNewtoDoCard" style="font-size:20px; margin-left:auto; margin-right:auto;">
    <div style="font-size:50px"> New To Do</div></br>
      <p style = "margin-top: 1%;"><strong>What're We Doing?: </strong></br>
        <input class="reviewInput" type="text" id="new_name" value="">
      </p></br></br>
      <p><strong>Description: </strong>
        <input style="height: 50px" class="reviewInput" type="text" id="new_description" value="">
      </p></br></br>
      <button class ="highlight" href="#" onclick="saveReview('new_name', 'new_description', 'new_poster_path')" style = "color: white;  font-family: 'Poppins', sans-serif; margin-top:0; background-color: #355c7D">Save</button>
  </div>
</div>`

main.appendChild(div_new)


const button1 = document.querySelector("#button1");//assigns functionality to button1
button1.onclick = resetToMain;

function resetToMain(){
  window.location.href = 'index.html';
  returnMovies(APILINK)
}


function getCurrentUser(){
  let userIDValue = sessionStorage.getItem("user");
  if(userIDValue == null){
    console.log("User is not logged in ")
    window.location.href = 'login.html'
    return
  }
  else {
    console.log("user id: " + userIDValue)
    return userIDValue
  }
}

function saveReview(nameID, descriptionID){
    console.log("trying to save")

    const title = document.getElementById(nameID).value;
    const description = document.getElementById(descriptionID).value;

    toDoId = counttoDos()
    let currentUser = getCurrentUser()
    
    fetch(APILINK + "/to-do", {
      method: 'POST',
      body: JSON.stringify({
        "finishDate": "", 
        "priority": "1", 
        "link": "",
        "description": description,
        "repeating": false,
        "title": title,
        "userID": currentUser.toString()
      })
    }).then(res => res.json())
      .then(res => {
        console.log(res)
        location.reload();
      });
}

function counttoDos(){
  //gets the current number of toDos as returns the id as the next avaliable number
  fetch(APILINK).then(res => res.json()).then(function(data){
    console.log(data.length + 1)
    return data.length + 1})
}


