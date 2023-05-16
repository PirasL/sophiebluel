let gallery = document.querySelector(".gallery");
let loginSwitch = document.querySelector("#logSwitch");
let data = [];
let newData = [];

// Is the user logged in ??
if (window.localStorage.getItem("access_token")) {
  document.querySelector(".edit-banner").style.display = "flex";
  loginSwitch.innerHTML = `<a>logout</a>`;
  loginSwitch.onclick = () => {
    window.localStorage.removeItem("access_token");
    window.location.reload();
  };
}

// FETCH DATA

Promise.all([
  fetch("http://localhost:5678/api/works").then((res) => res.json()),
  fetch("http://localhost:5678/api/categories").then((res) => res.json()),
]).then((res) => {
  data = res[0];
  buildFilter(res[1]);
  buildGallery(res[0]);
  buildModalGallery(res[0]);
});

//BUILD GALLERY
function buildGallery(responseData) {
  console.log(responseData);
  if (gallery.firstChild) {
    removeItem();
  }
  responseData.forEach((item) => {
    // Create figure
    let figure = document.createElement("figure");
    figure.id = "img-id" + item.id;

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
function buildFilter(categories) {
  categories.forEach((el) => {
    let categoryFilterItem = document.createElement("div");
    categoryFilterItem.innerText = el.name;
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
        buildGallery(data);
      } else {
        let filteredData = data.filter(
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
  modalContainer.innerHTML = `<div>
  <div class="close-modal">
                <i class="fa-solid fa-xmark fa-2x" onclick="closeModal()"></i>
              </div>
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
const modalGallery = document.querySelector(".modal-gallery");
function buildModalGallery(responseData) {
  responseData.forEach((el) => {
    // create container
    let modalGalleryItem = document.createElement("div");
    modalGalleryItem.className = "modal-gallery-item";
    modalGalleryItem.id = "img-id" + el.id;
    // create img
    let modalImg = document.createElement("img");
    modalImg.src = el.imageUrl;
    modalImg.crossOrigin = "anonymous";
    modalImg.className = "modal-img";

    // create deleteButton
    let trashIconContainer = document.createElement("div");
    trashIconContainer.dataset.id = el.id;
    trashIconContainer.className = "modal-img-delete";
    trashIconContainer.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    trashIconContainer.addEventListener("click", (e) => {
      deleteItemFromDb(e.target.dataset.id);
    });

    // edit button
    let editButton = document.createElement("span");
    editButton.innerText = "éditer";
    // append
    let modalGallery = document.querySelector(".modal-gallery");
    modalGallery.append(modalGalleryItem);
    modalGalleryItem.append(modalImg);
    modalGalleryItem.append(trashIconContainer);
    modalGalleryItem.append(editButton);
  });
}
let modalContainer = document.querySelector(".modal-container");

function deleteItemFromDb(id) {
  fetch("http://localhost:5678/api/works/" + id, {
    method: "delete",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    },
  }).then(() => {
    const imgToDelete = document.querySelectorAll("#img-id" + id);
    imgToDelete.forEach((el) => {
      el.remove();
    });
    data = data.filter((obj) => obj.id !== parseInt(id));
  });
}

function addItemToDb() {
  let form = `
    <form class="modal-form">
      <div class="modal-nav-icon">
        <i class="fa-solid fa-arrow-left fa-2x" id="navArrow"></i>
        <i class="fa-solid fa-xmark fa-2x" id='close-button'></i>
      </div>
      <p class="modal-form-title">Ajout photo</p>
      <div class="modal-add-pic">
        <img id='img-preview' src="./assets/images/image.svg" class="modal-svg" alt="" />
        <label class="input-file-label" for="file">+ Ajouter photo</label>
        <input type="file" id="file" class="input-file" name="file" accept="image/png, image/jpg" >
        <p>jpg, png : 4mo max</p>
      </div>
      <div class="modal-form-input-container">
        <label for="title" class="modal-form-input-label">Titre</label>
        <input name="title" name="title" id='titleInput' class="modal-form-input" type="text" />
        <label for="category" class="modal-form-input-label">Catégorie</label>
        <select name="category" id='categoryInput' class="modal-form-input"></select>
      </div>
      <hr />
      <button class="modal-form-submit" disabled>Valider</button>
    </form>`;

  modalContainer.innerHTML = form;

  let submitImageBtn = document.querySelector(".modal-form-submit");
  let imageInput = document.querySelector(".input-file");
  let imageTitle = document.querySelector("#titleInput");
  let imageCategoryInput = document.querySelector("#categoryInput");
  let imagePreviewContainer = document.querySelector(".modal-add-pic");

  fetch("http://localhost:5678/api/categories")
    .then((res) => res.json())
    .then((categories) => {
      categories.forEach((item) => {
        let inputOption = document.createElement("option");
        inputOption.value = item.id;
        inputOption.innerText = item.name;
        imageCategoryInput.append(inputOption);
      });
    });

  imageInput.onchange = () => {
    const [file] = imageInput.files;
    if (file) {
      imagePreviewContainer.innerHTML = `<img class="img-preview" src="${URL.createObjectURL(
        file
      )}"></img>`;
    }
    checkFiles();
  };

  imageTitle.onchange = () => checkFiles();
  imageCategoryInput.onchange = () => checkFiles();

  function checkFiles() {
    if (imageInput.files[0] && imageTitle.value && imageCategoryInput.value) {
      submitImageBtn.setAttribute("style", "background: green");
      submitImageBtn.disabled = false;
    }
  }

  submitImageBtn.onclick = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("image", imageInput.files[0]);
    fd.append("title", imageTitle.value);
    fd.append("category", imageCategoryInput.value);

    const request = await fetch("http://localhost:5678/api/works", {
      method: "post",
      body: fd,
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    });
    const res = await request.json();
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
    data.push({
      category: {
        id: res.categoryId,
        name: imageCategoryInput[res.categoryId - 1].innerText,
      },
      categoryId: res.categoryId,
      id: res.id,
      imageUrl: res.imageUrl,
      title: res.title,
      userId: res.userId,
    });
    buildModalGallery(data);
    if (
      document.querySelector(".filter-active").innerText ===
      imageCategoryInput[res.categoryId - 1].innerText
    ) {
      let figure = document.createElement("figure");
      figure.id = "img-id" + res.id;

      // create image
      let itemImg = document.createElement("img");
      itemImg.crossOrigin = "anonymous";
      itemImg.src = res.imageUrl;

      // create figcaption
      let itemFigcaption = document.createElement("figcaption");
      itemFigcaption.innerText = res.title;

      // append figure + text and img
      gallery.appendChild(figure);
      figure.appendChild(itemImg);
      figure.appendChild(itemFigcaption);
    }
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
    buildGallery(data);
  };

  let xmark = document.querySelector(".fa-xmark");
  xmark.onclick = () => closeModal();
}
