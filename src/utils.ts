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
};

export default utils;
