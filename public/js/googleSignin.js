let googleUser = {};

// gapi.load("auth2", () => {
//   auth2 = gapi.auth2.init({
//     client_id: googleClientId,
//     cookiepolicy: "single_host_origin",
//   });

//   auth2.attachClickHandler(
//     document.getElementById("google-button"),
//     {},
//     (googleUser) => {
//       id_token = googleUser.getAuthResponse().id_token;
//       const googleButton = document.getElementById("google-button");
//       const colorElement = googleButton.parentNode;
//       colorElement.innerHTML = "Verifying...";

//       fetch(window.location.href, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           token: id_token,
//         }),
//       }).then((response) => {
//           if (response.status == 200) {
//             colorElement.innerHTML = "";
//             for (const color of Object.keys(colors)) {
//               colorElement.innerHTML += `<input ${
//                 color == selectedColor ? 'checked=""' : ""
//               } onchange="updateColor(event);" type="radio" name="color" style="background-color: ${
//                 colors[color]
//               };" color="${color}"></div>`;
//             }
//             response.json().then((json) => {
//               generateCountdown(placeButton, json.cooldown);
//             });
//           } else {
//             response.text().then((text) => {
//               colorElement.innerHTML = text;
//             });
//           }
//       });
//     }
//   );
// });

function handleCredentialResponse(a) {
  console.log(a)
}