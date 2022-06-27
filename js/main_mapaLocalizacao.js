//Carregando a Classe Data
import {Maps} from "./maps_localizacao.js";

let confsvg = {
    div: '#map_localizacao', 
    width: 850, 
    height: 850, 
    top: 30, 
    left: 10, 
    bottom: 30, 
    right: 30
};



//Variável 1
//Criar os dados necessários do SVG
let center_map = [-55.79779400006231, -13.6]

let file_map = "./assets/EstadosBR_IBGE_LLWGS84_1.geojson"
var mapa = new Maps(center_map,confsvg, file_map)
// //Carregar o mapa com variable




// console.log(data_covid.filename)
console.log("Está dentro do main")

