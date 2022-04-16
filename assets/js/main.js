// let the user see the last cocktail he saw
let currentCocktail = localStorage.getItem("currentCocktail");
let currentIngredient = localStorage.getItem("currentIngredient");
// get a random cocktail when loading page
let randomUrl = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const NUM_COCKTAIL_PER_CAROUSEL = 10;
// create 2 localStorage data for ingredients
let localIngredientsList = localStorage.getItem("ingredientsList");
let localIngredientsListOptions = localStorage.getItem(
  "ingredientsListOptions"
);
let numOfCocktailsLinks = 0;
let numTotalCocktails = 0;
function writeCocktails(cocktails) {
  console.log("len 15 : " + Object.entries(cocktails).length);
  Object.entries(cocktails).length === 1
    ? writeCocktail(cocktails[0])
    : writeCocktailsList(cocktails);
  //  cocktails.forEach((el) => writeCocktail(el));
}
function writeCocktailsList(cocktails) {
  const paginationContainer = document.querySelector(".pagination");
  let len = Object.entries(cocktails).length;
  numTotalCocktails = len;
  numOfCocktailsLinks = Math.floor(len / NUM_COCKTAIL_PER_CAROUSEL);

  console.log("nombre de cocktails " + len);
  len = len > 10 ? 10 : len;

  // save this request in storage..

  //  localStorage.setItem("cocktailsWithIngredient", cocktails);
  // 0 0 : first eleemnt, first page
  // localStorage.setItem("currentIn_CocktailsWithIngredient", "0,0");

  let arrowLeft = document.querySelector("a.left");
  let arrowRight = document.querySelector("a.right");

  arrowLeft.dataset["id"] = len;
  arrowRight.dataset["id"] = 1;

  if (numOfCocktailsLinks > 0) {
    // clear this before append new child
    paginationContainer.textContent = "";
    for (let i = 1; i < numOfCocktailsLinks + 1; i++) {
      const aLi = document.createElement("li");
      const aLink = document.createElement("a");
      aLink.textContent = i;
      aLink.href = "#";
      aLink.className = "page";
      aLink.dataset.title = i;
      aLi.appendChild(aLink);
      paginationContainer.appendChild(aLi);
    }
  }

  let random = Math.floor(numOfCocktailsLinks * Math.random());
  console.log("random : " + random);
  writeCocktail(cocktails[random]);
}

/**
 *
 * @param {Cocktail object} cocktail
 */
function writeCocktail(cocktail) {
  console.log("in cocktail =>");

  console.log(cocktail);
  console.log("<= end in cocktail");
  let cocktailImage = document.querySelector(".cocktail-image");
  let cocktailName = document.querySelector(".cocktail-name > p");
  let cocktailDescription = document.querySelector(
    ".cocktail-description > p.description"
  );
  let cocktailIngredients = document.querySelector(".cocktail-ingredients");
  let cocktailTags = document.querySelector(".cocktail-tags");
  let cocktailIngredientsList = document.getElementById("ingredientDataList");
  // change image
  cocktailImage.innerHTML = `<img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" />`;
  cocktailName.textContent = `${cocktail.strDrink}`;

  // remove child if element has some
  while (cocktailIngredients.hasChildNodes())
    cocktailIngredients.removeChild(cocktailIngredients.firstChild);

  if (cocktail.strInstructions === undefined && numTotalCocktails > 0) {
    cocktailDescription.textContent = `${
      cocktail.strInstructions ??
      "You have " +
        numTotalCocktails +
        " cocktails with " +
        localStorage.getItem("currentIngredient") +
        "\n"
    }`;
    let cocktailFilter = document.querySelector(
      ".cocktail-description > p.filter"
    );

    cocktailFilter.textContent = "";

    let aLink = document.createElement("a");
    aLink.id = "filterIngredient";
    aLink.href = "";
    aLink.title = `See all cocktails with ${localStorage.getItem(
      "currentIngredient"
    )}`;
    aLink.dataset.id = localStorage.getItem("currentIngredient");
    aLink.textContent = `Click to see all the cocktails with ${localStorage.getItem(
      "currentIngredient"
    )}`;

    // Add the event listener
    aLink.addEventListener("click", (el) => {
      el.preventDefault();
      fetchUrlData(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${localStorage.getItem(
          "currentIngredient"
        )}`,
        "filter-ingredient"
      );
    });

    cocktailFilter.appendChild(aLink);
  } else {
    cocktailDescription.textContent = cocktail.strInstructions;
  }
  getCocktailIngredients(cocktail).map((x) => {
    console.log("cocktail ingredient here = " + x);
    const aLink = document.createElement("a");
    aLink.className = "";
    aLink.innerHTML = x;
    aLink.href = "#";

    // Add the event listener
    aLink.addEventListener("click", (el) => {
      el.preventDefault();
      fetchUrlData(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${x}`,
        "ingredient"
      );
      localStorage.setItem("currentIngredient", x);
    });

    // Append the button to the created card
    //   cocktailIngredients.textContent = "";
    cocktailIngredients.appendChild(aLink);
  });

  cocktailTags.textContent = cocktail.strTags || "";
  //  cocktailIngredientsList.innerHTML = localIngredientsListOptions || "";

  /* default behavior */
  let ingredientListLinks = document.querySelectorAll("a.ingredientList");
}

/**
 *
 * @param {Object cocktail} cocktail a cocktail object to parse, create ingredient datalist in localstorage
 * @returns array : list of ingredients in a cocktails
 */
function getCocktailIngredients(cocktail) {
  let ingredients = [];

  for (const [key, value] of Object.entries(cocktail)) {
    console.log(key, value);
    if (key.includes("strIngredient") && value) {
      ingredients.push(value);
      // if no ingredient yet in localstorage
      if (
        localIngredientsList === null ||
        false === localIngredientsList.includes(`"[${value}]`)
      ) {
        localIngredientsList =
          localIngredientsList === null
            ? ""
            : localStorage.getItem("ingredientsList");
        // don't forget localStorage accept only string
        localStorage.setItem(
          "ingredientsList",
          localIngredientsList + ` [${value}] `
        );

        localIngredientsListOptions =
          localIngredientsListOptions === null
            ? ""
            : localStorage.getItem("localIngredientsListOptions");
        // don't forget localStorage accept only string
        localStorage.setItem(
          "ingredientsListOptions",
          localIngredientsListOptions +
            `<option vazlue="${value}">${value}</option>`
        );
      }
    }
  }

  return ingredients;
}

/**
 *
 * @param {string} url url to fetch data form. If empty, will search for margarita cocktails
 */
function fetchUrlData(
  url = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita",
  type = "cocktail"
) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.drinks !== undefined && data.drinks !== null) {
        if (type === "cocktail") {
          console.log(data.drinks);
          writeCocktails(data.drinks);
        } else if (type === "ingredient") {
          writeCocktails(data.drinks);
        } else if (type === "filter-ingredient") {
          writeCocktailsWithIngredientFilter(data.drinks);
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

// get a random data only when page is loaded and not each time application link is activated
if (localStorage.getItem("currentCocktail") !== "") {
  console.log("205");
  fetchUrlData(randomUrl, "cocktail");
}

function writeCocktailsWithIngredientFilter(cocktails) {
  let htmlApp = document.querySelector(".application");
  let progressBar = document.querySelector("progress");
  let _ul = document.createElement("ul");
  progressBar.hidden = false;
  progressBar.max = Object.entries(cocktails).length;
  let carouselStart = "";
  let iterator = 0;
  let _div = document.createElement("div");
  for (const [key, value] of Object.entries(cocktails)) {
    if (iterator === 0) {
      let _p = document.createElement("p");
      let _span1 = document.createElement("span");
      let _span2 = document.createElement("span");

      let _a = document.createElement("a");
      let _img = document.createElement("img");

      _div.id = "carousel";
      _p.className = "cocktail-name";
      _span1.textContent = value.strDrink;
      _a.className = "details";
      _a.href = "";
      _a.title = "See details";
      _a.dataset.text = value.strDrink;
      _a.textContent = "See details";
      _img.src = value.strDrinkThumb;
      _img.id = "carouselImage";
      _img.al = value.strDrink;

      _p.appendChild(_span1);
      _span2.appendChild(_a);
      _p.appendChild(_span2);
      _div.appendChild(_p);
      _div.appendChild(_img);
    }
    progressBar.value++;
    let _li = document.createElement("li");
    let _a = document.createElement("a");
    let _img = document.createElement("img");

    _li.className = "items";
    _li.dataset.id = ++iterator;
    _a.href = "#";
    _a.dataset.id = value.idDrink;
    _a.className = "filter";
    _a.title = value.strDrink;
    _a.dataset.text = value.strDrink;

    _img.src = value.strDrinkThumb;
    _img.alt = value.strDrink;

    _a.appendChild(_img);
    _li.appendChild(_a);
    _ul.appendChild(_li);
  }

  htmlApp.innerHTML = `${_div.outerHTML}<ul class="cocktail-selection">${_ul.innerHTML}</ul>`;

  progressBar.ariaHidden = true;
  progressBar.hidden = true;

  Array.from(document.querySelectorAll("a.filter")).forEach((el) =>
    el.addEventListener(
      "click",
      () => {
        console.log(el.firstChild);
        document.getElementById("carouselImage").src = el.firstChild.src;
        document.querySelector(".cocktail-name").textContent = el.title;
        /*
        fetchUrlData(
          `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${el.dataset.text}`,
          "cocktail"
        );
        */
        //        restoreAppHtml();
      },
      true
    )
  );
}

function getLocalCocktailWithIngredient(cocktail_id) {
  /* to change to database later, won't work with localStorage here
  writeCocktail(
    Object.entries(localStorage.getItem("cocktailsWithIngredient"))[cocktail_id]
  );
  */
  console.log("with id 1 :" + cocktail_id);
  fetchUrlData(randomUrl, "cocktail");
  console.log("with id 2 :" + cocktail_id);
}

function restoreAppHtml() {
  const app = document.querySelector(".application");
  app.innerHTML = `
          <section class="cocktail-image">
          <img
            class="cocktailImage"
            src="assets/images/finn-hackshaw-FQgI8AD-BSg-unsplash-200.png"
            alt="cocktail name"
          />
        </section>
        <section class="cocktail-name">
          <p></p>
        </section>
        <section class="cocktail-description">
          <p class="description"></p>
          <p class="filter"></p>
        </section>
        <section class="cocktail-ingredients"></section>
        <section class="cocktail-tags"></section>
`;
}

document.getElementById("submit").addEventListener("click", (el) => {
  el.preventDefault();
  let cocktail = document.getElementById("nameSearch").value;
  if (cocktail !== null && cocktail !== undefined) {
    fetchUrlData(
      "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + cocktail,
      "cocktail"
    );
  }
});

/* add event listener here */
let arrowLeft = document.querySelector("a.left");
let arrowRight = document.querySelector("a.right");

[arrowLeft, arrowRight].forEach((el) => {
  el.addEventListener("click", (elem) => {
    elem.preventDefault;
    console.log("click for ");
    // get cocktail from storage based on it's key
    getLocalCocktailWithIngredient(elem.target.dataset.id);
  });
});

/* add event listener here */
let randomize = document.getElementById("randomize");

randomize.addEventListener("click", (elem) => {
  elem.preventDefault;
  // initisalize base template first
  restoreAppHtml();
  // get cocktail from storage based on it's key
  getLocalCocktailWithIngredient(elem.target.dataset.id);
});
