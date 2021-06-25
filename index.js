const request = require('request');
const cheerio = require('cheerio');
const randomUseragent = require('random-useragent');

// Melon -> https://www.melon.com/robots.txt -> acting like google bot can prevent rejection
let GBOT_UA = "Googlebot/2.1 (+http://www.google.com/bot.html)";

// __neededVar__
let genieplURL = 'http://genie.co.kr/WNQSH9';
structPL(genieplURL);

// __mainScript__
async function structPL(genieplURL) {
    let reqHeaders = {
        headers: {
            "User-Agent": randomUseragent.getRandom()
        },
        uri: genieplURL
    }
    try {
        let GSID = await reqGenieSID(reqHeaders);
        if (GSID.length !== 0) {
            console.log(GSID)
            let GSTT = await reqGenieSTT(GSID);
            if (GSTT.length !== 0) {
                console.log(GSTT);
                try {
                    let MSID = await reqMelonSID(GSTT);
                    if (MSID.length !== 0) {
                        console.log(MSID);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
    } catch (e) {
        console.log(e);
        structPL(reqHeaders);
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
            //console.log(songid.length, songkeyword.length, i);
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
    songkeyword.forEach(elem => {
        let melonURL = 'https://www.melon.com/search/total/index.htm?q=' + encodeURI(elem) + '&section=&linkOrText=T&ipath=srch_form';
        reqHeaders = {
            headers: {
                "User-Agent": GBOT_UA
            },
            uri: melonURL
        }
        let melonsongID = '';
        //console.log(melonURL);
        request(reqHeaders, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(html);
                melonsongID = $('.tb_list.d_song_list table tbody tr').first().first('td').find('.wrap.pd_none input').attr('value');
                    let melonreURL = 'https://www.melon.com/search/total/index.htm?q=' + encodeURI(elem[0]) + '&section=&linkOrText=T&ipath=srch_form';
                    reqHeaders = {
                        headers: {
                            "User-Agent": GBOT_UA
                        },
                        uri: melonreURL
                    }
                    request(reqHeaders, (error, response, html) => {
                        if (!error && response.statusCode == 200) {
                            let $ = cheerio.load(html);
                            if (!melonsongID) {
                                melonsongID = $('.tb_list.d_song_list table tbody tr').first().first('td').find('.wrap.pd_none input').attr('value');
                            }
                            melonSID.push(melonsongID);
                            // console.log(songkeyword.length, melonSID.length);
                            if (songkeyword.length === melonSID.length) {
                                resolve(melonSID);
                            }
                        } else reject(error);
                    })
            } else reject(error);
        })
    })
    })
}