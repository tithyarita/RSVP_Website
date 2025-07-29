// radios
const myRadio = document.getElementById("radioBox");
const myRadio1 = document.querySelector("#rad1").value;
console.log(myRadio1);

const myRadio2 = document.querySelector("#rad2").value;
console.log(myRadio2);

// fname and lname
const userFname = document.getElementById("fname").value;
console.log(userFname);
const userLname = document.getElementById("lname").value;

// email
const userEmail = document.getElementById("email").value;

// phonenumber
const userNum = document.getElementById("phoneNum").value;

// event
const userEvent = document.getElementById("event").value;

// camboBoxAdults
const mySelecting = document.getElementById("adults").value;
console.log(mySelecting);

// camboBoxChildren
const mySelecting2 = document.getElementById("child").value;
console.log(mySelecting);

// massageBox
const myMessageBox = document.getElementById("massageBox").value;

// submitBtn
const myBtn = document.getElementById("submitBtn");

//radio input
myRadio.addEventListener("change", function () {
    const myRadResult = document.querySelector('input[name="fav_language"]:checked')?.value;
    console.log(myRadResult);
});

//submit
myBtn.addEventListener("click", () => {
    const myRadResult = document.querySelector('input[name="fav_language"]:checked')?.value;

    const userFname = document.getElementById("fname").value;
    console.log(userFname);
    const userLname = document.getElementById("lname").value;


    // email
    const userEmail = document.getElementById("email").value;

    // phonenumber
    const userNum = document.getElementById("phoneNum").value;


    // event
    const userEvent = document.getElementById("event").value;

    // camboBoxAdults
    const mySelecting = document.getElementById("adults").value;
    console.log(mySelecting);

    // camboBoxChildren
    const mySelecting2 = document.getElementById("child").value;
    console.log(mySelecting);

    // massageBox
    const myMessageBox = document.getElementById("massageBox").value;


    const myData = {
        "attention": myRadResult,
        "firstName": userFname,
        "lastName": userLname,
        "email": userEmail,
        "phoneNumber": userNum,
        "events": userEvent,
        "adult": mySelecting,
        "children": mySelecting2,
        "massages": myMessageBox

    }

    localStorage.setItem("myUserData", JSON.stringify(myData));

    console.log(myData);




})


