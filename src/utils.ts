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

  countryNameAlign: (countryName: string) => {
    let alignedCountryName;

    switch (countryName) {
      case "Czechia":
        alignedCountryName = "Czech Republic";
        break;
      case "Korea, South":
        alignedCountryName = "South Korea";
        break;
      case "Mainland China":
        alignedCountryName = "China";
        break;
      case "US":
      case "USA":
        alignedCountryName = "United States";
        break;
      default:
        alignedCountryName = countryName;
    }

    if (alignedCountryName.indexOf("*") !== -1) {
      alignedCountryName = alignedCountryName.split("*").join("");
    }

    return alignedCountryName;
  },
};

export default utils;
