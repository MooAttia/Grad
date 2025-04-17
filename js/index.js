

/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', '../particles.json', function() {
    console.log('callback - particles.js config loaded');
  });

  var typed1 = new Typed('#welcome', {
    strings: ['Welcome to '],
    typeSpeed: 100,
    backDelay: 500,
    showCursor: false,
    onComplete: function () {
      setTimeout(() => {
        var typed2 = new Typed('#element', {
          strings: ['GeoLens'],
          typeSpeed: 150,
          backDelay: 500,
          showCursor: false,
          onComplete: function () {
            setTimeout(() => {
              var typed3 = new Typed('#desc', {
                strings: ['AI-Powered Satellite Image Annotation '],
                typeSpeed: 100,
                backDelay: 1000,
                showCursor: false,
                onComplete: function () {
                  setTimeout(() => {
                    typed1.destroy();
                    typed2.destroy();
                    typed3.destroy();
                    setTimeout(() => location.reload(), 500); // Restart animation
                  }, 1000);
                }
              });
            }, 500);
          }
        });
      }, 500);
    }
  });
  
  // input file text 
  function updateLabel(input) {
    const fileName = input.files.length > 0 ? input.files[0].name : "No file chosen";
    document.getElementById("file-name").textContent = fileName;
}

// image uplaoded 


// sign up 

// var alertRedInput = "#8C1010";
// var defaultInput = "rgba(10, 180, 180, 1)";

// function userNameValidation(usernameInput) {
//     var username = document.getElementById("username");
//     var issueArr = [];
//     if (/[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(usernameInput)) {
//         issueArr.push("No special characters!");
//     }
//     if (issueArr.length > 0) {
//         username.setCustomValidity(issueArr);
//         username.style.borderColor = alertRedInput;
//     } else {
//         username.setCustomValidity("");
//         username.style.borderColor = defaultInput;
//     }
// }

// function passwordValidation(passwordInput) {
//     var password = document.getElementById("password");
//     var issueArr = [];
//     if (!/^.{7,15}$/.test(passwordInput)) {
//         issueArr.push("Password must be between 7-15 characters.");
//     }
//     if (!/\d/.test(passwordInput)) {
//         issueArr.push("Must contain at least one number.");
//     }
//     if (!/[a-z]/.test(passwordInput)) {
//         issueArr.push("Must contain a lowercase letter.");
//     }
//     if (!/[A-Z]/.test(passwordInput)) {
//         issueArr.push("Must contain an uppercase letter.");
//     }
//     if (issueArr.length > 0) {
//         password.setCustomValidity(issueArr.join("\n"));
//         password.style.borderColor = alertRedInput;
//     } else {
//         password.setCustomValidity("");
//         password.style.borderColor = defaultInput;
//     }
// }