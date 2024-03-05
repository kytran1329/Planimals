const APILINK = 'https://y0f0mbqsf6.execute-api.us-east-1.amazonaws.com/Paw-Stage';
// "/api/v1/reviews"
const IMG_PATH = "apartmentPhotos/";


//gets variables from the "docuemnt" (.html file)
const filler = document.getElementById("topTitle")
const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const button1 = document.querySelector("#button1");//use .query selector to get buttorns
const button2 = document.querySelector("#button2");
// const button3 = document.querySelector("#button3");
const button4 = document.querySelector("#button4");


button4.onclick = goToEditPage = () => {window.location.href = 'login.html'}

button1.onclick = resetToMain;// sets functionality to resetMain()

function resetToMain(){//calls the api wihtout any info meaanaing it will reset to the default home page 
  main.innerHTML = '';
  returnToDO(APILINK)
}

button2.onclick = goToEditPage = () => {window.location.href = 'addToDo.html'}



// button3.onclick = deleteAllTodo = () => {
//   fetch(APILINK + "/to-do?id=22223&all=yes", {
//     method: 'DELETE'
//   }).then(res => console.log(res))

//   setTimeout(function() {
//     location.reload();
// }, 500);
  
// }

// // Set a value in sessionStorage
// sessionStorage.setItem('username', 'testUser');

// // Get the value from sessionStorage
// let username = sessionStorage.getItem('user');
// console.log("HERER IT IS: " + username); // Outputs: exampleUser


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


returnToDo(APILINK + '/to-do/user/?userID=' + getCurrentUser().toString())//calls to the function written below
function returnToDo(url){
  fetch(url)
  .then(res => res.json())
  .then(function(data){
      console.log(data);
      data.items.forEach((element) => {
          const div_card = document.createElement('div');
          if(element.completed == "true"){
            console.log("calling True")
            div_card.setAttribute('class', 'completedCard');
          }
          else{
            console.log("calling False")
            div_card.setAttribute('class', 'card');
          }

          const div_column = document.createElement('div');
          div_column.setAttribute('class', 'column');

          const title = document.createElement('h3');
          title.setAttribute('class', 'toDoTitle');
          title.innerHTML = `${element.title}`;

          const pDesc = document.createElement('p');
          pDesc.setAttribute('class', 'description');
          pDesc.innerHTML = `${element.description}`;

          const editButton = document.createElement('button');
          editButton.classList.add('highlight');
          editButton.setAttribute('class', 'highlight');
          if(element.completed == "true"){
            console.log("calling True")
            editButton.textContent = 'Completed';
            editButton.setAttribute('class', 'basicButton');
          }
          else{
            console.log("calling False")
            editButton.textContent = 'In Progress';
            editButton.setAttribute('class', 'highlight');
          }

          editButton.addEventListener('click', function(event) {
            // Stop propagation of click event
            event.stopPropagation();
            completask(element.id, element.completed);
          });


          div_card.appendChild(title);
          div_card.appendChild(pDesc);
          div_card.appendChild(editButton);
          div_column.appendChild(div_card);

          document.getElementById("todolist").appendChild(div_column);

          div_card.addEventListener('click', function() {
            // console.log(`reviews.html?id=${element._id}&title=${element.name}`);
            elementID = `${element.id}`
            // elementTitle = `${element.name}`
            // //take user to url listed above
            // window.location.href = "reviews.html?id=" + elementID + "&title=" + elementTitle;
            
        
            // console.log('Button clicked for ' + element.name);
            window.location.href = "editTo-do.html?id=" + elementID
          });
      });

      // Display a message if no tasks are found
      if(data.items.length === 0){
          const noTasksMessage = document.createElement('p');
          noTasksMessage.textContent = 'No tasks found';
          document.getElementById("todolist").appendChild(noTasksMessage);
      }
  })
  .catch(error => {
      console.error('Error fetching tasks:', error);
  });
}

// Function to handle editing a task
function completask(taskId, isComplete) {
  // Add your logic to handle editing the task here
  console.log('Completeings tast task with ID:', taskId);
  
  if(isComplete){
  fetch(APILINK + "/to-do", {
    method: 'PATCH',
    body: JSON.stringify({
      "id": taskId.toString(),
      "updateKey": "completed",
      "updateValue": "true"
    })
  }).then(res => res.json())
    .then(res => {
      console.log(res)
      setTimeout(function() {
        location.reload();
    }, 300);
      
    });
  }
  else{
    fetch(APILINK + "/to-do", {
      method: 'PATCH',
      body: JSON.stringify({
        "id": taskId.toString(),
        "updateKey": "completed",
        "updateValue": "false"
      })
    }).then(res => res.json())
      .then(res => {
        console.log(res)
        setTimeout(function() {
          location.reload();
      }, 300);
        
      });
  }
return 
}



const tigerDisplayElem = document.getElementById("tigerPic")

//calls function
tigerDisplayDecide();
// Function to decide what tiger to display based on the percentage of tasks done
async function tigerDisplayDecide() {
  console.log("Entered display decide function");
  let percentDone = await percentCompleted();
  let p = document.createElement("p");

  if (percentDone >= 0 && percentDone < 0.2) {
    document.getElementById("tigerPage").append("Valentino is dead...", p);
    console.log("Tiger is Dead");
    tigerDisplayElem.src = '/images/DeadTiger.png'
  } else if (percentDone >= 0.2 && percentDone < 0.4) {
    document.getElementById("tigerPage").append("Valentino is angry.", p);
    console.log("Tiger is Angry");
    tigerDisplayElem.src = '/images/AngryTiger.png'
  } else if (percentDone >= 0.4 && percentDone < 0.6) {
    document.getElementById("tigerPage").append("Valentino is relaxed.", p);
    console.log("Tiger is Relaxed");
    tigerDisplayElem.src = '/images/RelaxedTiger.png'
  } else if (percentDone >= 0.6 && percentDone < 0.8) {
    document.getElementById("tigerPage").append("Valentino is happy!", p);
    console.log("Tiger is Happy");
    tigerDisplayElem.src = '/images/HappyTiger.png'
  } else if (percentDone >= 0.8 && percentDone <= 1) {
    document.getElementById("tigerPage").append("Valentino is excited!", p);
    console.log("Tiger is Excited");
    tigerDisplayElem.src = '/images/ExcitedTiger.png'
  } else {
    document.getElementById("tigerPage").append("Valentino is relaxed.", p);
    console.log("Value not found");
  }
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


// Function to calculate the percentage of completed tasks
async function percentCompleted() {
  let currentUser = getCurrentUser()
  let completedCount = -1;
  await fetch(APILINK + "/to-do/completedCount/?user=" + currentUser)
    .then((res) => res.json())
    .then((res) => {
      completedCount = res.count;
      console.log("Completed: " + completedCount);
    });

  let incompletedCount = -1;
  await fetch(APILINK + "/to-do/incompletedCount/?user=" + currentUser)
    .then((res) => res.json())
    .then((res) => {
      incompletedCount = res.count;
      console.log("Incompleted: " + incompletedCount);
    });

  let totalNumber = completedCount + incompletedCount;

  return completedCount / totalNumber;
}

