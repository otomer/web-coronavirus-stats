const utils = {
  millisToMinutesAndSeconds: (millis: number) => {
    var minutes = Math.floor(millis / 60000);
    var seconds: any = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  },
  parseCommaNumber: (x: string) =>
    parseInt(parseFloat(x.replace(/,/g, "")) as any),

  log: (text: string, icon: string) => {
    console.log(`${icon}  ${new Date().toString()} - ${text}`);
  },

  isUpperCase(str: string) {
    return str === str.toUpperCase();
  },

  countryNameAlign: (country: string) => {
    if (country.indexOf("*") !== -1) {
      country = country.split("*").join("");
    }

    const fuzzy = (search: string[]) => {
      let cn = country;

      for (let i = 0; i < search.length; i++) {
        let itemToCompare = search[i];
        if (!utils.isUpperCase(itemToCompare)) {
          itemToCompare = itemToCompare.toLowerCase();
          cn = cn.toLowerCase();
        }
        if (cn.indexOf(itemToCompare) !== -1) {
          // console.log(cn + " includes: " + itemToCompare);
          return true;
        }
      }

      return false;
    };

    if (fuzzy(["Czechia"])) {
      country = "Czech Republic";
    } else if (fuzzy(["Korea", "Korea, South", "South Korean"])) {
      country = "South Korea";
    } else if (fuzzy(["Mainland China"])) {
      country = "China";
    } else if (fuzzy(["US", "USA", "United States of"])) {
      country = "United States";
    } else if (fuzzy(["Bolivian", "Bolivia"])) {
      country = "Bolivia";
    } else if (fuzzy(["Venezuela"])) {
      country = "Venezuela";
    } else if (fuzzy(["Viet Nam"])) {
      country = "Vietnam";
    } else if (fuzzy(["Russian Federation"])) {
      country = "Russia";
    } else if (fuzzy(["United Kingdom"])) {
      country = "United Kingdom";
    } else if (fuzzy(["Kosovo"])) {
      country = "Kosovo";
    } else if (fuzzy(["Iran"])) {
      country = "Iran";
    } else if (fuzzy(["Syrian"])) {
      country = "Syria";
    } else if (fuzzy(["Macedonia"])) {
      country = "North Macedonia";
    } else if (fuzzy(["Moldova"])) {
      country = "Moldova";
    } else {
      country = country;
    }

    return country;
  },
};

export default utils;
