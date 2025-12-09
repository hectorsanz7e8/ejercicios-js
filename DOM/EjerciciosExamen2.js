let imagen = document.getElementById("imagen");
imagen.src="cuchilla.png";
imagen.alt="Imagen de una cuchilla";
imagen.setAttribute("MiAtributo","MiValor");

let newArticle = document.createElement("article");
newArticle.innerHTML = "<h3>Titulo del articulo</h3><p>Contenido del articulo</p>";
//document.body.appendChild(newArticle);
document.getElementById("main").appendChild(newArticle);