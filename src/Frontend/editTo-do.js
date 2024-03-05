const APILINK = 'https://y0f0mbqsf6.execute-api.us-east-1.amazonaws.com/Paw-Stage';

const saveTodoButton = document.querySelector("#saveTodo");
const deleteTodoButton = document.querySelector("#deleteTodo");
const button1 = document.querySelector("#button1");



button1.onclick = goToSignInPage = () => {window.location.href = 'index.html'}




// Assigning a function reference to onclick, not calling the function immediately
saveTodoButton.onclick = function() {
    // Get values when the button is clicked
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const urlParams = new URLSearchParams(window.location.search);
    const idValue = urlParams.get('id');
    saveTodo(title, description, idValue);
};

deleteTodoButton.onclick = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idValue = urlParams.get('id');

    fetch(APILINK + "/to-do?id=" + idValue + "&all=no", {
        method: 'DELETE'
      })
    
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 500);
};


function saveTodo(title, description, id){
    console.log("trying to save")

    console.log(title)
    console.log(description)
    console.log(title == "")
    console.log(description == "")

    if(title == "" && description == ""){
        window.location.href = 'index.html'
        return
    }

    if(title == ""){
        //update desc
        fetch(APILINK + "/to-do", {
            method: 'PATCH',
            body: JSON.stringify({
              "id": id.toString(),
              "updateKey": "description",
              "updateValue": description
            })
          }).then(res => res.json())
            .then(res => {
              console.log(res)
              window.location.href = 'index.html'
            });
        return 
    }
    if(description == ""){
        //update title
        fetch(APILINK + "/to-do", {
            method: 'PATCH',
            body: JSON.stringify({
              "id": id.toString(),
              "updateKey": "title",
              "updateValue": title
            })
          }).then(res => res.json())
            .then(res => {
              console.log(res)
              window.location.href = 'index.html'
            });

        return
    }

    //update both

    //update title
    fetch(APILINK + "/to-do", {
        method: 'PATCH',
        body: JSON.stringify({
          "id": id.toString(),
          "updateKey": "title",
          "updateValue": title
        })
      }).then(res => res.json())
        .then(res => {
          console.log(res)
          window.location.href = 'index.html'
        });

    //update descritpion
    fetch(APILINK + "/to-do", {
        method: 'PATCH',
        body: JSON.stringify({
          "id": id.toString(),
          "updateKey": "description",
          "updateValue": description
        })
      }).then(res => res.json())
        .then(res => {
          console.log(res)
          window.location.href = 'index.html'
        });

    return 
}
