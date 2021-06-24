const request = require('request');
const cheerio = require('cheerio');

// __mainScript__
request('http://genie.co.kr/WNQSH9', (error, response, html) => {
    if (!error && response.statusCode == 200) {
        let songid = [];
        let $ = cheerio.load(html);
        $('.list').each((i, el) => {
            let item = $(el).attr('songid');
            if (!!item) songid[i / 2 - 1 / 2] = item.toString();
        });
        let songkeyword = [];
        songid.forEach(elem => {
            let srchURL = "https://www.genie.co.kr/detail/songInfo?xgnm=" + elem.toString();
            request(srchURL, (error, response, html) => {
                if (!error && response.statusCode == 200) {
                    let $ = cheerio.load(html);
                    let songTitle = $('.info-zone').children('h2').text().replace(/\s\s+/g,"");
                    let artist = $('.info-zone .info-data li').first().text().replace(/\s\s+/g,"");
                    if (!!songTitle && !!artist) {
                        songkeyword.push(songTitle.toString() + artist.toString());
                    }
                }
                if (songid.length <= songkeyword.length) {
                    console.log(songkeyword);
                    // songkeyword 안의 각각의 제목을 melon 검색 형식으로 변경하여 request on melon search page
                    // 텍스트 전달시 query 를 그대로 전달하여도 검색 형식이 자동으로 완성되므로 url + 제목 + url (string) 이러한 형식이면 된다.
                }
            })
        })
    }
})

