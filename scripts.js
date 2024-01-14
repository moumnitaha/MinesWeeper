let board = document.querySelector(".board");
let bombsLeft = document.querySelector(".bombsleft");
let checkBox = document.querySelector(".checkbox");
let gameStatus = document.createElement("div");
let reload = document.createElement("div");
let range = document.querySelector(".range");
let timer = document.querySelector(".timer");
let darkMode = document.querySelector(".switch > input");
let switcher = document.querySelector(".switcher");
let burger = document.querySelector(".burger");
let bLur = document.querySelector(".blur");
let sideBar = document.querySelector("#sideBar");
let loading = document.querySelector(".loading");
let colors = [
  "#53a7db",
  "#138086",
  "#cd7672",
  "#eeb462",
  "#dc8665",
  "deeppink",
  "blueviolet",
  "aqua",
];
let levels = ["Easy", "Medium", "Hard"];
let bombAmount = 20;
let totalBombAmount;
let width = 10;
let height = 15;
let squares = [];
let shuffledArray = [];
let isFalg = false;
let gameOver = false;
let firstClick = true;
let toggler = true;
let stoggler = true;
let cheat = 0;
let counter = 0;
let interval;
let now;
let v = 0;
let fingerX = null;
let left = -75;
let pageWidth = window.innerWidth;

board.addEventListener("contextmenu", (e) => e.preventDefault());

function swipe() {
  document.addEventListener("touchstart", (e) => {
    fingerX = e.touches[0].clientX;
    if (parseFloat(sideBar.style.left)) left = parseFloat(sideBar.style.left);
  });
  document.addEventListener("touchmove", (e) => {
    if (((e.touches[0].clientX - fingerX) / pageWidth) * 100 >= 30) {
      sideBar.classList.add("showSideBar");
      burger.classList.add("rot");
      bLur.classList.add("notBlur");
      fingerX = e.touches[0].clientX;
    }
    if (((e.touches[0].clientX - fingerX) / pageWidth) * 100 <= -30) {
      sideBar.classList.remove("showSideBar");
      burger.classList.remove("rot");
      bLur.classList.remove("notBlur");
      fingerX = e.touches[0].clientX;
    }
  });
}

let int = setInterval(() => {
  if (v < 90) v += 10;
  document.querySelector("progress").value = v;
  if (document.readyState === "complete") {
    document.querySelector("progress").value = 100;
    clearInterval(int);
    setTimeout(() => {
      loading.remove();
      swipe();
    }, 1500);
  }
}, 500);

board.addEventListener("contextmenu", (e) => e.preventDefault());

range.addEventListener("change", () => setGame(range.value));
checkBox.onchange = () => (isFalg = checkBox.checked);

[burger, bLur].forEach((item) =>
  item.addEventListener("click", () => {
    sideBar.classList.toggle("showSideBar");
    burger.classList.toggle("rot");
    bLur.classList.toggle("notBlur");
  })
);

darkMode.addEventListener("change", (e) => {
  if (e.target.checked) {
    document.querySelector("html").classList.add("dark");
  } else {
    document.querySelector("html").classList.remove("dark");
  }
});

bombsLeft.addEventListener("click", () => {
  if (gameOver || firstClick) return;
  if (cheat === totalBombAmount) return;
  window.navigator.vibrate(100);
  cheat++;
  if (cheat === totalBombAmount)
    squares
      .filter((square) => square.className === "bomb")
      .forEach((square, index) =>
        setTimeout(() => setFlag(square), index * 30)
      );
});

document.querySelector(".title").addEventListener("click", () => {
  counter++;
  if (counter === 10) {
    localStorage.clear();
    counter = 0;
  }
});

const howToPlay = () => {
  if (toggler) {
    let div = document.createElement("div");
    div.className = "howToPlay";
    document.querySelectorAll(".items > *")[0].appendChild(div);
    div.innerHTML =
      "<ul><li>Tap on a square to open it.</li><li>The number indicates exactely how many mines there are surrounding that square.</li><li>If the number of the unopened squares touching a number matches that number, then we know that they are bombs.</li><li>When you find a mine, you can flag that square by pressing and holding it.</li><li>You lose when you step on a mine. At that point the game shows all the undiscovered mines.</li><li>To win, flag all the mines.</li></ul>";
    toggler = !toggler;
    return;
  }
  toggler = !toggler;
  document.querySelector(".howToPlay").remove();
};

document.querySelectorAll(".items > *")[0].addEventListener("click", howToPlay);

const showScores = () => {
  if (stoggler) {
    let ul = document.createElement("ul");
    ul.className = "bestScores";
    Object.keys(localStorage).filter((item) => levels.includes(item));
    document.querySelectorAll(".items > *")[1].appendChild(ul);
    if (Object.entries(localStorage).length) {
      for (let i = 0; i < Object.entries(localStorage).length; i++) {
        if (levels.includes(Object.keys(localStorage)[i])) {
          let li = document.createElement("li");
          li.innerHTML =
            Object.keys(localStorage)[i].bold() +
            Object.values(localStorage)[i];
          ul.appendChild(li);
        }
      }
    }
    stoggler = !stoggler;
    return;
  }
  stoggler = !stoggler;
  document.querySelector(".bestScores").remove();
};

document
  .querySelectorAll(".items > *")[1]
  .addEventListener("click", showScores);

function setToLocolStorage(level) {
  let lvl = levels[+level / 50];
  if (localStorage[lvl] < timer.textContent) return;
  if (cheat === totalBombAmount) return;
  if (level === "0") localStorage.setItem("Easy", timer.textContent);
  if (level === "50") localStorage.setItem("Medium", timer.textContent);
  if (level === "100") localStorage.setItem("Hard", timer.textContent);
}

function setGame(option) {
  if (isFalg) checkBox.checked = false;
  isFalg = false;
  cheat = 0;
  squares.forEach((square) => square.remove());
  squares.length = 0;
  shuffledArray.length = 0;
  firstClick = true;
  gameStatus.style.opacity = 0;
  setTimeout(() => {
    gameStatus.remove();
  }, 300);
  gameOver = false;
  if (option === "0") bombAmount = 20;
  if (option === "50") bombAmount = 30;
  if (option === "100") bombAmount = 40;
  timer.textContent = "00:00";
  createBoard();
  createSquares();
}

function createBoard() {
  totalBombAmount = bombAmount;
  let bombsArray = Array(bombAmount).fill("bomb");
  let emptyArray = Array(width * height - bombAmount).fill("square");
  shuffledArray = bombsArray.concat(emptyArray);
  shuffledArray.sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffledArray.length; i++) {
    if (
      (shuffledArray[i] === "bomb" &&
        shuffledArray[i + 1] === "bomb" &&
        shuffledArray[i + 10] === "bomb" &&
        shuffledArray[i + 11] === "bomb") ||
      (shuffledArray[i] === "bomb" &&
        shuffledArray[i + 1] === "bomb" &&
        shuffledArray[i + 2] === "bomb" &&
        shuffledArray[i + 3] === "bomb" &&
        shuffledArray[i + 4] === "bomb")
    ) {
      createBoard();
      return;
    }
  }
}

function createSquares(e) {
  for (let i = 0; i < width * height; i++) {
    let square = document.createElement("div");
    square.classList.add(shuffledArray[i]);
    square.setAttribute("id", i);
    squares.push(square);
    board.appendChild(square);
    if (square.className !== "bomb")
      square.setAttribute("data", setTotal(shuffledArray, i));
    square.addEventListener("click", () =>
      isFalg ? setFlag(square) : clickOn(i)
    );
    square.addEventListener("contextmenu", (e) => {
      if (square.classList.contains("checked")) return;
      setTimeout(() => window.navigator.vibrate(100), 40);
      e.preventDefault();
      setFlag(square);
    });
  }
}

function setTotal(array, i) {
  let total = 0;
  const isLeftEdge = i % width === 0;
  const isRightEdge = i % width === width - 1;
  //Left
  if (i > 0 && !isLeftEdge && array[i - 1] === "bomb") total++;
  //Right
  if (i < width * height - 1 && !isRightEdge && array[i + 1] === "bomb")
    total++;
  //Top
  if (i > width - 1 && array[i - width] === "bomb") total++;
  //Bottom
  if (i < width * (height - 1) && array[i + width] === "bomb") total++;
  //Top-Left
  if (i > width && !isLeftEdge && array[i - width - 1] === "bomb") total++;
  //Top-Right
  if (i > width - 1 && !isRightEdge && array[i - width + 1] === "bomb") total++;
  //Bottom-Left
  if (
    i < width * (height - 1) &&
    !isLeftEdge &&
    array[i + width - 1] === "bomb"
  )
    total++;
  //Bottom-Right
  if (
    i < width * (height - 1) - 1 &&
    !isRightEdge &&
    array[i + width + 1] === "bomb"
  )
    total++;
  // if (array[i] != "bomb") squares[i].textContent = total;
  bombsLeft.textContent = bombAmount + "/" + bombAmount;
  return total;
}

function setFlag(square) {
  if (firstClick) return;
  if (gameOver) return;
  if (!square.classList.contains("flag") && bombAmount < 1) return;
  let lastClass = square.className.split(" ")[0];
  if (square.className === "square checked") return;
  if (square.classList.contains("flag")) {
    square.className = lastClass;
    bombAmount++;
  } else {
    square.className += " flag";
    bombAmount--;
  }
  if (bombAmount.toString().length < 2) bombAmount = "0" + bombAmount;
  bombsLeft.textContent = bombAmount + "/" + totalBombAmount;
  //--------------------- You Win 🎉 ---------------------
  var flagedBombs = squares.filter(
    (square) => square.className === "bomb flag"
  );
  if (flagedBombs.length === totalBombAmount) checkWin();
}

function checkWin() {
  gameStatus.className = "boom";
  board.appendChild(gameStatus);
  setTimeout(() => (gameStatus.style.opacity = 1), 100);
  gameStatus.textContent = "You Win 🎉";
  window.navigator.vibrate(300);
  reload.className = "reload";
  gameStatus.appendChild(reload);
  reload.addEventListener("click", () => setGame(range.value));
  clearInterval(interval);
  range.disabled = false;
  squares.forEach((square, index) => {
    if (square.className === "square") clickOn(index);
  });
  squares
    .filter((square) => square.getAttribute("data") === "0")
    .forEach((square, index) =>
      setTimeout(() => (square.className += " snow"), index * 30)
    );
  setToLocolStorage(range.value);
}

function checkFirstClick(index) {
  if (shuffledArray[index] !== "bomb" && setTotal(shuffledArray, index) === 0) {
    squares.forEach((sq) => sq.remove());
    squares.length = 0;
    createSquares();
    return true;
  } else {
    createBoard();
    checkFirstClick(index);
  }
  clickOn(index);
}

function clickOn(currentId) {
  if (firstClick && checkFirstClick(currentId)) {
    now = Date.now();
    firstClick = false;
    range.disabled = true;
    interval = setInterval(() => (timer.textContent = formtTime(myTimer())), 0);
  }
  if (gameOver) return;
  if (
    squares[currentId].classList.contains("flag") ||
    squares[currentId].classList.contains("checked")
  )
    return;
  //------------- Game Over ------------
  if (shuffledArray[currentId] === "bomb") {
    checkGameOver(currentId);
    return;
  }
  if (+squares[currentId].getAttribute("data")) {
    squares[currentId].style.color =
      colors[+squares[currentId].getAttribute("data") - 1];
    squares[currentId].className += " checked";
    squares[currentId].textContent = squares[currentId].getAttribute("data");
    return;
  }

  squares[currentId].className += " checked";
  checkEmptySquare(currentId);
}

function checkGameOver(currentId) {
  squares[currentId].style.backgroundColor = "#e21744";
  squares[currentId].style.borderRadius = "10%";
  gameOver = true;
  squares.forEach((square) => {
    if (square.className === "bomb") {
      square.className += " isbomb checked";
      window.navigator.vibrate(300);
    }
    if (square.classList.contains("square")) {
      square.className += " checked";
      if (+square.getAttribute("data")) {
        square.textContent = square.getAttribute("data");
        square.style.color = colors[+square.getAttribute("data") - 1];
      }
      if (square.className === "square flag checked") {
        square.style.backgroundColor = "#ff9800";
        square.style.borderRadius = "10%";
        square.classList.remove("flag");
      }
    }
  });
  gameStatus.className = "boom";
  board.appendChild(gameStatus);
  setTimeout(() => (gameStatus.style.opacity = 1), 100);
  gameStatus.textContent = "Game Over !";
  reload.className = "reload";
  gameStatus.appendChild(reload);
  reload.addEventListener("click", () => setGame(range.value));
  clearInterval(interval);
  range.disabled = false;
}

function clickOnNeighborSquare(id) {
  if (squares[id].className !== "bomb") clickOn(+id);
}

function checkEmptySquare(currentId) {
  const isLeftEdge = currentId % width === 0;
  const isRightEdge = currentId % width === width - 1;

  setTimeout(() => {
    //Left
    if (currentId > 0 && !isLeftEdge) {
      clickOnNeighborSquare(squares[currentId - 1].id);
    }
    //Right
    if (currentId < width * height - 1 && !isRightEdge) {
      clickOnNeighborSquare(squares[currentId + 1].id);
    }
    //Top
    if (currentId > width - 1) {
      clickOnNeighborSquare(squares[currentId - width].id);
    }
    //Bottom
    if (currentId < width * (height - 1)) {
      clickOnNeighborSquare(squares[currentId + width].id);
    }
    //Top-Left
    if (currentId > width && !isLeftEdge) {
      clickOnNeighborSquare(squares[currentId - width - 1].id);
    }
    //Top-Right
    if (currentId > width - 1 && !isRightEdge) {
      clickOnNeighborSquare(squares[currentId - width + 1].id);
    }
    //Bottom-Left
    if (currentId < width * (height - 1) && !isLeftEdge) {
      clickOnNeighborSquare(squares[currentId + width - 1].id);
    }
    //Bottom-Right
    if (currentId < width * (height - 1) - 1 && !isRightEdge) {
      clickOnNeighborSquare(squares[currentId + width + 1].id);
    }
  }, 10);
}

function myTimer() {
  offset = Date.now() - now;
  return offset;
}

function formtTime(time) {
  let date = new Date(time);
  let minutes = date.getMinutes();
  let secondes = date.getSeconds();
  if (minutes.toString().length < 2) minutes = "0" + minutes;
  if (secondes.toString().length < 2) secondes = "0" + secondes;
  return minutes + ":" + secondes;
}

setGame(range.value);
