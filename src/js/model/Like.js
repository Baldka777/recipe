export default class Likes {
  constructor() {
    this.readDataFromLocalStorage();

    if (!this.likes) this.Likes = [];
  }

  addLike(id, title, publisher, img) {
    const like = { id, title, publisher, img };

    this.Likes.push(like);

    // Storage-руу хадгална.
    this.saveDataToLocalStorage();

    return like;
  }

  deleteLike(id) {
    // id гэдэг ID-тэй like-ийг индексийг массиваас хайж олно.
    const index = this.Likes.findIndex((el) => el.id === id);

    // Уг индекс дээрх элементийг массиваас устгана.
    this.Likes.splice(index, 1);

    // Storage-руу хадгална.
    this.saveDataToLocalStorage();
  }

  isLiked(id) {
    // if (this.Likes.findIndex((el) => el.id === id) === -1) return false;
    // else return true;
    return this.Likes.findIndex((el) => el.id === id) !== -1;
  }

  getNumberOfLikes() {
    return this.Likes.length;
  }

  saveDataToLocalStorage() {
    localStorage.setItem("likes", JSON.stringify(this.Likes));
  }

  readDataFromLocalStorage() {
    this.Likes = JSON.parse(localStorage.getItem("likes"));
  }
}
