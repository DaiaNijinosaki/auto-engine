// ==UserScript==
// @name         AutoEngine
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Auto farming script for Word Engine
// @author       Yumekawa Dev
// @match        https://www.wordengine.jp/flashwords.html*
// @match        https://www.wordengine.jp/my_page.html*
// @match        https://www.wordengine.jp/studyreport.html*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

'use strict';

// function that run when flashwords.html
const flashwords = function() {
    const sleep = ms => new Promise( resolve => setTimeout(resolve, ms) );
    let time = 664;
    let timeWrong = 1500
    let interrupt = false;

    const main = function() {
        const func = async function() {
            const response = localStorage.getItem('wordlist');

            if ( !response ) {
                document.getElementsByClassName('courseListDisplayName')[0].innerText += '（出題データ未取得のため自動回答はされません！）';
                interrupt = true;
            };

            console.log('#########################');

            for ( let questionCount = 0; questionCount < 15; questionCount++ ) {
                if ( interrupt ) break;
                let answeredType = '';

                let question = document.getElementsByClassName('question-wrapper')[questionCount].innerText;
                let answerList = document.getElementsByClassName('answer-list');

                if ( question === '' ) {
                    console.log('Question: (sound)');

                    const currentAnswerList = [];

                    currentAnswerList.push(answerList[questionCount * 3 + 0]);
                    currentAnswerList.push(answerList[questionCount * 3 + 1]);
                    currentAnswerList.push(answerList[questionCount * 3 + 2]);
                    for ( const answer of currentAnswerList ) {
                        let answered = false;
                        let counter = 0;

                        let questionRegExp = new RegExp("correct='true' seq='.' sound_url=''>" + answer.innerText, 'g');
                        let questionMatches = response.match(questionRegExp);

                        if ( !questionMatches ) {
                            console.log("I don't know that.");
                            console.log('#########################');
                            answerList[questionCount * 3 + 0].click();
                            answerList[questionCount * 3 + 1].click();
                            answerList[questionCount * 3 + 2].click();
                            await sleep(timeWrong);
                            break;
                        }

                        for ( const match of questionMatches ) {
                            let index = response.indexOf(match);

                            while ( index !== -1 ) {
                                if ( index !== -1 ) {
                                    answerList[questionCount * 3 + counter].click();
                                    console.log('Answer: ' + answer.innerText);
                                    console.log('#########################');
                                    answered = true;
                                    await sleep(time);
                                    break;
                                }
                                index = response.indexOf(match, index + 1);
                            };
                            break;
                        };
                        if ( answered ) break;
                        if ( counter === 2 ) {
                            console.log("I don't know that.");
                            console.log('#########################');
                            answerList[questionCount * 3 + 0].click();
                            answerList[questionCount * 3 + 1].click();
                            answerList[questionCount * 3 + 2].click();
                            await sleep(timeWrong);
                            break;
                        }
                        counter++;
                    }
                    continue;
                };

                console.log('Question: ' + question);
                let questionRegExp = new RegExp("correct='true' seq='.' sound_url=''>" + question, 'g');
                let questionMatches = response.match(questionRegExp);

                let questionPositions = [];
                if ( questionMatches ) {
                    for ( const match of questionMatches ) {
                        let index = response.indexOf(match);

                        while ( index !== -1 ) {
                            questionPositions.push(index);
                            index = response.indexOf(match, index + 1);
                        };
                    };
                };

                if ( !questionPositions.indexOf(-1) || !questionMatches ) {
                    console.log("I don't know that.");
                    answerList[questionCount * 3 + 0].click();
                    answerList[questionCount * 3 + 1].click();
                    answerList[questionCount * 3 + 2].click();
                    console.log("#########################");
                    await sleep(timeWrong);
                    continue;
                }


                let counter = 1;

                for ( const pos of questionPositions ) {
                    answeredType = '';

                    const answerPositionStart = response.slice(0, pos).lastIndexOf("<text>");
                    let answer = response.slice(answerPositionStart + 6);
                    const answerPositionEnd = answer.indexOf('</text>');
                    answer = answer.slice(0, answerPositionEnd);

                    for ( let choiceOffset = 0; choiceOffset < 3; choiceOffset++ ) {
                        let choiceIndex = choiceOffset + questionCount * 3;

                        if ( ( choiceOffset < 3 ) && ( answerList[choiceIndex].innerText === answer ) ) {
                            console.log('Answer: ' + answer);
                            answerList[choiceIndex].click();
                            answeredType = 'found';
                            break;
                        } else if ( ( choiceOffset === 2 ) && ( questionPositions.length === counter ) ) {
                            console.log("What's happened!?");
                            answerList[questionCount * 3 + 0].click();
                            answerList[questionCount * 3 + 1].click();
                            answerList[questionCount * 3 + 2].click();
                            await sleep(timeWrong);
                            answeredType = 'notFound';
                            break;
                        };
                    };

                    if ( answeredType ) break;
                    counter++;
                };
//                 let answerPositionEnd = response.lastIndexOf('</text>', questionPosition);
//                 let answer = response.slice(0, answerPositionEnd);
//                 let answerPositionStart = answer.lastIndexOf('<text>');
//                 answer = answer.slice(answerPositionStart + 6);
//                 console.log(answer+' !');

//                 for ( let j = 0; j < 4; j++ ) {
//                     let n = j + i * 3
//                     if ( j < 3 && answerList[n].innerText == answer ) {
//                         answerList[n].click();
//                         break;
//                     } else if ( j === 3 ) {
//                         console.log("What's happened!?");
//                         answerList[i * 3].click();
//                         answerList[i * 3 + 1].click();
//                         answerList[i * 3 + 2].click();
//                         await sleep(timeWrong);
//                         continue;
//                     }
//                 }
                console.log('#########################');

                let sleepTime;
                if ( answeredType === 'found' ) sleepTime = time;
                if ( answeredType === 'notFound' ) sleepTime = timeWrong;

                await sleep(sleepTime);
            };
            console.log("I've finished my work!");
        };
        func();
    };

    const startAnswer = function() {
        const questionContainerElems = document.getElementsByClassName('question-container');
        if ( questionContainerElems.length > 0 ) {
            main();
            clearInterval(startAnswerObserver);
        };
    };

    const startAnswerObserver = setInterval(startAnswer, 100);

    window.addEventListener('keydown', (e) => {
        console.log(e.key);
        switch (e.key) {
            case 'Escape':
                interrupt = true;
                localStorage.setItem('targetDailyScore', 0);
                break;
            default:
                console.log('default');
        };
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
    </style>

    <section id="config-main">
        <h3 id="config-header">📘 AutoEngine is available!</h3>
        <div>
            <p class="config-strong">目標回答数 🎯</p>
            <form>
                <input id="config-target-input" type="number" min="0">
                <button id="config-set-target-button">設定</button>
            </form>
            <p class="config-label">現在の設定：<span class="config-strong" id="config-target-count"></span></p>
        </div>
        <div>
            <p class="config-strong">出題データを取得 📡</p>
            <button id="config-get-quiz-button">取得</button>
            <p class="config-label">現在のデータ：<span class="config-strong" id="config-quiz-acquisition-date"></span></p>
        </div>
    </section>
    `;

    myPageElem.insertAdjacentHTML('beforeend', html);

    const BLUE = '#00AEEF';
    const GREEN = '#0ABD67';
    const YELLOW = '#F4AC00';
    const RED = '#EF2551';
    const GLAY = '#6D6D6D';
    const TEAL = '#0082AA';

    const changeText = (elem, text, color) => {
        elem.innerText = text;
        elem.style.color = color;
    };

    const setTargetDailyScore = () => {
        const xmlHttpRequest = new XMLHttpRequest();

        xmlHttpRequest.open('GET', 'https://www.wordengine.jp/vengine/api/goalcorrectresponse/showCorrectResponseGoal?weeksBeforeFrom=0', true);
        xmlHttpRequest.onload = (e) => {
            if ( xmlHttpRequest.readyState === 4 ) {
                if ( xmlHttpRequest.status === 200 ) {
                    const currentDailyScore = xmlHttpRequest.responseXML.documentElement.getElementsByTagName('daily_cr_count')[0].textContent;
                    storage.setItem('targetDailyScore', storage.getItem('targetAnswerCount') !== '0' ? Number(currentDailyScore) + Number(storage.getItem('targetAnswerCount')) : 'Endless Mode');
                } else {
                    console.error(xmlHttpRequest.statusText);
                };
            };
        };
        xmlHttpRequest.onerror = (e) => {
            console.error(xmlHttpRequest.statusText);
        };

        xmlHttpRequest.send();
    };

    const storage = localStorage;

    setTargetDailyScore();

    const quizAcquisitionDateElem = document.getElementById('config-quiz-acquisition-date');

    if ( storage.getItem('acquisitiondate') ) {
        changeText(quizAcquisitionDateElem, '✔️取得済！ ' + storage.getItem('acquisitiondate'), GREEN);
    } else {
        changeText(quizAcquisitionDateElem, 'まだ出題データを取得していません', GLAY);
    };

    const setTargetButtonElem = document.getElementById('config-set-target-button');
    const targetInputElem = document.getElementById('config-target-input');
    const targetCountElem = document.getElementById('config-target-count');
    setTargetButtonElem.addEventListener('click', (e) => {
        e.preventDefault();
        const value = targetInputElem.value > 0 ? Math.trunc(targetInputElem.value) : 0;
        storage.setItem('targetAnswerCount', value);
        changeText(targetCountElem, value ? value : 'Endless Mode', value ? BLUE : TEAL);
        targetInputElem.value = '';
        setTargetDailyScore();
    });

    if ( storage.getItem('targetAnswerCount') > 0 ) {
        changeText(targetCountElem, storage.getItem('targetAnswerCount'), BLUE);
    } else {
        changeText(targetCountElem, 'Endless Mode', TEAL);
    };

    const getQuizButtonElem = document.getElementById('config-get-quiz-button');
    getQuizButtonElem.addEventListener('click', () => {
        changeText(quizAcquisitionDateElem, '取得中…結構かかりますっ', YELLOW);

        storage.setItem('acquisitiondate', '');
        storage.setItem('wordlist', '');

        new Promise((resolve) => {
            const xmlHttpRequest = new XMLHttpRequest();

            xmlHttpRequest.open('GET', 'https://www.wordengine.jp/vengine/api/userinfo/chooseSp?spId=59', true);
            xmlHttpRequest.onload = (e) => {
            if ( xmlHttpRequest.readyState === 4 ) {
                if ( xmlHttpRequest.status === 200 ) {
                    console.log('Set SP ID to 59');
                    resolve();
                } else {
                    console.error(xmlHttpRequest.statusText);
                    changeText(quizAcquisitionDateElem, '❌コース選択の通信に失敗しました', RED);
                };
            };
            };
            xmlHttpRequest.onerror = (e) => {
            console.error(xmlHttpRequest.statusText);
            };

            xmlHttpRequest.send();
        }).then(() => {
            const xmlHttpRequest = new XMLHttpRequest();

            // Get 490 words (over 490 may does not work)
            xmlHttpRequest.open('GET', 'https://www.wordengine.jp/vengine/api/studymode/getnewwordring3?sessionType=study&applicationId=18&wordCount=490&otherLanguageCode=ja', true);
            xmlHttpRequest.onload = (e) => {
                if ( xmlHttpRequest.readyState === 4 ) {
                    if ( xmlHttpRequest.status === 200 ) {
                        console.log(xmlHttpRequest.response);
                        if ( xmlHttpRequest.response.indexOf('Must select SP') !== -1 ) {
                            changeText(quizAcquisitionDateElem, '❌コース選択の設定に失敗しました', RED);
                        } else {
                            let response = xmlHttpRequest.response.match(/JTND.*JTNF/);
                            response = atob(response);
                            response = decodeURIComponent(response);

                            const date = new Date();
                            const currentDate = date.getFullYear() + '/' +
                                                (date.getMonth() + 1) + '/' +
                                                date.getDate() + ' ' +
                                                date.getHours() + ':' +
                                                ( '00' + date.getMinutes() ).slice(-2) + ':' +
                                                ( '00' + date.getSeconds() ).slice(-2);

                            storage.setItem('acquisitiondate', currentDate);
                            changeText(quizAcquisitionDateElem, '✔️取得済！ ' + currentDate, GREEN);

                            storage.setItem('wordlist', response);
                        };
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
    });
};

// function that run when studyreport.html
const studyreport = function() {
    const xmlHttpRequest = new XMLHttpRequest();

    xmlHttpRequest.open('GET', 'https://www.wordengine.jp/vengine/api/goalcorrectresponse/showCorrectResponseGoal?weeksBeforeFrom=0', true);
    xmlHttpRequest.onload = (e) => {
        if ( xmlHttpRequest.readyState === 4 ) {
            if ( xmlHttpRequest.status === 200 ) {
                const currentDailyScore = xmlHttpRequest.responseXML.documentElement.getElementsByTagName('daily_cr_count')[0].textContent;
                const needIStudyAgain = localStorage.getItem('targetDailyScore') === 'Endless Mode' ? true : (Number(currentDailyScore) < Number(localStorage.getItem('targetDailyScore')));

                console.log('@@@@@@@@@@@@@@@@@@@@@@@@@');
                console.log('[Current Daily Score: ' + currentDailyScore + ']');
                console.log('[Target Daily Score: ' + localStorage.getItem('targetDailyScore') + ']');
                console.log(needIStudyAgain ? 'Study Again' : 'Mission Accomplished!');
                console.log('@@@@@@@@@@@@@@@@@@@@@@@@@');

                const studyAgainElem = document.getElementsByClassName('footer-studyagain')[0];
                const myPageElem = document.getElementsByClassName('footer-mypage')[0];
                if ( needIStudyAgain ) {
                    studyAgainElem.click();
                } else {
                    const sound = new Audio('https://raw.githubusercontent.com/DaiaNijinosaki/auto-engine/master/accomplished.mp3');
                    sound.play();
                    sound.addEventListener('ended', () => {myPageElem.click();});
                };
            } else {
                console.error(xmlHttpRequest.statusText);
            };
        };
    };
    xmlHttpRequest.onerror = (e) => {
        console.error(xmlHttpRequest.statusText);
    };

    xmlHttpRequest.send();
};

(function() {
    console.log('AutoEngine is available!');
    document.title = 'AutoEngine';

    const url = window.location.href;
   if ( url.indexOf('flashwords') !== -1 ) {
        flashwords();
    }
    else if ( url.indexOf('my_page') !== -1 ) {
        mypage();
    }
    else if ( url.indexOf('studyreport') !== -1 ) {
        studyreport();
    }
})();