const MONTHS = ["FAKE_MONTH", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
let gigaUser;

function getRandomColor(opacity = 1) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


function createOrUpdateChart(chartInstance, context, config) {
    if (chartInstance) {
        chartInstance.destroy();
    }
    return new Chart(context, config);
}



document.addEventListener('DOMContentLoaded', function() {
    const addBeerButton = document.getElementById('addBeerButton');
        

    let ctx = document.getElementById('beerChart');
    let ctx24hr = document.getElementById('beerChart24hr');

    let beerChartInstance;
    let beerChart24hrInstance;




    var now = new Date();
    var month = now.getMonth() +1;
    var day = now.getDate();
    var year = now.getFullYear();

    var hour = now.getHours();
    var min = now.getMinutes();
    let datapieceTemplate = {
        label: '',
        data: [],
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: getRandomColor(),
        fill: false,
        tension: 0.4,
        pointStyle: new Image()
    }

firebase.database().ref(`/users`).once('value', snapshot => {
    let userToImage = {};
    for(user in snapshot.val()){
        let newcustomImage = new Image(30, 30)
        var storageRef = firebase.storage().ref();
        storageRef.child(`img/${snapshot.val()[user].img}`).getDownloadURL().then((url) => {
            newcustomImage.src = url;
        });
        userToImage[snapshot.val()[user].name] = newcustomImage;
    }


    firebase.database().ref(`/beer/${year}`).on('value', beer => {
        let datasets = [];
        let datasets24hr = [];
        let leaderboards = [];
        let beereroftheday = {'blache':0};

        for(user in snapshot.val()){
            let count = 0
            let datapiececopy = JSON.parse(JSON.stringify(datapieceTemplate));
            datapiececopy['pointStyle'] = userToImage[snapshot.val()[user].name]
            datapiececopy['label'] = snapshot.val()[user].name
            datapiececopy['borderColor'] = getRandomColor()
            datapiececopy['backgroundColor'] = `rgba(0, 0, 0, 0)`

            let count24hr = 0
            let datapiececopy24hr = JSON.parse(JSON.stringify(datapieceTemplate));
            datapiececopy24hr['pointStyle'] = userToImage[snapshot.val()[user].name]
            datapiececopy24hr['label'] = snapshot.val()[user].name
            datapiececopy24hr['borderColor'] = getRandomColor()
            datapiececopy24hr['backgroundColor'] = `rgba(0, 0, 0, 0)`

            let now = new Date();
            let dayBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

            let datavar = []
            let datavar24hr = []
            for(month in beer.val()){
                for(day in beer.val()[month]){
                    let daycount = 0;
                    for(transaction in beer.val()[month][day]){
                        if(Object.keys(beer.val()[month][day][transaction])[0] == snapshot.val()[user].name){
                            daycount+=1;
                            const timeof = beer.val()[month][day][transaction][snapshot.val()[user].name]
                            const hourof = timeof.split(':')[0]
                            const minuteof = timeof.split(':')[1]

                            if(((dayBefore.getMonth()+1 <= month) && ((month <= now.getMonth()+1))) || (now.getMonth()+1 == 1 && dayBefore.getMonth() == 12)){
                                if(((dayBefore.getDate() <= day) && ((day <= now.getDate()))) || (now.getDate() == 1 && (dayBefore.getDate() == day || now.getDate() == day))){
                                    let thismonth = month
                                    let thisday = day
                                    let thishour = hourof
                                    let thisminute = minuteof
                                    if(month < 10){
                                        thismonth = `0${month}`
                                    }if(day < 10){
                                        thisday = `0${day}`
                                    }
                                    if(hourof < 10){
                                        thishour = `0${thishour}`
                                    }if(minuteof < 10){
                                        thisminute = `0${thisminute}`
                                    }
                                    datavar24hr.push({x:`${year}-${thismonth}-${thisday}T${thishour}:${thisminute}:00`,y:datavar24hr.length+1})
                                }
                            }

                        }
                    }
                    if(daycount != 0){
                        count = count + daycount
                        let thismonth = month
                        let thisday = day
                        if(month < 10){
                            thismonth = `0${month}`
                        }if(day < 10){
                            thisday = `0${day}`
                        }

                        //NEW==============================================================
                        if(daycount >= Object.values(beereroftheday)[0]){
                            beereroftheday = {[snapshot.val()[user].name]: daycount}
                        }

                        let dayvar = `${year}-${thismonth}-${thisday}`
                        datavar.push({x: dayvar, y:count})
                    }
                }
            }


            leaderboards.push({[snapshot.val()[user].name] : count})
            

            datapiececopy['data'] = datavar;
            datasets.push(datapiececopy);

            datapiececopy24hr['data'] = datavar24hr;
            datasets24hr.push(datapiececopy24hr);

        }

        function cmpfnc(a, b){
            for(var first in a){
                for(var second in b){
                    return b[second] - a[first]
                }
            }
        }
        leaderboards.sort(cmpfnc)
        //console.log(leaderboards)

        for(var i in leaderboards){
            for(var user in leaderboards[i]){
                firebase.database().ref(`/leaderboards/topbeerer/${Number(i)+1}`).set({
                    [user]:leaderboards[i][user]
                })
            }
        }

        firebase.database().ref(`/leaderboards/topbeerer`).on('value', leaderboard => {
                Object.keys(leaderboard.val().slice(1,4)).forEach(userz => {
                    for(username in leaderboard.val()[Number(userz)+1])
                    storageRef.child(`img/${snapshot.val()[btoa(username)].img}`).getDownloadURL().then((url) => {
                        document.getElementById(`podium${Number(userz)+1}`).src = url;
                    });
                })

                $('#leaderboardlist').html('')
                Object.keys(leaderboard.val()).forEach(userz => {
                    for(username in leaderboard.val()[Number(userz)]){
                        $('#leaderboardlist').append(`<li>${username} - ${leaderboard.val()[Number(userz)][username]}`)
                    }

                })

                
        })


        //NEW=========================
        document.getElementById('beererofday').innerText = Object.keys(beereroftheday)
        storageRef.child(`img/${snapshot.val()[btoa(Object.keys(beereroftheday)[0])].img}`).getDownloadURL().then((url) => {
            document.getElementById(`daybeerImage`).src = url;
        });


    
    
        const data = {
            datasets: datasets
        };

        console.log(datasets24hr)

        const data24hr = {
            datasets: datasets24hr
        };

        const config24hr = {
            type: 'line',
            data: data24hr,
            options: {
                pointRadius: 10,
                responsive: true,
                maintainAspectRatio: false, // Set this to false to not maintain aspect ratio
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour', 
                            tooltipFormat: 'PPpp',  // Luxon format string for tooltip
                            displayFormats:{
                                hour:'HH:mm'
                            }
                        },
                        title: {
                            display: true,
                            text: 'hr'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'beers'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title:{
                        text: 'Last 24 hrs',
                        display: true
                    },
                    tooltip: {
                        usePointStyle: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                const item = tooltipItems[0];
                                const dataset = item.dataset;
                                const dataIndex = item.dataIndex;
                                return dataset.data[dataIndex].x;  // Display the specific day
                            }
                        }
                    }
                }
            }
        };
    
        const config = {
            type: 'line',
            data: data,
            options: {
                pointRadius: 10,
                responsive: true,
                maintainAspectRatio: false, // Set this to false to not maintain aspect ratio
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            tooltipFormat: 'PP'  // Luxon format string for tooltip
                        },
                        title: {
                            display: true,
                            text: 'month'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'beers'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title:{
                        text: 'This Year',
                        display: true
                    },
                    tooltip: {
                        usePointStyle: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                const item = tooltipItems[0];
                                const dataset = item.dataset;
                                const dataIndex = item.dataIndex;
                                return dataset.data[dataIndex].x;  // Display the specific day
                            }
                        }
                    }
                }
            }
        };

        beerChartInstance = createOrUpdateChart(beerChartInstance, ctx, config);
        beerChart24hrInstance = createOrUpdateChart(beerChart24hrInstance, ctx24hr, config24hr);
    
    });






    










});



    addBeerButton.addEventListener('click', function() {
        const now = new Date();
        const month = now.getMonth() +1;
        const day = now.getDate();
        const year = now.getFullYear();

        const hour = now.getHours();
        const min = now.getMinutes();

        const dateUpload = `${hour}:${min}`
        let numbeers;
        firebase.database().ref(`/beer/${year}/${month}/${day}`).once('value', snapshot => {
            //num = Object.keys(snapshot.val()).length + 1;
            if(snapshot.val() == null){
                numbeers = 1
            }else{
                numbeers = Object.keys(snapshot.val()).length + 1;
            }

            firebase.database().ref(`/beer/${year}/${month}/${day}/${numbeers}`).set({
                [gigaUser]:dateUpload
            });


        })

        

        console.log("beer logged!")

    });



});





document.addEventListener('DOMContentLoaded', function() {
    var storageRef = firebase.storage().ref();


    firebase.auth().onAuthStateChanged(user => {
        if(user){
            gigaUser = user.email.split('@')[0];
            console.log(user.email.split('@')[0])
            firebase.database().ref(`users/${btoa(user.email.split('@')[0])}`).on('value', snapshot => {
                console.log(btoa(user.email.split('@')[0]))
                storageRef.child(`img/${snapshot.val().img}`).getDownloadURL().then((url) => {
                    document.getElementById("userImage").setAttribute('src', url);
                });
            });


        }
        else{
            console.log("im not in")
            this.location.href = "/login.html"
        }
    })


    let customImage = new Image(20, 20)
    let customImage2 = new Image(20, 20)
    var storageRef = firebase.storage().ref();
    storageRef.child(`img/VIzWyUMojj50eL2SEwbO--1--v9gep.jpg`).getDownloadURL().then((url) => {
        customImage.src = url;
    });
    storageRef.child(`img/fbkPPT4jfE4ZCwqgcsWK--1--pzz66.jpg`).getDownloadURL().then((url) => {
        customImage2.src = url;
    });

    
})













