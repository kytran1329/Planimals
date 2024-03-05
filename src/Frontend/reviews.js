const APILINK = 'http://44.202.46.124:8000/api/v1/reviews/';

const url = new URL(location.href); //makes object of the url for below to access it
const apartmentId = url.searchParams.get("id")//gets the ID from the url
const apartmentTitle = url.searchParams.get("title")//gets titls from url

const main = document.getElementById("section");
const title = document.getElementById("title");

title.innerText = apartmentTitle


//adds a new element of a palce to enter a new review
const div_new = document.createElement('div');
div_new.innerHTML = `
  <div class="row">
    <div class="column">
      <div class="ReviewCard">
          New Review
          <p><strong>Review: </strong>
            <input class="reviewInput" type="text" id="new_review" value="">
          </p>
          <p><strong>User: </strong>
            <input  class="reviewInput"type="text" id="new_user" value="">
          </p>
          <p><strong>Price: </strong>
            <input  type="number" class="reviewInput" id="new_price" value="600" step="20" min="1" max="5000">
          </p>
          <p><a href="#" id="submitButton" onclick="saveReview('new_review', 'new_user', 'new_price')">💾</a>
          </p>
      </div>
    </div>
  </div>
`
main.appendChild(div_new)







const button1 = document.querySelector("#button1");//assigns functionality to button1
button1.onclick = resetToMain;

function resetToMain(){
  window.location.href = 'index.html';
}


returnReviews(APILINK)

function returnReviews(url){
  console.log("returning reviews")

  console.log(url + "apartment/" + apartmentId)
  let index = 0


  fetch(url + "apartment/" + apartmentId).then(res => res.json())//gets reviews from backend and converts it to a js object
  .then(function(data){//takes in the previous object and uses it to loop through
  console.log(data);
  data.forEach(review => {
    
      const div_card = document.createElement('div');//creates a div and makes all html inside
      div_card.innerHTML = `
      <div class="row">
        <div class="column">
          <div class="ReviewCard" id="${review._id}">
            <p style='font: 20px system-ui;'>${review.user}</p>
            <p ><strong>Review: </strong>${review.review}</p>
            <p><a href="#"onclick="editReview('${review._id}','${review.review}', '${review.user}')">📝</a>
              <a href="#" onclick="deleteReview('${index}', '${apartmentId}')"> 🗑</a>
            </p>
          </div>
        </div>
      </div>
    `

      main.appendChild(div_card);
      index++
  });
});
}



function editReview(id, review, user) {

    const element = document.getElementById(id);
    const reviewInputId = "review" + id
    const userInputId = "user" + id
    
    element.innerHTML = `
                <p><strong>Review: </strong>
                  <input class="reviewInput" type="text" id="${reviewInputId}" value="${review}">
                </p>
                <p><strong>User: </strong>
                  <input class="reviewInput" type="text" id="${userInputId}" value="${user}">
                </p>
                <p><a href="#" onclick="saveReview('${reviewInputId}', '${userInputId}', '${id}',)">💾</a>
                </p>
    
    `
  }



function saveReview(reviewLocation,userLocation, priceLocation){
  console.log("trying to save")
    const review = document.getElementById(reviewLocation).value;
    const user = document.getElementById(userLocation).value;
    const price = document.getElementById(priceLocation).value;
    
      fetch(APILINK + "new", {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({"apartmentId": apartmentId, "review": review, "user": user, "price": price})
      }).then(res => res.json())
        .then(res => {
          console.log(res)
          location.reload();
        });
    }
  
  

  function deleteReview(id, apartmentId) {
    fetch(APILINK + "/reviews/" + id, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"apartmentId": apartmentId}),
    }).then(res => res.json())
      .then(res => {
        console.log(res)
        location.reload();
      });    
  }







  