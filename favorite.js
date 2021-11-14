const BASE_URL = "https://lighthouse-user-api.herokuapp.com/"
const INDEX_URL = BASE_URL + "api/v1/users/"
const users = JSON.parse(localStorage.getItem("favoriteUsers")) || []

const dataPanel = document.querySelector("#data-panel")
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div id="user-panel" class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 my-2 d-flex flex-column align-items-center">
      <a href="#user-modal" data-toggle="modal" ><img data-id="${item.id}" src="${item.avatar}" alt="User Pic" class="btn-show-user"></a>
      <div class="d-flex align-items-center card-footer">
        <a href="#user-modal" data-toggle="modal" class="link-secondary"><h6 data-id="${item.id}" class="btn-show-user">${item.name} ${item.surname}</h6></a>
        <button class="btn btn-outline-danger btn-remove-favorite" data-id="${item.id}">X</button>
      </div>
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

//active modal
dataPanel.addEventListener('click', function onPanelClick(event) {
  const id = event.target.dataset.id
  if (event.target.matches('.btn-show-user')) {
    showUserModal(Number(id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(id))
  }
})

function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalImage = document.querySelector('#user-modal-image')
  const modalGender = document.querySelector('#user-modal-gender')
  const modalEmail = document.querySelector('#user-modal-email')
  const modalRegion = document.querySelector('#user-modal-region')
  const modalAge = document.querySelector('#user-modal-age')
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data
      modalTitle.innerText = data.name + ' ' + data.surname
      modalGender.innerText = 'Gender: ' + data.gender
      modalEmail.innerText = 'E-mail: ' + data.email
      modalRegion.innerText = 'Come from: ' + data.region
      modalAge.innerText = 'Birthday: ' + data.birthday + ' (' + data.age + ' years old)'
      modalImage.innerHTML = `<img src="${data.avatar}" alt="user-poster" class="img-fluid">`
    })
}

//移除好友
function removeFromFavorite(id) {
  if (!users || !users.length) return
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  users.splice(userIndex, 1)
  localStorage.setItem("favoriteUsers", JSON.stringify(users))
  renderUserList(users)
}

renderUserList(users)


