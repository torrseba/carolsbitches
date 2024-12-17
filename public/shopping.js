
function remove(el) {
    console.log("click")
    var element = el;
    console.log(element)
    firebase.database().ref(`/shopping/house/${el}`).remove()
    //element.remove();
}

function removePersonal(el, username) {
    console.log("click")
    var element = el;
    console.log(element)
    firebase.database().ref(`/shopping/personal/${btoa(username)}/${el}`).remove()
    //element.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    var storageRef = firebase.storage().ref();
    const houseForm = document.getElementById("houseForm")
    const personalForm = document.getElementById("personalForm")


    houseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var val = document.getElementById("hname").value
        if(val){
            var num = Math.random()*5000
            firebase.database().ref(`shopping/house/${Math.floor( num )}`).set({
                [Math.floor( num )]: val
            });
        }
    });




    firebase.auth().onAuthStateChanged(user => {

        if(user){
            const username = user.email.split('@')[0]

            console.log(user.email.split('@')[0])
            firebase.database().ref(`users/${btoa(user.email.split('@')[0])}`).on('value', snapshot => {
                console.log(btoa(user.email.split('@')[0]))
                storageRef.child(`img/${snapshot.val().img}`).getDownloadURL().then((url) => {
                    document.getElementById("userImage").setAttribute('src', url);
                });
            });

            firebase.database().ref('/shopping').on('value', snapshot => { 
                $('#houseShop').html("")
                for(item in snapshot.val().house){
                    $('#houseShop').append(`<li id="house" onclick="remove(${item})">${snapshot.val().house[item][item]}</li>`)
                }


                $('#personalShop').html("")
                for(item in snapshot.val().personal[btoa(username)]){
                    $('#personalShop').append(`<li id="shopping" onclick="removePersonal(${item}, '${username}')">${snapshot.val().personal[btoa(username)][item][item]}</li>`)
                }

            });


            personalForm.addEventListener('submit', function(event) {
                event.preventDefault();
                var val = document.getElementById("pname").value
                if(val){
                    var num = Math.random()*5000
                    firebase.database().ref(`shopping/personal/${btoa(user.email.split('@')[0])}/${Math.floor( num )}`).set({
                        [Math.floor( num )]: val
                    });
                }
            });


        }
        else{
            console.log("im not in")
            this.location.href = "/login.html"
        }
    })
})