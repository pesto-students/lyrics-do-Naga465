const BASE_URL = "https://api.lyrics.ovh";
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

// JSX and Event Listners --->  //

function onHandleChange(e) {
  console.log(e);
}

function onSearch() {
  let id = document.getElementById("search_query");
  const endPoint = `/suggest/${id.value}`;
  callApi(BASE_URL + endPoint, { method: "GET" }, renderLyricsSuggesstions);
}

function renderLyricsSuggesstions(response) {
  let bodyJsx = "";
  const { data = [], next = null, prev = null, total } = response;
  let footerJsx = getLyricsFooter(prev, next);
  data.forEach((item) => {
    const { artist = {}, title, id, next, prev } = item;
    bodyJsx += `<div class='lyric-list' id = ${id}> 
        <div>
           <label class="artist_name">${artist.name || ""}</label> - 
           <label>${title}</label>
        </div> 
        <button onclick = "getLyrics('${
          artist.name
        }','${title}')">Show Lyrics</button>
    </div>`;
  });
  return `<div class="lyrics-list-content">${bodyJsx}${footerJsx}</div>`;
}

function getLyrics(artist, title) {
  let endPoint = `/v1/${artist}/${title}`;
  callApi(
    BASE_URL + endPoint,
    { method: "GET" },
    renderLyricsDetails,
    artist,
    title
  );
}

function renderLyricsDetails(data, ...props) {
  const [artist, title] = props[0];
  let { lyrics } = data || {};
  return `<div class='lyric-details'>
            <div class='lyric-header'>
              <h1 class="">${artist}</h1> - 
              <h2>${title}</h2>
            </div> 
            <p class="lyrics">${lyrics || "No Lyrics added."}</p>
          </div>`;
}

// Pagination

function getLyricsFooter(prev, next) {
  let btnNext = next
    ? `<button onclick = "goToPage('${next}')">Next</button>`
    : "";
  let btnPrevious = prev
    ? `<button onclick = "goToPage('${prev}')">Previous</button>`
    : "";
  return `<div class ='footer-btns'>${btnPrevious}${btnNext}</div>`;
}

function goToPage(PAGE_URL) {
  callApi(
    PROXY_URL + PAGE_URL,
    { method: "GET", redirect: "follow" },
    renderLyricsSuggesstions
  );
}

//API Fetch

async function callApi(endPoint, customPayload = {}, callBack, ...args) {
  updateDom(loading)();
  const payload = {
    ...customPayload,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  try {
    const response = await fetch(endPoint, payload);
    if (response.status >= 400) {
      updateDom(loading)("Failed to load data from the server");
      throw Error("Resource Not Found");
    }
    const responseBody = await response.json();
    if (callBack && typeof callBack === "function") {
      updateDom(callBack)(responseBody, ...args);
      return;
    }
  } catch (error) {
    alert(error || "Something went wrong.Please try again after some time");
  }
  return responseBody;
}

// DOM manipulation

function updateDom(callBack) {
  let node = document.getElementById("app");
  const { children = [] } = node;
  if (children.length) {
    while (node.firstChild) {
      node.removeChild(node.lastChild);
    }
  }
  return function (data, ...args) {
    let jsx = callBack(data, args);
    node.insertAdjacentHTML("afterbegin", jsx);
  };
}

// Initiate Loading state

function loading(customText = "loading page...") {
  return `<p>${customText}</p>`;
}
