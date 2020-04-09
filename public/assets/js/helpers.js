/*
=================================
Format date as datetime string
=================================
*/
const formatDate = (date) => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()} ${strTime}`;
};

/*
=================================
Numbers Formatting
=================================
*/
const numberWithCommas = (x) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const parseCommaNumber = (x) => parseInt(parseFloat(x.replace(/,/g, "")));

/*
=================================
URL Utils
=================================
*/

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function selectLast(arr, i) {
  return arr.slice(Math.max(arr.length - i, 0));
}

const convertDiffToTd = (diff, pos) => {
  let txt = "-",
    cls = "",
    arrow = "";

  const arrowUp = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="feather feather-arrow-up"
>
  <line x1="12" y1="19" x2="12" y2="5"></line>
  <polyline points="5 12 12 5 19 12"></polyline>
</svg>`;
  const arrowDown = `<svg
xmlns="http://www.w3.org/2000/svg"
width="24"
height="24"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
class="feather feather-arrow-down"
>
<line x1="12" y1="5" x2="12" y2="19"></line>
<polyline points="19 12 12 19 5 12"></polyline>
</svg>`;

  if (diff === 0) {
    txt = "-";
    cls = "";
  } else if (diff > 0) {
    txt = "+" + diff;
    if (pos) {
      cls = "decrease";
      arrow = arrowUp;
    } else {
      cls = "increase";
      arrow = arrowDown;
    }
  } else if (diff < 0) {
    txt = "" + diff;
    cls = "decrease";
  }

  return `<td class="${cls}">${txt}</td>`;
};

function getLang() {
  // browser
  if (navigator.languages !== undefined && navigator.languages.length) {
    return navigator.languages[0];
  }
  return (
    navigator.userLanguage ||
    navigator.language ||
    navigator.browserLanguage ||
    navigator.systemLanguage
  );
}
