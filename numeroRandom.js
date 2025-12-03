let intentos;
let num;

function piensaRandom() {
    intentos = 0;
    num = parseInt(Math.random() * 100);
    console.log("El número es: " + num)
}

function comprueba() {
    let numUser = parseInt(document.getElementById("numUser").value);
    let msg = "";
    console.log(numUser)
    if (numUser < num) {
        msg = "El número es más grande";
        intentos++;
    } else {
        if (numUser > num) {
            msg = "El número es más pequeño";
            intentos++;
        } else {
            msg = "Has acertado el número: " + num + " en " + intentos + " intentos.";
        }
    }
    console.log(msg);
    document.getElementById("mensajeUser").innerHTML=msg;
}
