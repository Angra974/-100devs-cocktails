// let the user see the last cocktail he saw
let currentCocktail = localStorage.getItem("currentCocktail");
let currentIngredient = localStorage.getItem("currentIngredient");
// get a random cocktail when loading page

const NUM_COCKTAIL_PER_CAROUSEL = 10;
const BASE_API_URL = "https://www.thecocktaildb.com/api/json/v1/1";
const randomUrl = `${BASE_API_URL}/random.php`;
// create 2 localStorage data for ingredients
let localIngredientsList = localStorage.getItem("ingredientsList");
let localIngredientsListOptions = localStorage.getItem(
  "ingredientsListOptions"
);
let numOfCocktailsLinks = 0;
let numTotalCocktails = 0;

/* add event listener here */
const arrowLeft = document.querySelector("a.left");
const arrowRight = document.querySelector("a.right");

/**
 * Write a cocktail details or a list of cocktails depending of how much dans is sent
 * @param {Object coktail} cocktails
 * @return void
 */
function writeCocktails(cocktails) {
  // Don't show filter everywhere, except on filter page after a search
  localStorage.setItem("currentFilteredSearch", "");

  // clear this value too
  document.querySelector(".filter_results").textContent = "";

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
  len = len > 10 ? 10 : len;

  // save this request in storage..

  //  localStorage.setItem("cocktailsWithIngredient", cocktails);
  // 0 0 : first eleemnt, first page
  // localStorage.setItem("currentIn_CocktailsWithIngredient", "0,0");
  arrowLeft.dataset["id"] = len; // last element in the array
  arrowRight.dataset["id"] = 2; // next image after the first is the second

  let random = Math.floor(numOfCocktailsLinks * Math.random());
  writeCocktail(cocktails[random]);
}

/**
 *
 * @param {Cocktail object} cocktail
 */
function writeCocktail(cocktail) {
  const cocktailImage = document.querySelector(".cocktail-image");
  const cocktailName = document.querySelector(".cocktail-name > p");
  const cocktailDescription = document.querySelector(
    ".cocktail-description > p.description"
  );
  const alcohol = document.querySelector(".alcohol-filter");

  const cocktailIngredients = document.querySelector(".cocktail-ingredients");
  let cocktailTags = document.querySelector(".cocktail-tags");
  let cocktailIngredientsList = document.getElementById("ingredientDataList");
  // change image
  cocktailImage.innerHTML = `<img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" />`;
  cocktailName.textContent = `${cocktail.strDrink}`;

  // set with alcohol or not
  alcohol.textContent = cocktail.strAlcoholic;

  clearHtmlElement(cocktailIngredients);

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
    aLink.className = "blinky";
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
        `${BASE_API_URL}/filter.php?i=${localStorage.getItem(
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
    const aLink = document.createElement("a");
    aLink.className = "";
    aLink.innerHTML = x;
    aLink.href = "#";

    // Add the event listener
    aLink.addEventListener("click", (el) => {
      el.preventDefault();
      fetchUrlData(`${BASE_API_URL}/filter.php?i=${x}`, "ingredient");
      localStorage.setItem("currentIngredient", x);
    });

    // Append the button to the created card
    //   cocktailIngredients.textContent = "";
    cocktailIngredients.appendChild(aLink);
  });

  // deal with tags
  // TODO : add a tags list/page so user can see all tags
  // ? datalist can be put on main page
  // ? Think of update on advanced search
  clearHtmlElement(cocktailTags);
  if (cocktail.strTags)
    cocktail.strTags.split(",").forEach((elem) => {
      let _a = document.createElement("a");
      _a.className = "tag";
      _a.dataset.text = elem;
      _a.href = "#";
      _a.title = "";
      _a.textContent = "#" + elem;
      cocktailTags.appendChild(_a);
    });

  // add event handler to all .tags links
  Array.from(document.querySelectorAll(".tags")).forEach((el) => {
    el.preventDefault();

    // TODO : Add a databse engine and create a tag databse for making search available by tags
    // * Allow research by multiple tags possible
    /*
    el.addEventListener("click", (el) => {
      el.preventDefault();

      if (el.target.dataset.text !== "") {
        restoreAppHtml();
        // Add the event listener
        let url = `${BASE_API_URL}/search.php?s=${el.target.dataset.text}`;
        fetchUrlData(url, "cocktail");
      }
    });
    */
  });

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
  url = `${BASE_API_URL}/search.php?s=margarita`,
  type = "cocktail"
) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.drinks !== undefined && data.drinks !== null) {
        if (type === "cocktail" || type === "ingredient") {
          [arrowLeft, arrowRight].forEach((el) => (el.style.opacity = "0"));
          writeCocktails(data.drinks);
        } else if (type === "filter-ingredient") {
          writeCocktailsWithIngredientFilter(data.drinks);
          [arrowLeft, arrowRight].forEach((el) => (el.style.opacity = "1"));
        } else if (type === "filter-list") {
          writeFilters(data.drinks);
        }
      }
    })
    .catch((error) => {
      // if a search is present, error will be certainly here
      if (localStorage.getItem("currentFilteredSearch")) {
        document.querySelector(".filter_results").textContent =
          "No results for this search";
        // clear it, so this error will not be associate with this value
        localStorage.setItem("currentFilteredSearch", "");
      }
    });
}

// get a random data only when page is loaded and not each time application link is activated
if (localStorage.getItem("currentCocktail") !== "") {
  fetchUrlData(randomUrl, "cocktail");
}

function writeFilters(data) {
  if (Object.entries(data).length > 0) {
    let app = document.querySelector(".application");
    clearHtmlElement(app);
    let _ul = document.createElement("ul");
    let dataList = Object.keys(data[0]);
    for (const [key, value] of Object.entries(data)) {
      let _li = document.createElement("li");
      let _a = document.createElement("a");
      let _span1 = document.createElement("span");
      _a.className = "list";
      _a.href = "#";
      _a.dataset.list = dataList;
      _a.innerHTML = value[dataList].replace(
        /^./,
        (c) => `<span class="upper">${c}</span>`
      );
      _li.append(_a);
      _ul.append(_li);
    }
    app.innerHTML += `<ul>${_ul.innerHTML}</ul>`;

    Array.from(document.querySelectorAll("a.list")).forEach((el) => {
      let matches = {
        strGlass: `g`,
        strCategory: `c`,
        strIngredient1: `i`,
        strAlcoholic: `a`,
      };
      el.addEventListener("click", () => {
        fetchUrlData(
          `${BASE_API_URL}/filter.php?${matches[el.dataset.list]}=${
            el.textContent
          }`,
          "filter-ingredient"
        );

        localStorage.setItem(
          "currentFilteredSearch",
          `Filter : ${
            el.textContent.charAt(0).toUpperCase() + el.textContent.slice(1) ??
            ""
          }`
        );
      });
    });
  }
}

function writeCocktailsWithIngredientFilter(cocktails) {
  let htmlApp = document.querySelector(".application");

  // TODO : put it later, was taken off from html for the moment
  // ! Html is not present in the index.html file
  // ? is it necessary, event seems to go too quickly to be really noticed with a progressbar
  /* let progressBar = document.querySelector("progress");
   progressBar.hidden = false;
  progressBar.max = Object.entries(cocktails).length;
  */
  let _ul = document.createElement("ul");
  let iterator = 0;
  let _div = document.createElement("div");

  // set first element of the carousel in localStorage
  localStorage.setItem(
    "carouselMaxItemValue",
    Object.entries(cocktails).length
  );

  for (const [key, value] of Object.entries(cocktails)) {
    //  progressBar.value++;
    let _li = document.createElement("li");

    if (iterator === 0) {
      _li.className = "items active";

      // set first element of the carousel in localStorage
      localStorage.setItem("carouselCurrentElement", 1);

      let _p = document.createElement("p");
      let _span1 = document.createElement("span");

      let _a = document.createElement("a");
      let _img = document.createElement("img");

      _div.id = "carousel";
      _p.className = "cocktail-name";
      _span1.textContent = value.strDrink;
      _span1.className = "cname";
      _a.className = "details";
      _a.href = "";
      _a.title = "See details";
      _a.dataset.text = value.strDrink;
      _a.textContent = "See details";
      _img.src = value.strDrinkThumb;
      _img.id = "carouselImage";
      _img.al = value.strDrink;

      _p.appendChild(_span1);
      _p.appendChild(_a);
      _div.appendChild(_p);
      _div.appendChild(_img);
    } else {
      _li.className = "items";
    }
    let _aLink = document.createElement("a");
    let _img = document.createElement("img");

    _li.dataset.id = ++iterator;
    _aLink.href = "#";
    _aLink.dataset.id = value.idDrink;
    _aLink.className = "filter";
    _aLink.title = value.strDrink;
    _aLink.dataset.text = value.strDrink;

    _img.src = value.strDrinkThumb;
    _img.alt = value.strDrink;
    _img.dataset.id = iterator;

    _aLink.appendChild(_img);
    _li.appendChild(_aLink);
    _ul.appendChild(_li);
  }

  htmlApp.innerHTML = `${_div.outerHTML}<ul class="cocktail-selection">${_ul.innerHTML}</ul>`;

  //  progressBar.ariaHidden = true;
  //  progressBar.hidden = true;

  Array.from(document.querySelectorAll("a.filter")).forEach((el) =>
    el.addEventListener(
      "click",
      () => {
        document.getElementById("carouselImage").src = el.firstChild.src;
        document.querySelector(".cname").textContent = el.title;
        document.querySelector(".details").dataset.text = el.title;
      },
      true
    )
  );

  /**
   * Add click event on details link
   * for not generate the event each time filter view is requested
   * an empty dataset text value is used as default. No functionnality
   * is associate with default empty valye
   */
  document.querySelector(".details").addEventListener("click", (el) => {
    el.preventDefault();
    if (el.target.dataset.text !== "") {
      restoreAppHtml();
      // Add the event listener
      let url = `${BASE_API_URL}/search.php?s=${el.target.dataset.text}`;
      fetchUrlData(url, "cocktail");
    }
  });

  // show filtered results information if present and clear it just after
  document.querySelector(".filter_results").textContent = localStorage.getItem(
    "currentFilteredSearch"
  );
  localStorage.setItem("currentFilteredSearch", ``);
}

function getLocalCocktailWithIngredient(cocktail_id) {
  /* to change to database later, won't work with localStorage here
  writeCocktail(
    Object.entries(localStorage.getItem("cocktailsWithIngredient"))[cocktail_id]
  );
  */
  fetchUrlData(randomUrl, "cocktail");
}

function restoreAppHtml() {
  const app = document.querySelector(".application");
  app.innerHTML = `

                <section class="alcoholik">
              <span class="alcohol" data-text=""><a class="alcohol-filter" href="#" data-text="Filter by Alcohol" title="Clic to filter by Alchool">Welcome</a></span>
    <div class="cocktail-image">
          <img
            class="cocktailImage"
            src="assets/images/finn-hackshaw-FQgI8AD-BSg-unsplash-200.png"
            alt="cocktail name"
          />
        </div>
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

document.querySelector(".alcohol-filter").addEventListener("click", (el) => {
  el.preventDefault();
  if (el.target.textContent !== "") {
    let filter = el.target.textContent.includes(" ")
      ? "Non_Alcoholic"
      : "Alcoholic";
    fetchUrlData(`${BASE_API_URL}/filter.php?a=${filter}`, "filter-ingredient");
  }
});

document.getElementById("submit").addEventListener("click", (el) => {
  el.preventDefault();
  let cocktail = document.getElementById("nameSearch").value;
  let filtered = document.getElementById("filtered-list").value;

  // if filter is on ingredients and a search by name is done
  // we look for all drink with this ingredient
  // we perform a name search for the other case
  let toBeFetched =
    filtered === "Ingredients"
      ? `filter.php?i=${cocktail}`
      : `search.php?s=${cocktail}`;
  if (cocktail !== null && cocktail !== undefined) {
    fetchUrlData(`${BASE_API_URL}/${toBeFetched}`, "filter-ingredient");

    localStorage.setItem(
      "currentFilteredSearch",
      `${filtered.charAt(0).toLowerCase() + filtered.slice(1)} : ${
        cocktail.charAt(0).toLowerCase() + cocktail.slice(1)
      }`
    );
  }
});

document
  .getElementById("submitFilterSearch")
  .addEventListener("click", (el) => {
    el.preventDefault();
    let filtered = document.getElementById("filtered-list").value;
    let ingredientSearch = "";
    if (filtered === "Ingredients") {
      if (!document.getElementById("nameSearch").value) {
        alert("You need to add an ingredient name in the search fiels");
        return false;
      }
      ingredientSearch = document.getElementById("nameSearch").value;
    }

    if (filtered.includes("list")) {
      fetchUrlData(`${BASE_API_URL}/list.php?${filtered}`, "filter-list");
    } else {
      // if filter is on ingredients and a search by name is done
      // we look for all drink with this ingredient
      // we perform a name search for the other case
      let matches = {
        Ordinary_Drink: "c=Ordinary_Drink",
        Cocktail: "c=Cocktail",
        Cocktail_glass: "g=Cocktail_glass",
        Champagne_flute: "g=Champagne_flute",
        Ingredients: "i=" + ingredientSearch,
        Alcoholic: "a=Alcoholic",
        Non_Alcoholic: "a=Non_Alcoholic",
      };

      fetchUrlData(
        `${BASE_API_URL}/filter.php?${matches[filtered]}`,
        "filter-ingredient"
      );

      localStorage.setItem(
        "currentFilteredSearch",
        `Filter : ${filtered.charAt(0).toLowerCase() + filtered.slice(1)}  ${
          ingredientSearch ?? ""
        }`
      );
    }
  });

[arrowLeft, arrowRight].forEach((el) => {
  el.addEventListener("click", (elem) => {
    elem.preventDefault;
    // deal with next element
    let carouselCurrentElement = Number(
      localStorage.getItem("carouselCurrentElement")
    );
    let carouselMaxItemValue = Number(
      localStorage.getItem("carouselMaxItemValue")
    );
    //    let nextCarouselElement = Number(carouselCurrentElement) + 1;
    let nextCarouselElement = Number(el.dataset.id);
    let prevCarouselElement = 0;
    if (el.className === "right") {
      arrowLeft.dataset.id = carouselCurrentElement;
      // becareful to not go more than the max value, we restart at 0 instead
      el.dataset.id =
        nextCarouselElement >= carouselMaxItemValue
          ? 1
          : nextCarouselElement + 1;
    } else if (el.className === "left") {
      arrowRight.dataset.id = carouselCurrentElement;
      nextCarouselElement = el.dataset.id;
      // don't go down less to 1, go to the last instead
      el.dataset.id =
        el.dataset.id <= 1 ? carouselMaxItemValue : el.dataset.id - 1;
    }

    let _liTargetLink =
      document.querySelector(`li.items[data-id="${nextCarouselElement}"]`) ||
      document.querySelector(`li.items[data-id="${el.dataset.id}"]`);

    // remove active visibility to current cocktail
    document
      .querySelector(`li.items[data-id="${carouselCurrentElement}"]`)
      .classList.remove("active");

    let _aTargetLink = _liTargetLink.firstChild;

    document.querySelector(".cname").textContent = _aTargetLink.firstChild.alt;
    document.getElementById("carouselImage").src = _aTargetLink.firstChild.src;
    document.querySelector(".details").dataset.text =
      _aTargetLink.firstChild.alt;

    // add active element to this cocktail
    _liTargetLink.classList.add("active");

    localStorage.setItem("carouselCurrentElement", _liTargetLink.dataset.id);
    // get cocktail from storage based on it's key
    //    getLocalCocktailWithIngredient(elem.target.dataset.id);
  });
});

/* add event listener here */
let randomize = document.getElementById("randomize");

randomize.addEventListener("click", (elem) => {
  elem.preventDefault;
  // initialize base template first
  restoreAppHtml();
  // get cocktail from storage based on it's key
  getLocalCocktailWithIngredient(elem.target.dataset.id);
});

/**
 * helper function
 * clear an innerHtml content before update
 * @param {Html element} el
 */
function clearHtmlElement(el) {
  while (el.hasChildNodes()) el.removeChild(el.firstChild);
}
