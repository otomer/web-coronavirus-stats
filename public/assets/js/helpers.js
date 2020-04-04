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
    cls = "";

  if (diff === 0) {
    txt = "-";
    cls = "";
  } else if (diff > 0) {
    txt = "+" + diff;
    if (pos) {
      cls = "decrease";
    } else {
      cls = "increase";
    }
  } else if (diff < 0) {
    txt = "" + diff;
    cls = "decrease";
  }

  return `<td class="${cls}">${txt}</td>`;
};
