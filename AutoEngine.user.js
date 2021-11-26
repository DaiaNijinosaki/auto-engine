// ==UserScript==
// @name         AutoEngine
// @namespace    http://tampermonkey.net/
// @version      1
// @description  try to take over the world!
// @author       You
// @match        https://www.wordengine.jp/flashwords.html*
// @match        https://www.wordengine.jp/my_page.html*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

'use strict';

// function that run when flashwords.html
const flashwords = function() {
    const sleep = ms => new Promise( resolve => setTimeout(resolve, ms) );
    let time = 800;
    let timeWrong = 1500;

    const main = function() {
        const func = async function() {
            const response = localStorage.getItem('wordlist');

            for ( let i = 0; i < 15; i++ ) {
                let question = document.getElementsByClassName('question-wrapper')[i].innerText;
                let answerList = document.getElementsByClassName('answer-list');

                let questionRegExp = new RegExp("correct='true' seq='.' sound_url=''>" + question);

                if ( question === '' ) {
                    for ( let j = 0; j < 4; j++ ) {
                        let n = j + i * 3
                        if ( j < 3 && response.indexOf(answerList[n].innerText) != -1 ) {
                            answerList[n].click();
                            await sleep(time);
                            continue;
                        } else if ( j === 3 ) {
                            console.log("I don't know that.");
                            answerList[i * 3].click();
                            answerList[i * 3 + 1].click();
                            answerList[i * 3 + 2].click();
                            await sleep(timeWrong);
                            continue;
                        }
                    }
                };

                // matchに書き換える
                let questionPosition = response.search(questionRegExp);

                if ( questionPosition === -1 ) {
                    console.log("I don't know that.");
                    answerList[i * 3].click();
                    answerList[i * 3 + 1].click();
                    answerList[i * 3 + 2].click();
                    await sleep(timeWrong);
                    continue;
                }

                let answerPositionEnd = response.lastIndexOf('</text>', questionPosition);
                let answer = response.slice(0, answerPositionEnd);
                let answerPositionStart = answer.lastIndexOf('<text>');
                answer = answer.slice(answerPositionStart + 6);
                console.log(answer+' !');

                for ( let j = 0; j < 4; j++ ) {
                    let n = j + i * 3
                    if ( j < 3 && answerList[n].innerText == answer ) {
                        answerList[n].click();
                        break;
                    } else if ( j === 3 ) {
                        console.log("What's happened!?");
                        answerList[i * 3].click();
                        answerList[i * 3 + 1].click();
                        answerList[i * 3 + 2].click();
                        await sleep(timeWrong);
                        continue;
                    }
                }

                await sleep(time);
            }
            console.log("I've just finished my work!");
        }
        func();
    }

    document.addEventListener('keydown', event => {
        if ( event.key === 'a' ) {
            main();
        }
    });
};

// function that run when my_page.html
const mypage = function() {
    const myPageElem = document.getElementsByClassName('my-page')[0];
    const html = `
    <style>
        #config-main { background-color: white; margin-top: 15px; font-family: "Segoe UI Emoji", sans-serif; }
        #config-main>* { padding: 15px 5px; margin: 15px; }

        #config-header { font-weight: bold; padding: 15px 5px 0; margin: 0 15px; }
        .config-label { margin-top: 5px !important; color: #6D6D6D; }

        .config-strong { font-size: 17px; font-weight: bold; }
        .config-emoji { font-weight: normal; }
    </style>

    <section id="config-main">
        <h3 id="config-header"><span class="config-emoji">📘</span> AutoEngine is available!</h3>
        <div>
            <p class="config-strong">目標回答数 <span class="config-emoji">🎯</span></p>
            <form>
                <input>
                <button>設定</button>
            </form>
            <p class="config-label">現在の設定：<span class="config-strong" id="config-target-count">なし</span></p>
        </div>
        <div>
            <p class="config-strong">出題データを取得 <span class="config-emoji">📡</span></p>
            <button id="config-get-quiz-button">取得</button>
            <p class="config-label">現在のデータ：<span class="config-strong" id="config-quiz-acquisition-date"></span></p>
        </div>
    </section>
    `;

    myPageElem.insertAdjacentHTML('beforeend', html);

    const BLUE = '#00AEEF';
    const GREEN = '#0ABD67';
    const YELLOW = '#F4AC00';
    const GLAY = '#6D6D6D';

    const changeText = (elem, text, color) => {
        elem.innerText = text;
        elem.style.color = color;
    };

    const storage = localStorage;
    const quizAcquisitionDateElem = document.getElementById('config-quiz-acquisition-date');

    if ( storage.getItem('acquisitiondate') ) {
        changeText(quizAcquisitionDateElem, '✔️取得済！ ' + storage.getItem('acquisitiondate'), GREEN);
    } else {
        changeText(quizAcquisitionDateElem, 'まだ出題データを取得していません', GLAY);
    };

    const getQuizButtonElem = document.getElementById('config-get-quiz-button');
    getQuizButtonElem.addEventListener('click', () => {
        changeText(quizAcquisitionDateElem, '取得中…結構かかりますっ', YELLOW);

        let xmlHttpRequest = new XMLHttpRequest();
        // Get 490 words
        xmlHttpRequest.open('GET', 'https://www.wordengine.jp/vengine/api/studymode/getnewwordring3?sessionType=study&applicationId=18&wordCount=490&otherLanguageCode=ja', true);
        xmlHttpRequest.onload = (e) => {
            if ( xmlHttpRequest.readyState === 4 ) {
                if ( xmlHttpRequest.status === 200 ) {
                    console.log(xmlHttpRequest.response);
                    let response = xmlHttpRequest.response.match(/JTND.*JTNF/);
                    response = atob(response);
                    response = decodeURIComponent(response);

                    const date = new Date();
                    const currentDate = date.getFullYear() + '/' +
                                        (date.getMonth() + 1) + '/' +
                                        date.getDate() + ' ' +
                                        date.getHours() + ':' +
                                        date.getMinutes() + ':' +
                                        date.getSeconds();

                    storage.setItem('acquisitiondate', currentDate);
                    changeText(quizAcquisitionDateElem, '✔️取得済！ ' + currentDate, GREEN);

                    storage.setItem('wordlist', response);
                } else {
                    console.error(xmlHttpRequest.statusText);
                };
            };
        };
        xmlHttpRequest.onerror = (e) => {
            console.error(xmlHttpRequest.statusText);
        };

        xmlHttpRequest.send();
    });
};

(function() {
    console.log('AutoEngine is available!');
    document.title = 'AutoEngine';

    const url = window.location.href;

    if ( url.indexOf('flashwords') !== -1 ) {
        flashwords();
    }
    else if ( url.indexOf('my_page') ) {
        mypage();
    };
})();