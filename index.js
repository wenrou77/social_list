const BASE_URL = "https://lighthouse-user-api.herokuapp.com/"
const INDEX_URL = BASE_URL + "api/v1/users/"
const users = []
let filteredUsers = []

//render all user list
axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results);
  renderPaginator(users.length)
  renderUserList(getUserByPage(1))
})

const dataPanel = document.querySelector("#data-panel")
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div id="user-panel" class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-1 my-2 d-flex flex-column align-items-center">
      <a href="#user-modal" data-toggle="modal" ><img data-id="${item.id}" src="${item.avatar}" alt="User Pic" class="btn-show-user"></a>
      <div class="d-flex align-items-center card-footer">
        <a href="#user-modal" data-toggle="modal" class="link-secondary"><h6 data-id="${item.id}" class="btn-show-user">${item.name} ${item.surname}</h6></a>
        <button class="btn btn-outline-secondary btn-add-favorite" data-id="${item.id}">+</button>
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
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(id))
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

//Search area
const searchForm = document.querySelector('#search-form')
const searchMale = document.querySelector('#search-male')
const searchFemale = document.querySelector('#search-female')
const searchAge = document.querySelector('#search-age')
const searchName = document.querySelector('#search-name')
const searchState = document.querySelector('#search-state')
const searchSubmit = document.querySelector('#search-submit')

searchSubmit.addEventListener('click', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const maleChecked = searchMale.checked
  const femaleChecked = searchFemale.checked
  const ageSelectedIndex = searchAge.selectedIndex
  const ageSelectedText = searchAge.value
  const nameKeyword = searchName.value.trim().toLowerCase()
  const stateKeyword = searchState.value.trim().toLowerCase()

  //若男女都勾或是都沒有勾，預設為男女都一起篩選
  var gender
  if (maleChecked && femaleChecked) {
    gender = false
  } else if (!maleChecked && !femaleChecked) {
    gender = false
  } else if (femaleChecked) {
    gender = "female"
  } else if (maleChecked) {
    gender = "male"
  }

  //若不選擇年紀區間，預設範圍為1~150歲
  const age_start = ageSelectedIndex !== 0 ? ageSelectedText.split('~')[0] : 1
  const age_end = ageSelectedIndex !== 0 ? ageSelectedText.split('~')[1] : 150

  //如果男女都選或是都不選，則不對性別進行篩選
  if (!gender) {
    filteredUsers = users.filter((user) =>
      (user.name.toLowerCase().includes(nameKeyword) || user.surname.toLowerCase().includes(nameKeyword)) && user.region.toLowerCase().includes(stateKeyword) && user.age >= age_start && user.age < age_end
    )
  } else {
    filteredUsers = users.filter((user) =>
      (user.name.toLowerCase().includes(nameKeyword) || user.surname.toLowerCase().includes(nameKeyword)) && user.region.toLowerCase().includes(stateKeyword) && user.gender === gender && user.age >= age_start && user.age < age_end
    )
  }

  if (filteredUsers.length === 0) {
    return alert(`沒有符合條件的用戶`)
  }
  renderPaginator(filteredUsers.length)
  renderUserList(getUserByPage(1))
})

//添加好友功能
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)
  if (list.some((user) => user.id === id)) {
    return alert('這位朋友已經在收藏清單中！')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

//分頁
const USERS_PER_PAGE = 24
const paginator = document.querySelector('#paginator')

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const totalPage = event.target.parentElement.parentElement.childElementCount
  const page = Number(event.target.dataset.page)
  for (i = 1; i <= totalPage; i++) {
    liClass = event.target.parentElement.parentElement.children[i - 1]
    if (parseInt(liClass.innerText) === page) {
      liClass.classList.add('active')
    } else {
      liClass.classList.remove('active')
    }
  }
  renderUserList(getUserByPage(page))
})

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

function getUserByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}



