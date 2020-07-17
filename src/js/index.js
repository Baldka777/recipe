require("@babel/polyfill");
import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from "./view/searchView";
import Recipe from "./model/recipe";
import List from "./model/List";
import like from "./model/Like";
import * as listView from "./view/listView";
import * as likesView from "./view/likesView";
import {
  renderRecipe,
  clearRecipe,
  highlightSelectedRecipe,
} from "./view/recipeView";
import Likes from "./model/Like";

/**
 * Web app төлөв
 * - Хайлтын query, үр дүн
 * - Тухайн үзүүлж байгаа жор
 * - Лайкласан жорууд
 * - Захиалж байгаа жорын найрлаганууд
 */

const state = {};

/**
 * Хайлтын контроллер = Model ==> Controller <== View
 */

const controlSearch = async () => {
  // 1) Вебээс хайлтын түлхүүр үгийг гаргаж авна.
  const query = searchView.getInput();

  if (query) {
    // 2) Шинээр хайлтын обьектийг үүсгэж өгнө.
    state.search = new Search(query);
    // 3) Хайлт хийхэд зориулж дэлгэцийг UI бэлтгэнэ.
    searchView.clearSearchQuery();
    searchView.clearSearchResult();
    renderLoader(elements.searchResultDiv);

    // 4) Хайлтыг гүйцэтгэнэ.
    await state.search.doSearch();
    // 5) хайлтын үр дүнг дэлгэцэнд үзүүлнэ.
    clearLoader();
    if (state.search.result === undefined) alert("Хайлтаар илэрцгүй...");
    else searchView.renderRecipes(state.search.result);
  }
};
elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.pageButtons.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const gotoPageNumber = parseInt(btn.dataset.goto, 10);
    searchView.clearSearchResult();
    searchView.renderRecipes(state.search.result, gotoPageNumber);
  }
});

/**
 * Жорын контроллер
 */

const controlRecipe = async () => {
  // 1) URL-аас ID-ийг салгаж авна.
  const id = window.location.hash.replace("#", "");

  // URl дээр id байгаа эсэхийг шалгана.
  if (id) {
    // 2) Жорын моделийг хийж өгнө.
    state.recipe = new Recipe(id);

    // 3) UI дэлгэцийг бэлтгэнэ.
    clearRecipe();
    renderLoader(elements.recipeDiv);
    highlightSelectedRecipe(id);

    // 4) Жороо татаж  авчирна.
    await state.recipe.getRecipe();

    // 5) Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно.
    clearLoader();
    state.recipe.calcTime();
    state.recipe.calcHuniiToo();

    // 6) Жороо дэлгэцэнд гаргана.
    renderRecipe(state.recipe, state.likes.isLiked(id));
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach((e) =>
  window.addEventListener(e, controlRecipe)
);

window.addEventListener("load", (e) => {
  // Шинээр Лайк моделийг апп дөнгөж ачаалагдахад үүснэ.
  if (!state.likes) state.likes = new Likes();

  // Like цэсийг гаргах эсэхийг шийдэх.
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());

  // Лайкууд байвал тэдгээрийг цэсэнд нэмж харуулна.
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

/**
 * Найрлаганы контроллер
 */

const controlList = () => {
  // Найрлаганы моделийг үүсгэнэ.
  state.list = new List();

  // Өмнө нь харагдаж байсан найрлагануудыг дэлгэцээс зайлуулна.
  listView.clearitems();

  // Уг модел рүү одоо харагдаж байгаа жорны бүх найрлагыг авч хийнэ.
  state.recipe.ingredients.forEach((n) => {
    // Тухайн найрлагыг модел рүү хийнэ.
    const item = state.list.addItem(n);

    // Тухайн найрлагыг дэлгэцэнд гаргана.
    listView.renderItem(item);
  });
};

/**
 * like controller
 */
const controlLike = () => {
  // 1) like-ын моделийг үүсгэнэ.
  if (!state.likes) state.likes = new Likes();

  // 2) Одоо харагдаж байгаа жорын ID-ийг олж авах.
  const currentRecipeId = state.recipe.id;

  // 3) Энэ жорыг like-сан шалгах эсэхийг шалгах.
  if (state.likes.isLiked(currentRecipeId)) {
    // like-сан бол Like-ийг болиулна.
    state.likes.deleteLike(currentRecipeId);
    // Лайкын цэснээс устгана.
    likesView.deleteLike(currentRecipeId);

    // Лайк товчны лайкласан байдлыг болиулах.
    likesView.toggleLikeBtn(false);
  } else {
    // like-лаагүй бол Like-на.
    const newLike = state.likes.addLike(
      currentRecipeId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.image_url
    );

    // Лайк цэсэнд энэ лайкыг оруулах.
    likesView.renderLike(newLike);

    // Лайк товчны лайкласан байдлыг лайкласан болгох.
    likesView.toggleLikeBtn(true);
  }

  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};

elements.recipeDiv.addEventListener("click", (e) => {
  if (e.target.matches(".recipe__btn, .recipe__btn *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});

elements.shoppingList.addEventListener("click", (e) => {
  // Click хийсэн li элементийн data-itemid аттрибутыг шүүж гаргаж авах.
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // Олдсон ID-тай орцыг моделоос устгана.
  state.list.deleteItem(id);

  // Дэлгэцээс ийм ID-тай орцыг олж устгана.
  listView(id);
});
