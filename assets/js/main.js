// let the user see the last cocktail he saw
let currentCocktail = localStorage.getItem("currentCocktail");
// get a random cocktail when loading page
let randomUrl = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const NUM_COCKTAIL_PER_CAROUSEL = 10;
// create 2 localStorage data for ingredients
let localIngredientsList = localStorage.getItem("ingredientsList");
let localIngredientsListOptions = localStorage.getItem(
  "ingredientsListOptions"
);

function writeCocktails(cocktails) {
  Object.entries(cocktails).length === 1
    ? writeCocktail(cocktails[0])
    : writeCocktailsList(cocktails);
  //  cocktails.forEach((el) => writeCocktail(el));
}
function writeCocktailsList(cocktails) {
  const paginationContainer = document.querySelector(".pagination");

  let numOfCocktailsLinks = Math.floor(
    Object.entries(cocktails).length / NUM_COCKTAIL_PER_CAROUSEL
  );

  if (numOfCocktailsLinks > 0) {
    for (let i = 0; i < numOfCocktailsLinks; i++) {
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
}

function writeCocktail(cocktail) {
  let cocktailImage = document.querySelector(".cocktail-image");
  let cocktailName = document.querySelector(".cocktail-name > p");
  let cocktailDescription = document.querySelector(".cocktail-description > p");
  let cocktailIngredients = document.querySelector(".cocktail-ingredients");
  let cocktailTags = document.querySelector(".cocktail-tags");
  let cocktailIngredientsList = document.getElementById("ingredientDataList");
  // change image
  cocktailImage.innerHTML = `<img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" />`;
  cocktailName.textContent = `${cocktail.strDrink}`;
  cocktailDescription.textContent = `${cocktail.strInstructions}`;
  getCocktailIngredients(cocktail).map((x) => {
    // Created the button, give its classes and innerHTML
    const aLink = document.createElement("a");
    aLink.className = "";
    aLink.innerHTML = x;
    aLink.href = "#";

    // Add the event listener
    aLink.addEventListener("click", (el) => {
      el.preventDefault;
      fetchUrlData(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${x}`
      );
    });

    // Append the button to the created card
    cocktailIngredients.appendChild(aLink);
  });

  cocktailTags.textContent = cocktail.strTags || "";
  //  cocktailIngredientsList.innerHTML = localIngredientsListOptions || "";

  /* default behavior */
  let ingredientListLinks = document.querySelectorAll("a.ingredientList");
}

function getCocktailIngredients(cocktail) {
  let ingredients = [];
  for (const [key, value] of Object.entries(cocktail)) {
    if (key.includes("strIngredient") && value) ingredients.push(value);
    // if value is not in our global list of ingredients
    if (
      localIngredientsList &&
      false === localIngredientsList.includes(value)
    ) {
      localIngredientsList.push(value);
      // add new option so we just have to load it from localStorage instead a recreate it each time
      localIngredientsListOptions.push(
        `<option value="${value}">${value}</option>`
      );
    }
  }

  return ingredients;
}

function fetchUrlData(
  url = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita"
) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      writeCocktails(data.drinks);
    })
    .catch((error) => {
      console.log(error);
    });
}

fetchUrlData(randomUrl);
