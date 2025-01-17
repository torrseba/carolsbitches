// Function to generate SHA-256 hex digest
async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    return hashHex;
  }

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');
    const createAccountForm = document.getElementById('createAccountForm');

    const userSelect = document.getElementById('userSelect');
    const userImage = document.getElementById('userImage');

    var storageRef = firebase.storage().ref();
    const password = 'fartfart'
    //var storage = firebase.storage();


    

  


    userSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const imgSrc = selectedOption.getAttribute('data-img');

        storageRef.child(`img/${imgSrc}`).getDownloadURL().then((url) => {
            userImage.setAttribute('src', url);
        });
    });

    $("#userSelect").html("<option value='' disabled selected>Select a user</option>")
    firebase.database().ref('/users').on('value', snapshot => { 
        for(i in snapshot.val()){
            $("#userSelect").append(`<option value='${snapshot.val()[i].name}' data-img='${snapshot.val()[i].img}'>${snapshot.val()[i].name}</option>`)
        }
    });

    loginButton.addEventListener('click', function() {
        loginUser();
    });

    createAccountForm.addEventListener('submit', function(event) {
        event.preventDefault();
        createAccount();
    });



    function loginUser() {
        const selectedUser = userSelect.value;
        if (selectedUser) {
            //alert(`Logging in as ${selectedUser}`);
            // Add logic to handle the login process
            firebase.auth().signInWithEmailAndPassword(`${selectedUser}@fartfart.com`, password).then(() => {
                this.location.href = "/"
            }).catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode, errorMessage)
              });
        } else {
            //alert('Please select a user to login.');
        }
    }



    async function createAccount() {
        var username = document.getElementById('newUsername').value;
        var username = username.toLowerCase()
        const livingSelect = document.getElementById('livingSelect').value;
        const photo = document.getElementById('uploadPhoto').files[0];
        const photoType = photo.name.split(".").slice(-1)[0]

        if (username && photo) {
            // Add logic to handle the account creation process

            const time = await digestMessage(new Date())
            const photoName = `${time}.${photoType}`
            console.log(photo.name, photoName);
            var imageRef = storageRef.child(`img/${photoName}`);
            imageRef.put(photo).on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.getElementById('uploadProgress').value = progress;
                console.log('Upload is ' + progress + '% done');

                if(progress == 100){
                    const email = `${username}@fartfart.com`
                    firebase.auth().createUserWithEmailAndPassword(email, password).then((credentials) => {
                        firebase.database().ref('users/' + btoa(username)).set({
                            name: username,
                            livingSelect: livingSelect,
                            img : photoName
                        });

                        console.log(credentials)
                        this.location.href = "/"
                    }).catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        console.log(errorMessage)
                        document.getElementById("errorID").innerText = errorMessage
                    });
                }
            },
            (error) => {
                console.error('Upload failed:', error);
                document.getElementById("errorID").innerText = 'Upload failed. Please try again.';
            })
            
            /*.then((snapshot) => {
                console.log('Uploaded a blob or file!');
                alert('Uploaded a blob or file!')
            });*/
        


            // const email = `${username}@fartfart.com`
            // firebase.auth().createUserWithEmailAndPassword(email, password).then((credentials) => {
            //     firebase.database().ref('users/' + btoa(username)).set({
            //         name: username,
            //         livingSelect: livingSelect,
            //         img : photo.name
            //     });

            //     console.log(credentials)
            //     this.location.href = "/"
            // }).catch((error) => {
            //     var errorCode = error.code;
            //     var errorMessage = error.message;
            //     console.log(errorMessage)
            //     document.getElementById("errorID").innerText = errorMessage
            //   });


        } else {
            document.getElementById("errorID").innerText = 'Please fill in all fields and upload a photo.'
        }
    }



});