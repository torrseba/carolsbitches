

document.addEventListener('DOMContentLoaded', function() {

    var storageRef = firebase.storage().ref();
    const storage = firebase.storage();

    async function getRandomImageUrl() {
        const storageRef = storage.ref().child('randimages');
        return storageRef.listAll().then(result => {
            const items = result.items;
            if (items.length === 0) {
                throw new Error("No images found in the storage bucket.");
            }
            const randomIndex = Math.floor(Math.random() * items.length);
            //console.log(items[randomIndex].getDownloadURL());
            return items[randomIndex].getDownloadURL();

        });
    }




    //Image stuff
    var imageElement = document.getElementById('randomImage');
    var quoteElement = document.getElementById('randomQuote');
    async function displayRandomImage() {

        imageElement.src = await getRandomImageUrl();
        imageElement.classList.add('fade-in');

        firebase.database().ref('/quotes').on('value', snapshot => {
            const randomIndex = Math.floor(Math.random() * snapshot.val().length)
            quoteElement.innerText = Object.values(snapshot.val()[randomIndex])[0]
        });
        //console.log(imageElement)

        /*setTimeout(() => {
            imageElement.classList.remove('fade-in');
            imageElement.classList.add('fade-out');
        }, 5000); // Stay visible for 5 seconds
        console.log(imageElement)

        setTimeout(() => {
            imageElement.classList.remove('fade-out');
        }, 7000); // Total duration: 5s visible + 2s fade-out*/
        
    }
    displayRandomImage();
    setInterval(displayRandomImage, 5000); // Cycle every 12 seconds (7s transition + 5s gap)




    document.getElementById('quoteForm').addEventListener('submit', function(event) {
        event.preventDefault();
    
        const quote = document.getElementById('quoteInput').value;
        const photo = document.getElementById('imageInput').files[0];
    
        if (!quote && !photo) {
            console.log('Please fill in the quote or select an image.');
            return;
        }
        if(quote){
            firebase.database().ref('/quotes').once('value', snapshot => {
                firebase.database().ref(`/quotes/${snapshot.val().length}`).set({
                    "quote":quote
                });

            });
        }

        
        if(photo){
            var imageRef = storageRef.child(`randimages/${photo.name}`);
            imageRef.put(photo).on('state_changed',
            (snapshot) => {
            },
            (error) => {
                console.error('Upload failed:', error);
                document.getElementById("errorID").innerText = 'Upload failed. Please try again.';
            })

        }
    
        // Here you can add the code to handle form submission, 
        // such as uploading the image to Firebase Storage and saving the quote to Firestore.
    
        console.log('Quote:', quote);
        console.log('Image File:', photo);
        
        // Clear the form
        document.getElementById('quoteForm').reset();
    });





    firebase.auth().onAuthStateChanged(user => {
        if(user){
            console.log(user.email.split('@')[0])
            firebase.database().ref(`/users`).on('value', snapshot => {
                //console.log(btoa(user.email.split('@')[0]))
                storageRef.child(`img/${snapshot.val()[btoa(user.email.split('@')[0])].img}`).getDownloadURL().then((url) => {
                    document.getElementById("userImage").setAttribute('src', url);
                });

                $('#footerDIV').html('');
                //console.log(snapshot.val())s
                Object.keys(snapshot.val()).forEach(userz => {
                    //console.log(snapshot.val()[userz].name)
                    storageRef.child(`img/${snapshot.val()[userz].img}`).getDownloadURL().then((url) => {
            
                        $('#footerDIV').append(`
                        <div class="user-item">
                            <img src="${url}" alt="User 1">
                            <span class="username">${snapshot.val()[userz].name}</span> 
                        </div>`)
                    });
                })
            });


        }
        else{
            console.log("im not in")
            this.location.href = "/login.html"
        }
    })
})