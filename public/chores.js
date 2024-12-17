function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
const chores = ["Clean out fridge", "Clean floor", "Clean bathroom"];

function drawNewChores() {
    firebase.database().ref('/users').on('value', snapshot => { 
        var tenants = [];
        for(tenant in snapshot.val()){
            if(snapshot.val()[tenant].livingSelect === "y"){
                tenants.push(snapshot.val()[tenant].name)
            }
        }



        var tenantsCOPY = tenants.map((x)=> x);
        var victim;
        let obj = {}
        for(chore in chores){
            if(tenantsCOPY.length != 0){
                victim = getRandomElement(tenantsCOPY);
                const index = tenantsCOPY.indexOf(victim);
                tenantsCOPY.splice(index, 1);
                console.log(tenants, tenantsCOPY)
            }else{
                victim = getRandomElement(tenants);
                console.log(tenants, tenantsCOPY)
            }
            obj[chore] = victim

        }
        let datez = new Date()
        console.log(obj)
        firebase.database().ref('/chores').set({
            "Clean out fridge":obj[0],
            "Clean floor":obj[1],
            "Clean bathroom":obj[2],
            "month":datez.getMonth()+1
        });
    });

}


document.addEventListener('DOMContentLoaded', function() {
    var storageRef = firebase.storage().ref();

    firebase.database().ref('/users').on('value', snapshot => { 




        firebase.database().ref('/chores').on('value', snapshot1 => { 


            console.log(snapshot1.val())
            console.log(document.getElementById(chores[0]))
        
            document.getElementById(chores[0]).textContent = snapshot1.val()[chores[0]];
            document.getElementById(chores[1]).textContent = snapshot1.val()[chores[1]];
            document.getElementById(chores[2]).textContent = snapshot1.val()[chores[2]];

            console.log(snapshot.val()[btoa(snapshot1.val()[chores[0]])])
            
            storageRef.child(`img/${snapshot.val()[btoa(snapshot1.val()[chores[0]])].img}`).getDownloadURL().then((url) => {
                document.getElementById("fridgeIMG").setAttribute('src', url);
            });
            storageRef.child(`img/${snapshot.val()[btoa(snapshot1.val()[chores[1]])].img}`).getDownloadURL().then((url) => {
                document.getElementById("floorIMG").setAttribute('src', url);
            });
            storageRef.child(`img/${snapshot.val()[btoa(snapshot1.val()[chores[2]])].img}`).getDownloadURL().then((url) => {
                document.getElementById("bathroomIMG").setAttribute('src', url);
            });

            


        });


        /*for(tenant in snapshot.val()){
            if(snapshot.val()[tenant].livingSelect === "y"){
                tenants.push(snapshot.val()[tenant].name)
            }
        }*/

});




    firebase.database().ref('/chores').on('value', snapshot2 => { 
        function updateCountdown() {
            const now = new Date();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            const timeRemaining = endOfMonth - now;

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            document.getElementById('countdownTimer').textContent =
                `${days}d ${hours}h ${minutes}m ${seconds}s`;

            if(snapshot2.val()['month'] != now.getMonth()+1){
                drawNewChores()
            }
        }

        setInterval(updateCountdown, 1000);
    })


    firebase.auth().onAuthStateChanged(user => {
        if(user){
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
})