const request = require('request');
const cheerio = require('cheerio');
const randomUseragent = require('random-useragent');

// __mainScript__
let genieplURL = 'http://genie.co.kr/WNQSH9';
let reqHeaders = {
    headers: {
        "User-Agent": randomUseragent.getRandom()
    },
    uri: genieplURL
}

structPL(reqHeaders);

async function structPL(reqHeaders) {
    let GSID = await reqGenieSID(reqHeaders);
    if (GSID.length !== 0) {
        console.log(GSID)
        let GSTT = await reqGenieSTT(GSID);
        if (GSTT.length !== 0) {
            console.log(GSTT);
            let MSID = await reqMelonSID(GSTT);
            if (MSID.length !== 0) {
                console.log("!");
                console.log(MSID);
                console.log(melonSID);
            }
        }
    }
}

function reqGenieSID(reqHeaders) {
    return new Promise((resolve, reject) => {
        request(reqHeaders, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                let songid = [];
                let $ = cheerio.load(html);
                $('.list').each((i, el) => {
                    let item = $(el).attr('songid');
                    if (!!item) songid[i / 2 - 1 / 2] = item.toString();
                });
                // console.log(songid);
                resolve(songid);
            } else reject(error);
        })
    })
}

function reqGenieSTT(songid) {
    return new Promise((resolve, reject) => {
    let songkeyword = [];
    let i = 1;
    songid.forEach(elem => {
        let srchURL = "https://www.genie.co.kr/detail/songInfo?xgnm=" + elem;
        reqHeaders = {
            headers: {
                "User-Agent": randomUseragent.getRandom()
            },
            uri: srchURL
        }
        request(reqHeaders, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(html);
                let songTitle = $('.info-zone').children('h2').text().replace(/\s\s+/g, "");
                let artist = $('.info-zone .info-data li').first().text().replace(/\s\s+/g, "");
                if (!!songTitle && !!artist) {
                    songkeyword.push(songTitle.toString() + artist.toString());
                }
            } else reject(error);
            console.log(songid.length, songkeyword.length, i);
            if (songid.length == i) {
                resolve(songkeyword);
            }
            i += 1;
        })
    })
    })
}

function reqMelonSID(songkeyword) {
    return new Promise((resolve, reject) => {
    let melonSID = [];
    let j = 1;
    songkeyword.forEach(elem => {
        let melonURL = 'https://www.melon.com/search/total/index.htm?q=' + encodeURI(elem) + '&section=&linkOrText=T&ipath=srch_form';
        reqHeaders = {
            headers: {
                "User-Agent": randomUseragent.getRandom()
            },
            uri: melonURL
        }
        let melonsongID = '';
        request(reqHeaders, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(html);
                melonsongID = $('.tb_list.d_song_list table tbody tr').first().first('td').find('.wrap.pd_none input').attr('value');
                if (!melonsongID) {
                    let melonreURL = 'https://www.melon.com/search/total/index.htm?q=' + encodeURI(elem[0]) + '&section=&linkOrText=T&ipath=srch_form';
                    reqHeaders = {
                        headers: {
                            "User-Agent": randomUseragent.getRandom()
                        },
                        uri: melonreURL
                    }
                    request(reqHeaders, (error, response, html) => {
                        if (!error && response.statusCode == 200) {
                            let $ = cheerio.load(html);
                            melonsongID = $('.tb_list.d_song_list table tbody tr').first().first('td').find('.wrap.pd_none input').attr('value');
                            melonSID.push(melonsongID);
                            console.log(melonsongID);
                        } else reject(error);
                    })
                } else {
                    melonSID.push(melonsongID);
                    console.log(melonsongID);
                }
            } else reject(error);
        })
        if (songkeyword.length === j) {
            resolve(melonSID);
        } else console.log(melonSID)
        j += 1;
    })
    })
}