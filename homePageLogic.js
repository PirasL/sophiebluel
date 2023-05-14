let gallery = document.querySelector(".gallery");
let isLoggedIn = false;
let loginSwitch = document.querySelector("#logSwitch");
let data = [];
// Is the user logged in ??
if (document.cookie) {
  isLoggedIn = true;
  document.querySelector("header").classList.add("margin-top");
  document.querySelector(".edit-banner").classList.add("opacity");
  loginSwitch.innerHTML = `<a>logout</a>`;
  loginSwitch.onclick = () => {
    console.log(document.cookie);
    document.cookie = "access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.reload();
  };
}

// FETCH DATA
fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((responseData) => {
    const uniqueCategories = [
      ...new Set(responseData.map(({ category }) => category.name)),
    ];
    console.log(responseData);
    console.log(responseData.map(({ category }) => category.name));
    buildFilter(uniqueCategories, responseData);
    buildGallery(responseData);
    buildModalGallery(responseData);
    data = responseData;
  })
  .catch((error) => console.warn(error));

//BUILD GALLERY
function buildGallery(responseData) {
  responseData.forEach((item) => {
    // Create figure
    let figure = document.createElement("figure");

    // create image
    let itemImg = document.createElement("img");
    itemImg.crossOrigin = "anonymous";
    itemImg.src = item.imageUrl;

    // create figcaption
    let itemFigcaption = document.createElement("figcaption");
    itemFigcaption.innerText = item.title;

    // append figure + text and img
    gallery.appendChild(figure);
    figure.appendChild(itemImg);
    figure.appendChild(itemFigcaption);
  });
}

// BUILD FILTER
const filterContainer = document.querySelector(".filter-container");
function buildFilter(categories, responseData) {
  categories.forEach((el) => {
    let categoryFilterItem = document.createElement("div");
    categoryFilterItem.innerText = el;
    categoryFilterItem.className = "filter-item";
    filterContainer.appendChild(categoryFilterItem);
  });

  // SELECT BUTTON AND APPLY FILTER LOGIC
  let itemFilter = document.querySelectorAll(".filter-item");
  itemFilter.forEach((item) => {
    item.addEventListener("click", (e) => {
      itemFilter.forEach((el) => el.classList.remove("filter-active"));
      e.target.classList.add("filter-active");
      const target = e.target.innerText;
      if (target === "Tous") {
        removeItem();
        buildGallery(responseData);
      } else {
        let filteredData = responseData.filter(
          ({ category }) => category.name === target
        );
        removeItem();
        buildGallery(filteredData);
      }
    });
  });
}
// REMOVE EVERY ITEMS
function removeItem() {
  let gallery = document.querySelector(".gallery");
  gallery.querySelectorAll("figure").forEach((item) => {
    item.remove();
  });
}

// TOGGLE MODAL LOGIC
const modal = document.querySelector("#modal");
function showModal() {
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

const editMode = document.querySelector("#display-modal");
editMode.addEventListener("click", () => {
  showModal();
});

const b = document.querySelector(".modal").addEventListener("click", (e) => {
  if (e.target.className === "modal") {
    closeModal(e);
  } else {
    return;
  }
});

// DISPLAY GALLERY INSIDE MODAL

function buildModalGallery(responseData) {
  let modalGallery = document.querySelector(".modal-gallery");
  responseData.forEach((el) => {
    // create container

    let modalGalleryItem = document.createElement("div");
    modalGalleryItem.className = "modal-gallery-item";

    // create img
    let modalImg = document.createElement("img");
    modalImg.src = el.imageUrl;
    modalImg.crossOrigin = "anonymous";
    modalImg.className = "modal-img";

    // create deleteButton
    let trashIconContainer = document.createElement("div");
    trashIconContainer.id = el.id;
    trashIconContainer.className = "modal-img-delete";
    trashIconContainer.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    trashIconContainer.addEventListener("click", (e) => {
      deleteItemFromDb(e.target.parentNode.id);
    });

    // append

    modalGallery.append(modalGalleryItem);
    modalGalleryItem.append(modalImg);
    modalGalleryItem.append(trashIconContainer);
  });
}

function deleteItemFromDb(id) {
  fetch("http://localhost:5678/api/works/" + id, {
    method: "delete",
    headers: {
      Authorization: "Bearer " + document.cookie.split("=")[1],
    },
  })
    .then((res) => console.log(res.status))
    .catch((error) => console.log(error));
}

let modalContainer = document.querySelector(".modal-container");

function addItemToDb() {
  let form = `
    <form class="modal-form">
      <div class="modal-nav-icon">
        <i class="fa-solid fa-arrow-left fa-2x" id="navArrow"></i>
        <i class="fa-solid fa-xmark fa-2x"></i>
      </div>
      <p class="modal-form-title">Ajout photo</p>
      <div class="modal-add-pic">
        <img id='img-preview' src="./assets/images/image.svg" class="modal-svg" alt="" />
        <label class="input-file-label" for="file">+ Ajouter photo</label>
        <input type="file" id="file" class="input-file" accept="image/png, image/jpg" >
        <p>jpg, png : 4mo max</p>
      </div>
      <div class="modal-form-input-container">
        <label for="title" class="modal-form-input-label">Titre</label>
        <input name="title" id='titleInput' class="modal-form-input" type="text" />
        <label for="category" class="modal-form-input-label">Catégorie</label>
        <select name="category" id='categoryInput' class="modal-form-input"></select>
      </div>
      <hr />
      <button class="modal-form-submit">Valider</button>
    </form>`;

  modalContainer.innerHTML = form;
  let submitImageBtn = document.querySelector(".modal-form-submit");
  let imageInput = document.querySelector(".input-file");
  let imageTitle = document.querySelector("#titleInput");
  let imageCategoryInput = document.querySelector("#categoryInput");
  let imagePreviewContainer = document.querySelector(".modal-add-pic");

  // Build options Input category

  let categories = [...new Set(data.map(({ category }) => category))];
  console.log(categories);
  const map = {};
  for (const element of categories) {
    map[element.id] = element;
  }
  const uniqueCategories = Object.values(map);

  uniqueCategories.forEach((item, index) => {
    let inputOption = document.createElement("option");
    inputOption.value = item.id;
    inputOption.innerText = item.name;
    imageCategoryInput.append(inputOption);
  });

  imageInput.onchange = () => {
    const [file] = imageInput.files;

    if (file) {
      console.log(file);
      imagePreviewContainer.innerHTML = `<img class="img-preview" src="${URL.createObjectURL(
        file
      )}"></img>`;
    }

    // SEND IMAGE TO DB
    submitImageBtn.setAttribute("style", "background: green");

    submitImageBtn.onclick = (e) => {
      console.log(imageTitle);
      const fd = new FormData();
      fd.append("image", imageInput.files[0]);
      fd.append("title", imageTitle.value);
      fd.append("category", imageCategoryInput.value);
      e.preventDefault();
      fetch("http://localhost:5678/api/works", {
        method: "post",
        body: fd,
        headers: {
          Authorization: "Bearer " + document.cookie.split("=")[1],
        },
      })
        .then((res) => console.log(res.status))
        .catch((error) => console.log(error));
    };
  };

  let naviguateBack = document.querySelector("#navArrow");
  naviguateBack.onclick = () => {
    modalContainer.innerHTML = `  <div>
              <p class="modal-gallery-title">Galerie photo</p>
              <div class="modal-gallery"></div>
            </div>
            <div class="modal-btn-container">
              <hr />
              <button class="modal-button" onclick="addItemToDb()">
                Ajouter une photo
              </button>
              <a class="modal-delete">Supprimer la galerie</a>
            </div>`;
    buildModalGallery(data);
  };
}
