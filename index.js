const client = require('cheerio-httpcli')

const town = 31201 // tottori
const url = `http://www.tenki.jp/forecast/7/34/6910/${town}-daily.html`

client.setBrowser('chrome')
client.fetch(url, (err, $, res, body) => {
  const todayResult = getWeatherInfo($, "townLeftOneBox")
  const tomorrowResult = getWeatherInfo($, "townRightOneBox")
  const todayLines = generateLINETextList(todayResult)
  const tomorrowLines = generateLINETextList(tomorrowResult)
  const footer = ["", "see: http://www.tenki.jp/forecast/7/34/6910/31201-daily.html"]
  const snow = ["", "live camera: http://www.cgr.mlit.go.jp/tottori/livecam_road/tsunoi.asp"]
  
  const lines = todayLines.concat([" "])
                          .concat(tomorrowLines)
                          .concat(footer)
                          .concat(snow)
  postLine(lines.join("\n"))
})

function getWeatherInfo($, target) {
  const rains = []
  $(`#${target} .rainProbability td`).each(function(td) {
    rains.push($(this).text())
  })
  const result = {
    date:     $(`#${target} .townTitleArea`).text(),
    weather:  $(`#${target} .wethreDrtalIiconText`).text(),
    high:     $(`#${target} .highTemp .temp`).text(),
    highdiff: $(`#${target} .highTemp .tempdiff`).text(),
    low:      $(`#${target} .lowTemp .temp`).text(),
    lowdiff:  $(`#${target} .lowTemp .tempdiff`).text(),
    rain:     rains
  }
  return result
}

function generateLINETextList(result) {
  const today = result.date.trim().split("[")[0]
  const emoji = result.weather.replace(/晴/g, "☀️").replace(/雨/g, "☔️").replace(/曇/g, "☁️")
  
  const lines = []
  lines.push(`${emoji}`)
  lines.push(`${today}`)
  lines.push(`${result.weather} ${result.high}${result.highdiff} ${result.low}${result.lowdiff}`)
  lines.push(`00-06: ${result.rain.shift()}`)
  lines.push(`06-12: ${result.rain.shift()}`)
  lines.push(`12-18: ${result.rain.shift()}`)
  lines.push(`18-24: ${result.rain.shift()}`)
  
  return lines
}

function postLine(text) {
  const request = require("request")
  request.post('https://notify-api.line.me/api/notify', {
    headers: {"Authorization": `Bearer ${process.env.LINE_TOKEN}`},
    form: {message: text}
  }, function(error, response, body) {
    if (error) {
      console.log(error);
    }
  })  
}
