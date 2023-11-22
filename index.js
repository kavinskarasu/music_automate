const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const download = require("download");
const saveAs = require("file-saver");
let counter = 0;
async function getSong(url, n) {
  const https = require("https");
  const fs = require("fs");
  const path = require("path");

  const fileUrl = url;
  const destinationDirectory = "/home/kaviarasu/music_automate/files";
  const files = url.split("/");

  const fileName = `${files[5]}_file.zip`;

  // Create the directory if it doesn't exist
  if (!fs.existsSync(destinationDirectory)) {
    fs.mkdirSync(destinationDirectory, { recursive: true });
  }

  const destinationPath = path.join(destinationDirectory, fileName);
  const file = fs.createWriteStream(destinationPath);

  https
    .get(fileUrl, (response) => {
      response.pipe(file);

      file.on("finish", () => {
        file.close(() => {
          counter++;
          if (counter == n) console.log("File downloaded successfully.");
          console.log(
            "All files downloadedd  ..................................."
          );
        });
      });
    })
    .on("error", (err) => {
      fs.unlink(destinationPath, () => {
        counter++;
        if (counter == n)
          console.error(`Error downloading file: ${err.message}`);
        console.log(
          "All files downloadedd  ..................................."
        );
      });
    });
}

async function downloadSongs(link, n) {
  //console.log(link);
  const axiosResponse = await axios.request({
    method: "GET",
    url: link,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(axiosResponse.data);
  const download = [];
  $(".entry-content p a").each((i, songs) => {
    // console.log($(songs).attr("href"));
    const arr = $(songs).attr("href").split(".");
    if (arr[arr.length - 1] == "zip") getSong($(songs).attr("href"), n);
  });
}
async function performScraping() {
  const axiosResponse = await axios.request({
    method: "GET",
    url: "https://samadada.com/karan-songs/",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
  });
  const links = [];
  const $ = cheerio.load(axiosResponse.data);
  $("#inner-slider .letter-section ul li").each((i, song) => {
    let link = $(song).find("a").attr("href");
    links.push(link);
  });
  console.log(links.length);
  for (let i = 0; i < links.length; i++) {
    await downloadSongs(links[i], links.length);
  }
  //console.log(links);
}

performScraping();

app.listen(() => {
  console.log("server is running");
});
