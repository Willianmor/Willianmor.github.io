//Carregando a Classe Data
import {Data} from "./data.js";
import {Maps} from "./maps.js";
import { MultiplesMap } from "./Multiples_Map.js";
//import { RadarChart } from "./Radar_Chart.js";
import { RadarMap } from "./Radar_Map.js";


var data_covid = new Data("./assets/dataset_covid_minerado_Normalizado_const-10att.csv","./assets/EstadosBR_IBGE_LLWGS84_1.geojson")
await data_covid.loadData()

let confsvg = {
    div: '#map', 
    width: 700, 
    height: 626, 
    top: 30, 
    left: 10, 
    bottom: 30, 
    right: 30
};

let confsvg2 = {
    div: '#RadarMap', 
    width: 1500, 
    height: 1500, 
    top: 30, 
    left: 10, 
    bottom: 30, 
    right: 30,
    title: "Radar Map - Covid"
};


//Testando o centro do mapa
let center_map1 = data_covid.calculateCenterMaps()
//console.log("CENTRO DO MAPA",center_map1)


//Variável 1
//Criar os dados necessários do SVG
let center_map = center_map1 //[-55.79779400006231, -13.6]

var mapa = new Maps(center_map,confsvg)


// //Inserir informações dos atributos/variáveis
 let name_attribute = data_covid.attributes[0]


// //Carregar o mapa com variable
mapa.render(data_covid.data_mapa, data_covid.final_structure, name_attribute)
console.log(data_covid.legend_by_coropletMap)
mapa.renderMapLegend(data_covid.legend_by_coropletMap,name_attribute)

// Radar Map
//let name_attribute1 = data_covid.attributes[1]
var mapa2 = new RadarMap(center_map,confsvg2)
mapa2.render(data_covid.data_mapa, data_covid.final_structure, data_covid.MAXVALUES,data_covid.MINVALUES)
mapa2.renderMapLegend(data_covid.attributes,data_covid.MAXVALUES,data_covid.MINVALUES, confsvg2.title)



let rj = data_covid.final_structure["RJ"]
console.log("------- RADARCHART;", rj)

 // getMaxValue()
//let radar_Chart = new RadarChart(rj,data_covid.MAXVALUES)
//radar_Chart.render()


var testemultiple = new MultiplesMap(data_covid)
//console.log("------- MultiplesMap;")

let extension = testemultiple.calculateExtensionAndCreateDivs()
testemultiple.renerMaps(extension, center_map)

console.log(data_covid.filename)
console.log("Está dentro do main")

